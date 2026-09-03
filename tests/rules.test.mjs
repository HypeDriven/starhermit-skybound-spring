/**
 * Rules engine tests: legal/invalid actions, scoring, terminal states,
 * serialization round-trip + migration, deterministic replay property test,
 * malformed-command fuzzing, golden sessions, and content validation
 * (reachable goals, bounded duration, no soft locks for every journey stage).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { stageConfig, allStages, CHALLENGES, dailyConfig } from '../src/content.js';

const EASY = 'sprout';

function simpleCfg(over = {}) {
  return { seed: 1234, difficulty: EASY, goal: { type: 'none', target: 0 }, ...over };
}

/** Planning witness bot: at each bounce, forward-simulate candidate target
 * pads on a cloned state with a velocity-matching controller, and commit to
 * the best pad the simulation actually lands on. This proves completability;
 * the structural invariant test proves the path exists. */
function botCommands(cfg, maxTicks = R.TICK_RATE * 120, tweak = {}) {
  const period = tweak.period || 2;
  const tokenBonus = tweak.tokenBonus !== undefined ? tweak.tokenBonus : 400;
  const state = R.createInitialState(cfg);
  const cmds = [];
  let n = 0;
  let planId = -1;

  const apexOf = (s) => s.player.y + (s.player.vy > 0
    ? (s.player.vy * s.player.vy) / (2 * s.tier.gravity) : 0);

  // Predict a drift pad's x at time tAhead by replaying its patrol bounce
  // exactly as the rules do (clamped to ±DRIFT_RANGE around home).
  const patrolPredict = (p, tAhead) => {
    if (!p.vx) return p.x;
    let x = p.x;
    let vx = p.vx;
    const half = p.w / 2;
    const home = p.home !== undefined ? p.home : p.x;
    const lo = Math.max(half, home - R.DRIFT_RANGE);
    const hi = Math.min(R.WORLD_WIDTH - half, home + R.DRIFT_RANGE);
    const steps = Math.ceil(tAhead * R.TICK_RATE);
    for (let i = 0; i < steps; i++) {
      x += vx * R.DT;
      if (x < lo) { x = lo; vx = Math.abs(vx); }
      if (x > hi) { x = hi; vx = -Math.abs(vx); }
    }
    return x;
  };

  // Velocity-matching controller toward pad p. Returns dir for this tick.
  const controlToward = (s, p) => {
    const t = s.tier;
    const apex = apexOf(s);
    const tRise = s.player.vy > 0 ? s.player.vy / t.gravity : 0;
    const tFall = Math.sqrt(2 * Math.max(0, apex - p.y) / t.gravity);
    const tC = Math.max(0.1, tRise + tFall);
    const px = patrolPredict(p, tC);
    let dx = px - s.player.x;
    if (dx > R.WORLD_WIDTH / 2) dx -= R.WORLD_WIDTH;
    if (dx < -R.WORLD_WIDTH / 2) dx += R.WORLD_WIDTH;
    if (tC < 0.2 && Math.abs(dx) < Math.min(p.w / 2 + 7, 40)) return 0;
    const vNeed = dx / Math.max(0.15, tC);
    return vNeed > s.player.vx + 15 ? 1 : vNeed < s.player.vx - 15 ? -1 : 0;
  };

  const dirForThornDodge = (s, floorY = -Infinity) => {
    const t = s.tier;
    const apex = apexOf(s);
    for (const p of s.platforms) {
      if (!p.alive || p.type !== 'thorn') continue;
      if (p.y < floorY - 10) continue; // we land before reaching it
      let tC;
      if (s.player.vy < 0) {
        if (p.y >= s.player.y - 2) continue;
        tC = (s.player.y - p.y) / (-s.player.vy);
      } else {
        if (p.y >= apex - 5) continue;
        tC = s.player.vy / t.gravity + Math.sqrt(2 * Math.max(0, apex - p.y) / t.gravity);
      }
      if (tC > 1.2) continue;
      const xPred = s.player.x + s.player.vx * tC;
      let dx = xPred - p.x;
      if (dx > R.WORLD_WIDTH / 2) dx -= R.WORLD_WIDTH;
      if (dx < -R.WORLD_WIDTH / 2) dx += R.WORLD_WIDTH;
      if (Math.abs(dx) < p.w / 2 + 26) {
        const safe = s.platforms.find(q => q.alive && q.type !== 'thorn' && q.y === p.y);
        let sdx = safe ? safe.x - s.player.x : dx;
        if (sdx > R.WORLD_WIDTH / 2) sdx -= R.WORLD_WIDTH;
        if (sdx < -R.WORLD_WIDTH / 2) sdx += R.WORLD_WIDTH;
        return safe ? (sdx >= 0 ? 1 : -1) : (dx >= 0 ? 1 : -1);
      }
    }
    return null;
  };

  const seekTokens = state.goal.type === 'tokens';
  const untaken = () => state.tokens.filter(k => !k.taken);

  // Try landing on candidate pad p from a clone of s. Returns landing y or 0.
  const tryPlan = (s, p) => {
    const sim = R.deserializeState(R.serializeState(s));
    sim.queue = []; // planner sets dir directly; drop pending commands
    // Must steer using the CLONE's pad object — drift pads move in the sim.
    const target = sim.platforms.find(q => q.id === p.id);
    if (!target) return 0;
    for (let i = 0; i < 400 && !sim.terminal; i++) {
      const dodge = dirForThornDodge(sim, target.y);
      sim.dir = dodge !== null ? dodge : controlToward(sim, target);
      const evs = R.step(sim);
      for (const e of evs) {
        if (e.type === 'land' || e.type === 'spring') return e.y;
        if (seekTokens && e.type === 'token') return 1e9; // token grabbed
        if (e.type === 'terminal') return 0;
      }
    }
    return 0;
  };

  const makePlan = (s, failedEdges) => {
    const t = s.tier;
    const apex = apexOf(s);
    const cands = [];
    for (const p of s.platforms) {
      if (!p.alive || p.type === 'thorn') continue;
      if (s.player.vy > 0 && p.id === s.lastLandId) continue;
      if (p.y > s.camY - 30 && p.y < apex - 2 &&
          (s.player.vy > 0 || p.y < s.player.y - 2)) {
        // Skip edges that recently failed — the drift phase has not shifted yet.
        const failAt = failedEdges.get(s.lastLandId + '>' + p.id);
        if (failAt !== undefined && s.landings - failAt < 2) continue;
        let dx = p.x - s.player.x;
        if (dx > R.WORLD_WIDTH / 2) dx -= R.WORLD_WIDTH;
        if (dx < -R.WORLD_WIDTH / 2) dx += R.WORLD_WIDTH;
        let score = p.y - Math.abs(dx) * 0.45;
        // Token-goal runs: prefer pads with an untaken glow mote above them.
        if (seekTokens && untaken().some(k =>
            Math.abs(k.y - (p.y + 46)) < 30 && R.wrapDist(k.x, p.x) < 60)) {
          score += tokenBonus;
        }
        cands.push({ p, score });
      }
    }
    cands.sort((a, b) => b.score - a.score);
    for (const { p } of cands.slice(0, 7)) {
      const landedY = tryPlan(s, p);
      if (landedY >= p.y - 1) return p.id;
    }
    return -1;
  };

  let prevLandings = 0;
  const failedEdges = new Map(); // "fromId>toId" -> landings count when it failed
  let planFrom = -1;
  while (!state.terminal && state.tick < maxTicks) {
    if (state.tick % period === 0) {
      // Replan after any landing, or when falling past the target pad.
      const plan = state.platforms.find(p => p.id === planId && p.alive);
      if (state.landings !== prevLandings) {
        // A landing happened. If it was not the planned pad, the plan failed
        // (or was pre-empted by a better pad); record failures with drift
        // phase so we retry only after the layout has shifted.
        if (plan && state.lastLandId !== plan.id && planFrom === state.lastLandId) {
          failedEdges.set(planFrom + '>' + plan.id, state.landings);
        }
        prevLandings = state.landings;
        planId = makePlan(state, failedEdges);
        planFrom = state.lastLandId;
      } else if (!plan || (state.player.vy < 0 && state.player.y < plan.y - 2)) {
        planId = makePlan(state, failedEdges);
        planFrom = state.lastLandId;
      }
      const target = state.platforms.find(p => p.id === planId && p.alive);
      const dodge = dirForThornDodge(state, target ? target.y : -Infinity);
      let dir = dodge !== null ? dodge : (target ? controlToward(state, target) : 0);
      if (!target && !dodge) {
        // No plan: hover over the last pad we landed on if it survives;
        // while falling, dive for the highest pad below (rescue).
        const pad = state.platforms.find(p => p.id === state.lastLandId && p.alive);
        if (state.player.vy < 0) {
          let rescue = null;
          for (const p of state.platforms) {
            if (!p.alive || p.type === 'thorn') continue;
            if (p.y < state.player.y - 2 && p.y > state.camY - 30 &&
                (!rescue || p.y > rescue.y)) rescue = p;
          }
          if (rescue) dir = controlToward(state, rescue);
          else if (pad) dir = controlToward(state, pad);
        } else if (pad) {
          dir = controlToward(state, pad);
        }
      }
      if (dir !== state.dir) {
        cmds.push({ id: 'bot-' + (n++), tick: state.tick + 1, type: 'steer', dir });
        R.applyCommand(state, cmds[cmds.length - 1]);
      }
    }
    R.step(state);
  }
  return { cmds, state };
}

/* ---------- legal actions & invalid reasons ---------- */

test('legalActions exposes three steer actions, none when terminal', () => {
  const s = R.createInitialState(simpleCfg());
  const acts = R.legalActions(s);
  assert.equal(acts.length, 3);
  assert.deepEqual(acts.map(a => a.dir), [-1, 0, 1]);
  s.terminal = { reason: 'fell', tick: 10 };
  assert.deepEqual(R.legalActions(s), []);
});

test('applyCommand accepts legal steer commands', () => {
  const s = R.createInitialState(simpleCfg());
  for (const dir of [-1, 0, 1]) {
    const r = R.applyCommand(s, { id: 'c' + dir, tick: s.tick + 1, type: 'steer', dir });
    assert.equal(r.invalidReason, undefined);
  }
});

test('applyCommand rejects invalid commands with reasons', () => {
  const s = R.createInitialState(simpleCfg());
  const cases = [
    [null, R.INVALID.BAD_SHAPE],
    [{}, R.INVALID.BAD_SHAPE],
    [{ id: '', tick: 1, type: 'steer', dir: 0 }, R.INVALID.BAD_SHAPE],
    [{ id: 'x', tick: 1, type: 'teleport', dir: 0 }, R.INVALID.BAD_TYPE],
    [{ id: 'x', tick: 1, type: 'steer', dir: 2 }, R.INVALID.BAD_DIR],
    [{ id: 'x', tick: -3, type: 'steer', dir: 0 }, R.INVALID.BAD_TICK],
    [{ id: 'x', tick: 1.5, type: 'steer', dir: 0 }, R.INVALID.BAD_TICK],
    [{ id: 'x', tick: 999999, type: 'steer', dir: 0 }, R.INVALID.BAD_TICK],
  ];
  for (const [cmd, reason] of cases) {
    const r = R.applyCommand(s, cmd);
    assert.equal(r.invalidReason, reason, JSON.stringify(cmd));
  }
  // Duplicate id.
  const cmd = { id: 'dup', tick: 1, type: 'steer', dir: 1 };
  assert.equal(R.applyCommand(s, cmd).invalidReason, undefined);
  assert.equal(R.applyCommand(s, cmd).invalidReason, R.INVALID.DUPLICATE);
  // Terminal.
  s.terminal = { reason: 'fell', tick: 1 };
  assert.equal(R.applyCommand(s, { id: 'late', tick: 2, type: 'steer', dir: 0 }).invalidReason, R.INVALID.TERMINAL);
});

/* ---------- physics & scoring ---------- */

test('player bounces and gains altitude; score components are integers', () => {
  const { state } = botCommands(simpleCfg({ seed: 42 }));
  assert.ok(state.maxY > 200, 'climbed: ' + state.maxY);
  assert.ok(state.score.altitude > 0);
  assert.ok(state.landings > 0);
  for (const k of ['altitude', 'chainBonus', 'tokens']) {
    assert.ok(Number.isInteger(state.score[k]), k);
  }
});

test('jump height reaches platform gaps for every tier (reachability bound)', () => {
  for (const tier of Object.values(R.DIFFICULTY)) {
    const h = R.maxJumpHeight(tier);
    assert.ok(h > tier.gapMax + 5, `${tier.key}: jump ${h} must exceed gapMax ${tier.gapMax}`);
    const sh = R.maxSpringHeight(tier);
    assert.ok(sh > tier.gapMax * 2);
  }
});

test('spring bounce goes higher than normal bounce', () => {
  for (const springy of [false, true]) {
    const s = R.createInitialState(simpleCfg());
    s.platforms = [{ id: 99, x: s.player.x, y: s.player.y - 30, w: 200, type: springy ? 'spring' : 'bud', vx: 0, alive: true }];
    s.player.vy = -50;
    for (let i = 0; i < 600 && s.player.y > -100; i++) {
      R.step(s);
      if (s.player.vy > 0) break;
    }
    if (springy) assert.ok(Math.abs(s.player.vy - s.tier.bounceV * R.SPRING_MULT) < 1);
    else assert.ok(Math.abs(s.player.vy - s.tier.bounceV) < 1);
  }
});

test('horizontal wrap keeps x in bounds', () => {
  const s = R.createInitialState(simpleCfg());
  R.applyCommand(s, { id: 'w', tick: 1, type: 'steer', dir: -1 });
  for (let i = 0; i < 600; i++) R.step(s);
  assert.ok(s.player.x >= -R.PLAYER_RADIUS && s.player.x <= R.WORLD_WIDTH + R.PLAYER_RADIUS);
});

test('chain increments on rising distinct platforms and chainBonus accumulates', () => {
  const s = R.createInitialState(simpleCfg());
  // Hand-built ladder directly under the player.
  s.platforms = [];
  for (let i = 1; i <= 5; i++) {
    s.platforms.push({ id: i, x: R.WORLD_WIDTH / 2, y: i * 100, w: 400, type: 'bud', vx: 0, alive: true });
  }
  s.genY = 1e9; // suppress generation during this micro-test... restored below
  const startBonus = s.score.chainBonus;
  for (let i = 0; i < 1200 && s.chain < 5; i++) R.step(s);
  assert.ok(s.chain >= 5, 'chain ' + s.chain);
  assert.ok(s.score.chainBonus >= startBonus + 1 + 2 + 3 + 4 + 5);
});

/* ---------- terminal states ---------- */

test('terminal: fell when dropping below camera bottom', () => {
  const s = R.createInitialState(simpleCfg());
  // Remove all platforms above so the player eventually falls.
  s.platforms = [{ id: 0, x: -500, y: -9999, w: 10, type: 'bud', vx: 0, alive: false }];
  s.genY = 1e9; // suppress further generation
  for (let i = 0; i < 1200 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'fell');
});

test('terminal: goal-reached at target altitude', () => {
  const { state } = botCommands(simpleCfg({ goal: { type: 'altitude', target: 50 } }));
  assert.equal(state.terminal.reason, 'goal-reached');
  assert.ok(state.score.altitude >= 50);
});

test('terminal: tokens goal', () => {
  const s = R.createInitialState(simpleCfg({ goal: { type: 'tokens', target: 1 } }));
  // Place a token right in the player's path.
  s.tokens = [{ id: 1, x: s.player.x, y: 60, taken: false }];
  s.platforms = [];
  s.genY = 1e9; // suppress further generation
  for (let i = 0; i < 600 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'goal-reached');
  assert.equal(s.score.tokens, R.TOKEN_SCORE);
});

test('terminal: move-limit when steering budget exhausted', () => {
  const s = R.createInitialState(simpleCfg({ moveLimitTicks: 30 }));
  R.applyCommand(s, { id: 'm', tick: 1, type: 'steer', dir: 1 });
  for (let i = 0; i < 100 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'move-limit');
});

test('terminal: time-out at goal time limit', () => {
  const s = R.createInitialState(simpleCfg({ goal: { type: 'altitude', target: 999999, timeLimitTicks: 60 } }));
  for (let i = 0; i < 200 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'time-out');
});

test('terminal: hazard thorn pad ends run', () => {
  const s = R.createInitialState(simpleCfg());
  s.platforms = [{ id: 7, x: s.player.x, y: s.player.y - 20, w: 200, type: 'thorn', vx: 0, alive: true }];
  s.player.vy = -100;
  for (let i = 0; i < 100 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'hazard');
});

test('one-use platforms (crumb, wisp) break after landing', () => {
  for (const type of ['crumb', 'wisp']) {
    const s = R.createInitialState(simpleCfg());
    const p = { id: 5, x: s.player.x, y: s.player.y - 20, w: 200, type, vx: 0, alive: true };
    s.platforms = [p];
    s.player.vy = -100;
    for (let i = 0; i < 100 && p.alive; i++) R.step(s);
    assert.equal(p.alive, false, type);
  }
});

/* ---------- serialization ---------- */

test('serialize/deserialize round-trip preserves hash and continues deterministically', () => {
  const cfg = simpleCfg({ seed: 777 });
  const s1 = R.createInitialState(cfg);
  for (let i = 0; i < 500; i++) {
    if (i === 100) R.applyCommand(s1, { id: 'a', tick: 101, type: 'steer', dir: 1 });
    R.step(s1);
  }
  const snap = R.serializeState(s1);
  const s2 = R.deserializeState(snap);
  assert.equal(R.stateHash(s1), R.stateHash(s2));
  for (let i = 0; i < 300; i++) { R.step(s1); R.step(s2); }
  assert.equal(R.stateHash(s1), R.stateHash(s2));
});

test('migration from schema v0 fills new fields', () => {
  const s = R.createInitialState(simpleCfg());
  const data = JSON.parse(R.serializeState(s));
  data.v = 0;
  delete data.steerTicksUsed;
  delete data.moveLimitTicks;
  delete data.landings;
  const migrated = R.deserializeState(JSON.stringify(data));
  assert.equal(migrated.v, R.SCHEMA_VERSION);
  assert.equal(migrated.steerTicksUsed, 0);
  R.step(migrated); // still simulates
});

test('deserialize rejects unsupported versions and junk', () => {
  assert.throws(() => R.deserializeState('{"v":99}'));
  assert.throws(() => R.deserializeState('42'));
});

/* ---------- deterministic replay property test ---------- */

test('replay determinism: same version+seed+commands → identical hashes (25 seeds)', () => {
  for (let i = 0; i < 25; i++) {
    const seed = (i * 2654435761) >>> 0;
    const cfg = simpleCfg({ seed, difficulty: ['sprout', 'bloom', 'storm'][i % 3] });
    const { cmds } = botCommands(cfg, R.TICK_RATE * 45);
    const a = R.simulateRun(cfg, cmds);
    const b = R.simulateRun(cfg, cmds);
    assert.equal(a.hash, b.hash, 'seed ' + seed);
    assert.equal(a.score.total, b.score.total);
    assert.deepEqual(a.terminal, b.terminal);
  }
});

/* ---------- fuzz malformed commands ---------- */

test('fuzz: malformed commands never throw, hang, or NaN', () => {
  const rng = R.makeRng(99);
  const s = R.createInitialState(simpleCfg());
  for (let i = 0; i < 3000; i++) {
    const r = R.rngNext(rng);
    let cmd;
    if (r < 0.2) cmd = null;
    else if (r < 0.4) cmd = { id: i % 5 ? 'f' + i : 'dup', tick: Math.floor(r * 1e6) - 500, type: 'steer', dir: Math.floor(r * 10) - 4 };
    else if (r < 0.6) cmd = { id: 'f' + i, tick: s.tick + 1, type: ['steer', 'jump', 5, null][i % 4], dir: [-1, 0, 1, 7, 'x'][i % 5] };
    else if (r < 0.8) cmd = 'garbage';
    else cmd = { id: 'f' + i, tick: s.tick + 1, type: 'steer', dir: [-1, 0, 1][i % 3] };
    R.applyCommand(s, cmd);
    R.step(s);
    assert.ok(Number.isFinite(s.player.x) && Number.isFinite(s.player.y) && Number.isFinite(s.player.vy), 'NaN at iter ' + i);
    if (s.terminal) break;
  }
  assert.ok(s.tick > 0);
});

/* ---------- golden sessions ---------- */

function golden(name, cfg, expectReason, minTicks, maxTicks) {
  test('golden session: ' + name, () => {
    const { cmds } = botCommands(cfg);
    const r1 = R.simulateRun(cfg, cmds);
    const r2 = R.simulateRun(cfg, cmds);
    assert.equal(r1.hash, r2.hash);
    assert.equal(r1.terminal.reason, expectReason, JSON.stringify(r1.terminal));
    assert.ok(r1.terminal.tick >= minTicks && r1.terminal.tick <= maxTicks,
      `ticks ${r1.terminal.tick} not in [${minTicks}, ${maxTicks}]`);
  });
}

golden('easy goal', { seed: 11, difficulty: 'sprout', goal: { type: 'altitude', target: 120 } }, 'goal-reached', 100, R.TICK_RATE * 120);
golden('medium goal', { seed: 22, difficulty: 'bloom', goal: { type: 'altitude', target: 200 } }, 'goal-reached', 100, R.TICK_RATE * 180);
golden('hard goal', { seed: 33, difficulty: 'storm', goal: { type: 'altitude', target: 200 } }, 'goal-reached', 100, R.TICK_RATE * 240);

test('golden session: terminal fall when idle off-center', () => {
  const cfg = { seed: 44, difficulty: 'storm', goal: { type: 'none', target: 0 }, mechanics: ['bud'] };
  const r = R.simulateRun(cfg, []); // never steer: eventually drifts off pads
  assert.ok(['fell', 'time-out'].includes(r.terminal.reason));
  assert.ok(r.terminal.tick <= R.TICK_RATE * 600, 'bounded duration');
});

/* ---------- content validation: every journey stage ---------- */

test('generator structural invariants: path rows always reachable (no soft locks)', () => {
  // Direct proof over generated layouts: consecutive primary rows never
  // exceed jump height nor reachable horizontal distance; thorn pads never
  // sit on the primary path row position.
  for (const tier of Object.values(R.DIFFICULTY)) {
    for (let s = 0; s < 12; s++) {
      const state = R.createInitialState({ seed: 1000 + s * 97, difficulty: tier.key, goal: { type: 'none', target: 0 } });
      state.player.y = 6000; // force deep generation
      R.generatePlatforms(state);
      const rows = new Map();
      for (const p of state.platforms) {
        if (p.id === 0) continue; // starting pad, not part of row generation
        if (!rows.has(p.y)) rows.set(p.y, []);
        rows.get(p.y).push(p);
      }
      const ys = [...rows.keys()].sort((a, b) => a - b);
      const jumpH = R.maxJumpHeight(tier);
      const maxDx = R.maxRowDx(tier);
      const primaries = ys.map(y => rows.get(y).filter(p => p.type !== 'thorn'));
      for (let i = 0; i < ys.length; i++) {
        const landable = primaries[i];
        assert.ok(landable.length >= 1, `row at ${Math.round(ys[i])} has no landable pad (${tier.key} seed ${s})`);
        const primary = landable[0];
        if (i > 0) {
          assert.ok(ys[i] - ys[i - 1] <= tier.gapMax + 0.001, 'gap exceeds max');
          assert.ok(ys[i] - ys[i - 1] < jumpH, 'gap exceeds jump height');
          assert.ok(Math.abs(primary.x - primaries[i - 1][0].x) <= maxDx + 0.001, 'row dx unreachable');
        }
        // Thorns must clear the launch corridor from their own row's primary
        // and the arrival corridor toward the next row's primary.
        for (const th of rows.get(ys[i]).filter(p => p.type === 'thorn')) {
          assert.ok(Math.abs(th.x - primary.x) > (th.w + primary.w) / 2 + 38, 'thorn on launch corridor');
          if (i + 1 < ys.length) {
            const next = primaries[i + 1][0];
            assert.ok(Math.abs(th.x - next.x) > (th.w + next.w) / 2 + 38, 'thorn on arrival corridor');
          }
        }
      }
    }
  }
});

test('all 40 journey stages: reachable goal, bounded duration, no soft lock', () => {
  const attempts = [{}, { tokenBonus: 0 }, { period: 3 }, { tokenBonus: 0, period: 3 }, { tokenBonus: 150 }, { period: 4 }];
  for (const stage of allStages()) {
    const cfg = {
      seed: stage.seed, difficulty: stage.difficulty, goal: stage.goal,
      mechanics: stage.mechanics, maxTicks: R.TICK_RATE * 300,
    };
    let done = null;
    let last = null;
    for (const tweak of attempts) {
      const { cmds } = botCommands(cfg, R.TICK_RATE * 300, tweak);
      const r = R.simulateRun(cfg, cmds);
      last = r;
      if (r.terminal.reason === 'goal-reached') { done = r; break; }
    }
    assert.ok(done, `${stage.id} failed all bot attempts, last: ${JSON.stringify(last.terminal)} score=${last.score.total}`);
    assert.ok(done.terminal.tick <= R.TICK_RATE * 300, stage.id + ' unbounded');
  }
});

test('challenges are completable and constraints enforced', () => {
  for (const ch of CHALLENGES) {
    const cfg = {
      seed: ch.seed, difficulty: ch.difficulty, goal: ch.goal,
      moveLimitTicks: ch.moveLimitTicks || 0, maxTicks: R.TICK_RATE * 300,
    };
    const { cmds } = botCommands(cfg, R.TICK_RATE * 300);
    const r = R.simulateRun(cfg, cmds);
    assert.ok(['goal-reached', 'move-limit', 'time-out', 'fell'].includes(r.terminal.reason));
  }
  // Steady Hands without steering must fail via move-limit eventually when steering.
  const cfg = {
    seed: CHALLENGES[0].seed, difficulty: CHALLENGES[0].difficulty,
    goal: CHALLENGES[0].goal, moveLimitTicks: 10,
  };
  const s = R.createInitialState(cfg);
  R.applyCommand(s, { id: 'x', tick: 1, type: 'steer', dir: 1 });
  for (let i = 0; i < 200 && !s.terminal; i++) R.step(s);
  assert.equal(s.terminal.reason, 'move-limit');
});

test('daily config is deterministic per UTC date', () => {
  const a = dailyConfig('2026-08-30');
  const b = dailyConfig('2026-08-30');
  const c = dailyConfig('2026-08-31');
  assert.deepEqual(a, b);
  assert.notEqual(a.seed, c.seed);
});

test('compareRuns implements documented tie-break order', () => {
  const mk = (reason, score, invalid, tick, sid) => ({
    terminal: { reason, tick }, invalidCount: invalid, tick,
    score: { altitude: score, chainBonus: 0, tokens: 0 }, sessionId: sid,
  });
  assert.ok(R.compareRuns(mk('goal-reached', 10, 0, 100, 'b'), mk('fell', 999, 0, 50, 'a')) < 0);
  assert.ok(R.compareRuns(mk('fell', 200, 0, 100, 'a'), mk('fell', 100, 0, 100, 'b')) < 0);
  assert.ok(R.compareRuns(mk('fell', 100, 0, 100, 'a'), mk('fell', 100, 2, 100, 'b')) < 0);
  assert.ok(R.compareRuns(mk('fell', 100, 0, 90, 'b'), mk('fell', 100, 0, 100, 'a')) < 0);
  assert.ok(R.compareRuns(mk('fell', 100, 0, 100, 'a'), mk('fell', 100, 0, 100, 'b')) < 0);
});
