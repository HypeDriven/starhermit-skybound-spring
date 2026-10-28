// The rules tests' planning witness bot (from tests/rules.test.mjs), shared by
// the tests and tools/gen-plays.mjs: at each bounce it forward-simulates
// candidate pads on a cloned state with a velocity-matching controller and
// commits to the best pad the simulation actually lands on, dodging thorns.
// createBot().decide(state) gives the steering for the state's next tick;
// botCommands() plays a whole run deciding every `period` ticks.
import * as R from '../src/rules.js';

const apexOf = (s) => s.player.y + (s.player.vy > 0 ? (s.player.vy * s.player.vy) / (2 * s.tier.gravity) : 0);

// A drift pad's x at time tAhead, replaying its patrol bounce as the rules do.
function patrolPredict(p, tAhead) {
  if (!p.vx) return p.x;
  let x = p.x, vx = p.vx;
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
}

// Velocity-matching controller toward pad p: the dir for this tick.
function controlToward(s, p) {
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
}

function dirForThornDodge(s, floorY = -Infinity) {
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
}

/** A bot over a live state; `tweak`: { tokenBonus } (prefers pads under motes on token goals). */
export function createBot(tweak = {}) {
  const tokenBonus = tweak.tokenBonus !== undefined ? tweak.tokenBonus : 400;
  let planId = -1, planFrom = -1, prevLandings = 0;
  const failedEdges = new Map(); // "fromId>toId" -> landings count when it failed

  const tryPlan = (s, p, seekTokens) => {
    const sim = R.deserializeState(R.serializeState(s));
    sim.queue = []; // the planner sets dir directly
    const target = sim.platforms.find(q => q.id === p.id);
    if (!target) return 0;
    for (let i = 0; i < 400 && !sim.terminal; i++) {
      const dodge = dirForThornDodge(sim, target.y);
      sim.dir = dodge !== null ? dodge : controlToward(sim, target);
      const evs = R.step(sim);
      for (const e of evs) {
        if (e.type === 'land' || e.type === 'spring') return e.y;
        if (seekTokens && e.type === 'token') return 1e9;
        if (e.type === 'terminal') return 0;
      }
    }
    return 0;
  };
  const makePlan = (s) => {
    const seekTokens = s.goal.type === 'tokens';
    const untaken = s.tokens.filter(k => !k.taken);
    const apex = apexOf(s);
    const cands = [];
    for (const p of s.platforms) {
      if (!p.alive || p.type === 'thorn') continue;
      if (s.player.vy > 0 && p.id === s.lastLandId) continue;
      if (p.y > s.camY - 30 && p.y < apex - 2 && (s.player.vy > 0 || p.y < s.player.y - 2)) {
        const failAt = failedEdges.get(s.lastLandId + '>' + p.id);
        if (failAt !== undefined && s.landings - failAt < 2) continue;
        let dx = p.x - s.player.x;
        if (dx > R.WORLD_WIDTH / 2) dx -= R.WORLD_WIDTH;
        if (dx < -R.WORLD_WIDTH / 2) dx += R.WORLD_WIDTH;
        let score = p.y - Math.abs(dx) * 0.45;
        if (seekTokens && untaken.some(k => Math.abs(k.y - (p.y + 46)) < 30 && R.wrapDist(k.x, p.x) < 60)) score += tokenBonus;
        cands.push({ p, score });
      }
    }
    cands.sort((a, b) => b.score - a.score);
    for (const { p } of cands.slice(0, 7)) {
      const landedY = tryPlan(s, p, seekTokens);
      if (landedY >= p.y - 1) return p.id;
    }
    return -1;
  };

  return {
    /** The steering for the state's next tick. */
    decide(state) {
      const plan = state.platforms.find(p => p.id === planId && p.alive);
      if (state.landings !== prevLandings) {
        if (plan && state.lastLandId !== plan.id && planFrom === state.lastLandId) failedEdges.set(planFrom + '>' + plan.id, state.landings);
        prevLandings = state.landings;
        planId = makePlan(state);
        planFrom = state.lastLandId;
      } else if (!plan || (state.player.vy < 0 && state.player.y < plan.y - 2)) {
        planId = makePlan(state);
        planFrom = state.lastLandId;
      }
      const target = state.platforms.find(p => p.id === planId && p.alive);
      const dodge = dirForThornDodge(state, target ? target.y : -Infinity);
      let dir = dodge !== null ? dodge : (target ? controlToward(state, target) : 0);
      if (!target && dodge === null) {
        // no plan: hover over the last pad; while falling, dive for the highest pad below
        const pad = state.platforms.find(p => p.id === state.lastLandId && p.alive);
        if (state.player.vy < 0) {
          let rescue = null;
          for (const p of state.platforms) {
            if (!p.alive || p.type === 'thorn') continue;
            if (p.y < state.player.y - 2 && p.y > state.camY - 30 && (!rescue || p.y > rescue.y)) rescue = p;
          }
          if (rescue) dir = controlToward(state, rescue);
          else if (pad) dir = controlToward(state, pad);
        } else if (pad) dir = controlToward(state, pad);
      }
      return dir;
    },
  };
}

/** A whole run's steering commands, deciding every `tweak.period` (default 2) ticks. */
export function botCommands(cfg, maxTicks = R.TICK_RATE * 120, tweak = {}) {
  const period = tweak.period || 2;
  const state = R.createInitialState(cfg);
  const bot = createBot(tweak);
  const cmds = [];
  let n = 0;
  while (!state.terminal && state.tick < maxTicks) {
    if (state.tick % period === 0) {
      const dir = bot.decide(state);
      if (dir !== state.dir) {
        cmds.push({ id: 'bot-' + (n++), tick: state.tick + 1, type: 'steer', dir });
        R.applyCommand(state, cmds[cmds.length - 1]);
      }
    }
    R.step(state);
  }
  return { cmds, state };
}
