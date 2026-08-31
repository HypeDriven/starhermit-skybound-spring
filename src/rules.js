/**
 * Skybound Spring — rules engine.
 * Pure, deterministic, isomorphic ES module: no DOM, no three.js, no I/O.
 * Used by the browser bundle (via esbuild) and by server.js (via dynamic import)
 * to validate submitted replays.
 *
 * Simulation: fixed timestep at 120 Hz. One `step()` = one tick.
 * All authoritative values are integers or fixed-point-friendly numbers;
 * scores are integers.
 *
 * Terminal reasons: "fell" | "goal-reached" | "move-limit" | "time-out" | "hazard".
 * Tie-break order (documented per spec §2): primary objective completion,
 * fewer invalid actions, lower elapsed ticks, then stable session identifier.
 */

export const SCHEMA_VERSION = 1;
export const BUILD_VERSION = '1.0.0';
export const CONTENT_VERSION = 1;
export const TICK_RATE = 120;
export const DT = 1 / TICK_RATE;

export const WORLD_WIDTH = 480;      // horizontal wrap width in world units
export const PLAYER_RADIUS = 12;
export const CAM_OFFSET = 180;       // camera bottom sits this far under best height
export const FALL_MARGIN = 60;       // falling this far below camera bottom ends the run
export const GEN_AHEAD = 900;        // generate platforms this far above the player
export const DRIFT_RANGE = 34;       // moving pads patrol ± this around spawn
export const SPRING_MULT = 1.85;     // spring bounce velocity multiplier
export const TOKEN_SCORE = 100;
export const MAX_CHAIN_AWARD = 25;   // cap on per-landing chain award

export const TERMINAL_REASONS = ['fell', 'goal-reached', 'move-limit', 'time-out', 'hazard'];

export const INVALID = {
  BAD_SHAPE: 'bad-shape',
  BAD_TYPE: 'bad-type',
  BAD_DIR: 'bad-dir',
  BAD_TICK: 'bad-tick',
  TERMINAL: 'terminal',
  DUPLICATE: 'duplicate-command',
};

export const PLATFORM_TYPES = ['bud', 'drift', 'crumb', 'spring', 'wisp', 'thorn'];
// bud=normal, drift=moving, crumb=crumbling(one-use, sags), spring=high boost,
// wisp=fragile one-use, thorn=hazard.

/** Difficulty tiers. Heights guaranteed reachable: see test validator. */
export const DIFFICULTY = {
  sprout: {
    key: 'sprout', label: 'Sprout (easy)',
    gravity: 1400, bounceV: 700, steerAccel: 2500, maxVx: 280,
    gapMin: 55, gapMax: 118, width: 96,
    ratios: { drift: 0.06, crumb: 0.04, spring: 0.09, wisp: 0.03, thorn: 0.0 },
    tokenRate: 0.16,
  },
  bloom: {
    key: 'bloom', label: 'Bloom (medium)',
    gravity: 1600, bounceV: 750, steerAccel: 2600, maxVx: 295,
    gapMin: 60, gapMax: 128, width: 80,
    ratios: { drift: 0.13, crumb: 0.10, spring: 0.08, wisp: 0.05, thorn: 0.03 },
    tokenRate: 0.14,
  },
  storm: {
    key: 'storm', label: 'Storm (hard)',
    gravity: 1800, bounceV: 800, steerAccel: 2700, maxVx: 310,
    gapMin: 64, gapMax: 136, width: 66,
    ratios: { drift: 0.20, crumb: 0.16, spring: 0.07, wisp: 0.07, thorn: 0.07 },
    tokenRate: 0.12,
  },
};

/** Max jump height in world units for a tier (v^2 / 2g). */
export function maxJumpHeight(tier) {
  return (tier.bounceV * tier.bounceV) / (2 * tier.gravity);
}
export function maxSpringHeight(tier) {
  const v = tier.bounceV * SPRING_MULT;
  return (v * v) / (2 * tier.gravity);
}

/* ---------------- seeded RNG (mulberry32) ---------------- */

export function makeRng(seed) {
  return { s: seed >>> 0 };
}
export function rngNext(rng) {
  rng.s = (rng.s + 0x6d2b79f5) >>> 0;
  let t = rng.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function rngRange(rng, lo, hi) {
  return lo + rngNext(rng) * (hi - lo);
}

/** Circular horizontal distance in the wrapping world. */
export function wrapDist(a, b) {
  let d = Math.abs(a - b) % WORLD_WIDTH;
  return Math.min(d, WORLD_WIDTH - d);
}

/** FNV-1a 32-bit string hash (also used for seeds). */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* ---------------- canonical JSON + state hash ---------------- */

function canonicalize(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(canonicalize);
  const out = {};
  for (const k of Object.keys(v).sort()) out[k] = canonicalize(v[k]);
  return out;
}
export function canonicalJson(v) {
  // Round floats to fixed precision so hashes are stable across engines.
  const rounded = JSON.parse(JSON.stringify(canonicalize(v), (k, val) =>
    typeof val === 'number' ? Math.round(val * 1000) / 1000 : val));
  return JSON.stringify(rounded);
}
export function stateHash(state) {
  const s = stripState(state);
  return fnv1a(canonicalJson(s)).toString(16).padStart(8, '0');
}

/* ---------------- state construction ---------------- */

/**
 * Create the initial state for a run.
 * cfg: { seed, difficulty (key or tier object), goal:{type,target,timeLimitTicks?},
 *        moveLimitTicks?, maxTicks?, mechanics? (set of allowed platform types) }
 */
export function createInitialState(cfg) {
  const tier = typeof cfg.difficulty === 'string'
    ? DIFFICULTY[cfg.difficulty]
    : cfg.difficulty;
  if (!tier) throw new Error('unknown difficulty: ' + cfg.difficulty);
  const rng = makeRng((cfg.seed >>> 0) ^ 0x51e57ab1);
  const state = {
    v: SCHEMA_VERSION,
    seed: cfg.seed >>> 0,
    tierKey: tier.key,
    tier,
    tick: 0,
    dir: 0,
    queue: [],
    seenIds: [],
    player: { x: WORLD_WIDTH / 2, y: 0, vx: 0, vy: 0 },
    camY: 0,
    maxY: 0,
    chain: 0,
    lastLandY: 0,
    lastLandId: -1,
    score: { altitude: 0, chainBonus: 0, tokens: 0 },
    platforms: [],
    tokens: [],
    nextPlatId: 1,
    nextTokenId: 1,
    genY: 0,
    lastRowX: WORLD_WIDTH / 2,
    lastRowType: 'bud',
    pendingThorn: null,
    lastRowPads: [],
    rng,
    terminal: null,
    invalidCount: 0,
    landings: 0,
    goal: cfg.goal ? { ...cfg.goal } : { type: 'none', target: 0 },
    moveLimitTicks: cfg.moveLimitTicks || 0,
    steerTicksUsed: 0,
    maxTicks: cfg.maxTicks || TICK_RATE * 600, // 10-minute hard bound
    mechanics: cfg.mechanics ? [...cfg.mechanics] : [...PLATFORM_TYPES],
  };
  // Starting pad under the player.
  state.platforms.push({ id: 0, x: WORLD_WIDTH / 2, y: -20, w: 140, type: 'bud', vx: 0, alive: true });
  // First bounce happens immediately so play starts moving.
  state.player.y = 0;
  state.player.vy = tier.bounceV;
  generatePlatforms(state);
  return state;
}

/* ---------------- platform generation ----------------
 * Invariant: every row has exactly one PRIMARY pad of a landable type
 * (bud/drift/crumb/spring/wisp) within maxRowDx of the previous row, so a
 * complete ascending path always exists. Thorn hazard pads are only ever
 * added as secondary pads placed away from the primary path.
 */

function pickPrimaryType(state, r) {
  const t = state.tier.ratios;
  const mech = state.mechanics;
  let roll = r;
  const order = [
    ['wisp', t.wisp], ['spring', t.spring], ['crumb', t.crumb], ['drift', t.drift],
  ];
  for (const [type, ratio] of order) {
    if (mech.includes(type) && roll < ratio) return type;
    if (mech.includes(type)) roll -= ratio;
  }
  return 'bud';
}

/** Max horizontal distance between consecutive rows that remains reachable
 * within one bounce's flight time at maximum gap. Guarantees no soft locks. */
export function maxRowDx(tier) {
  const tRise = tier.bounceV / tier.gravity;
  const h = maxJumpHeight(tier);
  const tFall = Math.sqrt(Math.max(0, 2 * (h - tier.gapMax) / tier.gravity));
  return tier.maxVx * (tRise + tFall) * 0.7;
}

export function generatePlatforms(state) {
  const t = state.tier;
  const maxDx = maxRowDx(t);
  while (state.genY < state.player.y + GEN_AHEAD) {
    // After a one-use pad (crumb/wisp) the player gets a single bounce, so
    // the next row must be a static pad with a tighter gap and horizontal
    // offset — otherwise a drift pad that wandered off would be a soft lock.
    const afterOneUse = state.lastRowType === 'crumb' || state.lastRowType === 'wisp';
    const gapMax = afterOneUse ? t.gapMax * 0.75 : t.gapMax;
    const dxMax = afterOneUse ? maxDx * 0.6 : maxDx;
    const gap = rngRange(state.rng, t.gapMin, gapMax);
    state.genY += gap;
    let type = pickPrimaryType(state, rngNext(state.rng));
    if (afterOneUse && (type === 'drift' || type === 'crumb' || type === 'wisp')) type = 'bud';
    const w = t.width * (type === 'spring' ? 0.8 : 1);
    // Bound horizontal travel from the previous row so the path is always
    // reachable within one bounce (see maxRowDx).
    const prevX = state.lastRowX !== undefined ? state.lastRowX : WORLD_WIDTH / 2;
    const x = Math.max(w / 2, Math.min(WORLD_WIDTH - w / 2,
      prevX + rngRange(state.rng, -dxMax, dxMax)));
    state.lastRowX = x;
    state.lastRowType = type;
    const vx = type === 'drift'
      ? (rngNext(state.rng) < 0.5 ? -1 : 1) * rngRange(state.rng, 35, 85)
      : 0;
    const p = { id: state.nextPlatId++, x, y: state.genY, w, type, vx, alive: true };
    if (type === 'drift') p.home = x; // patrol range is clamped around home
    state.platforms.push(p);
    const rowPads = [{ x, w }];
    // Secondary pads: bonus bud pads.
    const secondRoll = rngNext(state.rng);
    if (secondRoll < 0.22) {
      // Bonus pad on the same row, kept within reach of the primary path.
      const w2 = t.width * 0.9;
      const lo = Math.max(w2 / 2, x - maxDx);
      const hi = Math.min(WORLD_WIDTH - w2 / 2, x + maxDx);
      if (hi - lo > (w + w2) / 2 + 8) {
        let x2 = rngRange(state.rng, lo, hi);
        if (Math.abs(x2 - x) < (w + w2) / 2 + 8) {
          x2 = x + (x2 >= x ? 1 : -1) * ((w + w2) / 2 + 8);
          x2 = Math.max(lo, Math.min(hi, x2));
        }
        state.platforms.push({ id: state.nextPlatId++, x: x2, y: state.genY, w: w2, type: 'bud', vx: 0, alive: true });
        rowPads.push({ x: x2, w: w2 });
      }
    }
    // Place the PREVIOUS row's pending thorn now that both neighboring
    // rows are known: a thorn must clear every landable pad on its own row,
    // the launch row below, and the arrival row above.
    if (state.pendingThorn) {
      const pt = state.pendingThorn;
      state.pendingThorn = null;
      const neighbors = [...(state.lastRowPads || []), ...rowPads];
      const sides = [pt.x - pt.off, pt.x + pt.off].filter(c =>
        c > pt.w2 / 2 && c < WORLD_WIDTH - pt.w2 / 2 &&
        Math.abs(c - pt.x) > pt.w2 / 2 + pt.wPrim / 2 + 36 &&
        neighbors.every(q => Math.abs(c - q.x) > pt.w2 / 2 + q.w / 2 + 36));
      if (sides.length) {
        const x2 = sides[pt.side % sides.length];
        state.platforms.push({ id: state.nextPlatId++, x: x2, y: pt.y, w: pt.w2, type: 'thorn', vx: 0, alive: true });
      }
    }
    state.lastRowPads = rowPads;
    if (rngNext(state.rng) < t.tokenRate) {
      state.tokens.push({ id: state.nextTokenId++, x, y: state.genY + 46, taken: false });
    }
    // Roll a thorn hazard for THIS row; placed next iteration (see above).
    const thornRoll = rngNext(state.rng);
    const offDraw = rngRange(state.rng, 0, 60);
    const sideDraw = rngNext(state.rng);
    const w2 = t.width * 0.7;
    state.pendingThorn = (state.mechanics.includes('thorn') && thornRoll < t.ratios.thorn)
      ? { x, y: state.genY, w2, wPrim: w, off: (w + w2) / 2 + 46 + offDraw, side: sideDraw < 0.5 ? 0 : 1 }
      : null;
  }
  // Cull far below camera to bound memory; keep deterministic ids.
  const floor = state.camY - 200;
  if (state.platforms.length > 400) {
    state.platforms = state.platforms.filter(p => p.y > floor || (p.alive && p.y > state.player.y - 400));
  }
  if (state.tokens.length > 200) {
    state.tokens = state.tokens.filter(k => !k.taken && k.y > floor);
  }
}

/* ---------------- legality & commands ---------------- */

/**
 * Legal actions for the current state. Tutorials/hints use this same API.
 * Returns [] when terminal. Steering is always legal while airborne or landed.
 */
export function legalActions(state) {
  if (state.terminal) return [];
  return [
    { type: 'steer', dir: -1 },
    { type: 'steer', dir: 0 },
    { type: 'steer', dir: 1 },
  ];
}

function validateCommand(state, cmd) {
  if (!cmd || typeof cmd !== 'object') return INVALID.BAD_SHAPE;
  if (typeof cmd.id !== 'string' || cmd.id.length === 0 || cmd.id.length > 64) return INVALID.BAD_SHAPE;
  if (cmd.type !== 'steer') return INVALID.BAD_TYPE;
  if (cmd.dir !== -1 && cmd.dir !== 0 && cmd.dir !== 1) return INVALID.BAD_DIR;
  if (!Number.isInteger(cmd.tick) || cmd.tick < 0 || cmd.tick > state.tick + TICK_RATE * 2) return INVALID.BAD_TICK;
  if (state.terminal) return INVALID.TERMINAL;
  if (state.seenIds.includes(cmd.id)) return INVALID.DUPLICATE;
  return null;
}

/**
 * Apply (enqueue) a command. Mutates and returns the same state object.
 * Returns { state, events, invalidReason? }. Invalid commands never change
 * physics state; they are counted in state.invalidCount.
 */
export function applyCommand(state, cmd) {
  const reason = validateCommand(state, cmd);
  if (reason) {
    state.invalidCount++;
    return { state, events: [], invalidReason: reason };
  }
  state.seenIds.push(cmd.id);
  if (state.seenIds.length > 512) state.seenIds = state.seenIds.slice(-256);
  // Insert into tick-ordered queue (commands are near-monotonic in practice).
  const entry = { tick: Math.max(cmd.tick, state.tick), dir: cmd.dir };
  let i = state.queue.length;
  while (i > 0 && state.queue[i - 1].tick > entry.tick) i--;
  state.queue.splice(i, 0, entry);
  return { state, events: [] };
}

/* ---------------- simulation step ---------------- */

/**
 * Advance one fixed tick. Returns events generated during the tick.
 * Mutates state in place.
 */
export function step(state) {
  const events = [];
  if (state.terminal) return events;
  const t = state.tier;

  state.tick++;

  // Consume due commands.
  while (state.queue.length && state.queue[0].tick <= state.tick) {
    state.dir = state.queue.shift().dir;
  }

  // Steering.
  const targetVx = state.dir * t.maxVx;
  const dvx = t.steerAccel * DT;
  if (state.player.vx < targetVx) state.player.vx = Math.min(targetVx, state.player.vx + dvx);
  else if (state.player.vx > targetVx) state.player.vx = Math.max(targetVx, state.player.vx - dvx);
  if (state.dir !== 0) {
    state.steerTicksUsed++;
    if (state.moveLimitTicks && state.steerTicksUsed > state.moveLimitTicks) {
      state.terminal = { reason: 'move-limit', tick: state.tick };
      events.push({ type: 'terminal', reason: 'move-limit' });
      return events;
    }
  }

  // Horizontal motion with wrap (classic screen-wrap, documented in help).
  state.player.x += state.player.vx * DT;
  if (state.player.x < -PLAYER_RADIUS) state.player.x += WORLD_WIDTH + PLAYER_RADIUS * 2;
  if (state.player.x > WORLD_WIDTH + PLAYER_RADIUS) state.player.x -= WORLD_WIDTH + PLAYER_RADIUS * 2;

  // Vertical motion.
  const prevY = state.player.y;
  state.player.vy -= t.gravity * DT;
  state.player.y += state.player.vy * DT;

  // Moving platforms patrol within DRIFT_RANGE of their spawn so generated
  // reachability bounds hold at all times.
  for (const p of state.platforms) {
    if (p.type === 'drift' && p.alive) {
      p.x += p.vx * DT;
      const half = p.w / 2;
      const lo = Math.max(half, (p.home !== undefined ? p.home : p.x) - DRIFT_RANGE);
      const hi = Math.min(WORLD_WIDTH - half, (p.home !== undefined ? p.home : p.x) + DRIFT_RANGE);
      if (p.x < lo) { p.x = lo; p.vx = Math.abs(p.vx); }
      if (p.x > hi) { p.x = hi; p.vx = -Math.abs(p.vx); }
    }
  }

  // Landing: falling and crossed a platform top this tick.
  // Horizontal distance is circular: the world wraps at the edges, so a pad
  // near one edge is landable while crossing the opposite edge.
  if (state.player.vy < 0) {
    let hit = null;
    for (const p of state.platforms) {
      if (!p.alive) continue;
      if (prevY >= p.y && state.player.y <= p.y &&
          wrapDist(state.player.x, p.x) <= p.w / 2 + PLAYER_RADIUS * 1.2) {
        if (!hit || p.y > hit.y) hit = p;
      }
    }
    if (hit) {
      state.player.y = hit.y;
      if (hit.type === 'thorn') {
        state.terminal = { reason: 'hazard', tick: state.tick };
        events.push({ type: 'thorn', id: hit.id });
        events.push({ type: 'terminal', reason: 'hazard' });
        return events;
      }
      const springy = hit.type === 'spring';
      state.player.vy = springy ? t.bounceV * SPRING_MULT : t.bounceV;
      if (hit.type === 'crumb' || hit.type === 'wisp') hit.alive = false;
      // Chain: consecutive landings on successively higher distinct platforms.
      if (hit.id !== state.lastLandId) {
        state.chain = hit.y > state.lastLandY ? state.chain + 1 : 1;
        state.lastLandId = hit.id;
        state.lastLandY = hit.y;
        state.landings++;
        state.score.chainBonus += Math.min(state.chain, MAX_CHAIN_AWARD);
      }
      events.push({ type: springy ? 'spring' : 'land', id: hit.id, ptype: hit.type, chain: state.chain, y: hit.y });
    }
  }

  // Token pickup.
  for (const k of state.tokens) {
    if (!k.taken && wrapDist(state.player.x, k.x) < 22 && Math.abs(state.player.y - k.y) < 26) {
      k.taken = true;
      state.score.tokens += TOKEN_SCORE;
      events.push({ type: 'token', id: k.id });
    }
  }

  // Camera only moves up.
  const target = state.player.y - CAM_OFFSET;
  if (target > state.camY) state.camY = target;
  if (state.player.y > state.maxY) {
    state.maxY = state.player.y;
    state.score.altitude = Math.floor(state.maxY / 10);
  }

  // Fell below camera bottom.
  if (state.player.y < state.camY - FALL_MARGIN) {
    state.terminal = { reason: 'fell', tick: state.tick };
    events.push({ type: 'terminal', reason: 'fell' });
    return events;
  }

  // Goals.
  const g = state.goal;
  if (g.type === 'altitude' && state.score.altitude >= g.target) {
    state.terminal = { reason: 'goal-reached', tick: state.tick };
    events.push({ type: 'terminal', reason: 'goal-reached' });
    return events;
  }
  if (g.type === 'tokens' && state.score.tokens / TOKEN_SCORE >= g.target) {
    state.terminal = { reason: 'goal-reached', tick: state.tick };
    events.push({ type: 'terminal', reason: 'goal-reached' });
    return events;
  }
  if (g.timeLimitTicks && state.tick >= g.timeLimitTicks && !state.terminal) {
    state.terminal = { reason: 'time-out', tick: state.tick };
    events.push({ type: 'terminal', reason: 'time-out' });
    return events;
  }
  if (state.tick >= state.maxTicks) {
    state.terminal = { reason: 'time-out', tick: state.tick };
    events.push({ type: 'terminal', reason: 'time-out' });
    return events;
  }

  generatePlatforms(state);
  return events;
}

/* ---------------- total score & comparison ---------------- */

export function totalScore(state) {
  return state.score.altitude + state.score.chainBonus + state.score.tokens;
}

/**
 * Spec tie-break order: primary objective completion, fewer invalid actions,
 * lower elapsed ticks, then stable session identifier. Returns <0 if a wins.
 */
export function compareRuns(a, b) {
  const doneA = a.terminal && a.terminal.reason === 'goal-reached' ? 1 : 0;
  const doneB = b.terminal && b.terminal.reason === 'goal-reached' ? 1 : 0;
  if (doneA !== doneB) return doneB - doneA;
  const scoreDiff = totalScore(b) - totalScore(a);
  if (scoreDiff !== 0) return scoreDiff;
  if (a.invalidCount !== b.invalidCount) return a.invalidCount - b.invalidCount;
  const tickA = a.terminal ? a.terminal.tick : a.tick;
  const tickB = b.terminal ? b.terminal.tick : b.tick;
  if (tickA !== tickB) return tickA - tickB;
  return String(a.sessionId || '').localeCompare(String(b.sessionId || ''));
}

/* ---------------- full-run simulation (replay / validation) ---------------- */

/**
 * Deterministically simulate a whole run from config + ordered commands.
 * Used by tests, offline validators, and the authoritative server.
 * Returns { state, terminal, score, hash, events } — events omitted unless
 * opts.collectEvents.
 */
export function simulateRun(cfg, commands, opts = {}) {
  const state = createInitialState(cfg);
  const sorted = [...(commands || [])].sort((a, b) => a.tick - b.tick);
  let ci = 0;
  const maxTicks = state.maxTicks;
  const events = opts.collectEvents ? [] : null;
  while (!state.terminal && state.tick < maxTicks) {
    while (ci < sorted.length && sorted[ci] && sorted[ci].tick <= state.tick + 1) {
      applyCommand(state, sorted[ci]);
      ci++;
    }
    const evs = step(state);
    if (events) for (const e of evs) events.push(e);
    if (state.tick > maxTicks + 10) break; // paranoia guard, unreachable in practice
  }
  return {
    state,
    terminal: state.terminal || { reason: 'time-out', tick: state.tick },
    score: { ...state.score, total: totalScore(state) },
    invalidCount: state.invalidCount,
    hash: stateHash(state),
    events,
  };
}

/* ---------------- serialization + migration ---------------- */

/** Strip functions/caches into a plain serializable snapshot. */
export function stripState(state) {
  return {
    v: state.v, seed: state.seed, tierKey: state.tierKey, tick: state.tick,
    dir: state.dir, queue: state.queue, seenIds: state.seenIds.slice(-64),
    player: { ...state.player }, camY: state.camY, maxY: state.maxY,
    chain: state.chain, lastLandY: state.lastLandY, lastLandId: state.lastLandId,
    score: { ...state.score }, platforms: state.platforms, tokens: state.tokens,
    nextPlatId: state.nextPlatId, nextTokenId: state.nextTokenId,
    genY: state.genY, lastRowX: state.lastRowX, lastRowType: state.lastRowType,
    lastRowPads: state.lastRowPads,
    pendingThorn: state.pendingThorn, rng: { s: state.rng.s }, terminal: state.terminal,
    invalidCount: state.invalidCount, landings: state.landings,
    goal: state.goal, moveLimitTicks: state.moveLimitTicks,
    steerTicksUsed: state.steerTicksUsed, maxTicks: state.maxTicks,
    mechanics: state.mechanics,
  };
}

export function serializeState(state) {
  return JSON.stringify(stripState(state));
}

/** Deserialize with schema-version migration. Throws on unsupported data. */
export function deserializeState(json) {
  let data = typeof json === 'string' ? JSON.parse(json) : json;
  if (!data || typeof data !== 'object') throw new Error('bad state payload');
  let v = data.v;
  if (v === 0) {
    // Migration v0 -> v1: v0 lacked steerTicksUsed/moveLimitTicks/landings.
    data = { steerTicksUsed: 0, moveLimitTicks: 0, landings: 0, ...data, v: 1 };
    v = 1;
  }
  if (v !== SCHEMA_VERSION) throw new Error('unsupported schema version: ' + v);
  const tier = DIFFICULTY[data.tierKey];
  if (!tier) throw new Error('unknown tier in state: ' + data.tierKey);
  return {
    ...data,
    tier,
    rng: makeRng(data.rng.s >>> 0),
    platforms: data.platforms.map(p => ({ ...p })),
    tokens: data.tokens.map(k => ({ ...k })),
    queue: data.queue.map(q => ({ ...q })),
    seenIds: [...(data.seenIds || [])],
    score: { ...data.score },
    player: { ...data.player },
    goal: { ...data.goal },
    mechanics: [...data.mechanics],
  };
}

/* Undo support (practice mode): session.js keeps a stack of
 * serializeState() snapshots taken at each landing and restores them with
 * deserializeState(); rules stays stateless about history. */
