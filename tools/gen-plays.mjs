// Writes the native play scripts (tests/native/*.play) from runs the rules
// play here: the planning bot (tools/bot.mjs) steers on the client's fixed
// steps — one decision a 60 Hz step, two rules ticks a step — limited to what
// held keys can do (a reversal releases one key a step before holding the
// other), and the steering changes become hold / release lines at exact
// frames. Timing on the 1.20.1 render check (measured): the `until Go!` line
// matches on the frame the countdown shows "Go!"; the first climbing step is
// 39 frames later (step k sees rules tick 2k); each key line takes one frame
// and acts on that frame's step; `frames N` takes N + 1 frames.
//   node tools/gen-plays.mjs            (writes the committed scripts)
// dailyScript(date) is used by tests/native.mjs for today's Daily.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as R from '../src/rules.js';
import { stageConfig, dailyConfig, CHALLENGES, TUTORIALS } from '../src/content.js';
import { createBot } from './bot.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const FIRST_STEP = 39;

/** The steering per step (−1, 0, 1) the bot holds through a run, and how the run ends. */
export function plan(cfg, { maxSteps = 60 * 240, tweak = {}, prefer = null, force = null } = {}) {
  const state = R.createInitialState(cfg);
  const bot = createBot(tweak);
  const dirs = [];
  let n = 0;
  for (let k = 0; k < maxSteps && !state.terminal; k++) {
    let dir = bot.decide(state);
    // a lesson's wish (steer one way), taken when the bot can still land from there
    const want = prefer ? prefer(state, dirs) : null;
    if (want !== null && want !== dir && safeWith(state, want)) dir = want;
    const forced = force ? force(state, k) : null;
    if (forced !== null) dir = forced;
    const prev = dirs.length ? dirs[dirs.length - 1] : 0;
    if (prev !== 0 && dir === -prev) dir = 0; // one key up before the other goes down
    dirs.push(dir);
    if (dir !== state.dir) R.applyCommand(state, { id: 'p' + (n++), tick: state.tick + 1, type: 'steer', dir });
    R.step(state);
    if (!state.terminal) R.step(state);
  }
  return { dirs, state, terminal: state.terminal, total: R.totalScore(state) };
}

/** main.ts tutorialTick over a planned run: the step each lesson step completes at (null: never). */
export function lessonSteps(def, dirs) {
  const state = R.createInitialState({ seed: def.seed, difficulty: def.difficulty, goal: def.goal, mechanics: def.mechanics });
  const events = [];
  const done = [];
  let idx = 0, steer = 0, n = 0;
  for (let k = 0; k < dirs.length && !state.terminal; k++) {
    if (dirs[k] !== state.dir) R.applyCommand(state, { id: 'l' + (n++), tick: state.tick + 1, type: 'steer', dir: dirs[k] });
    events.push(...R.step(state));
    if (!state.terminal) events.push(...R.step(state));
    if (idx >= def.steps.length) continue;
    const c = def.steps[idx].check;
    let ok = false;
    if (c.event) ok = events.filter((e) => e.type === c.event).length >= c.count;
    else { if (state.dir === c.steerDir) steer++; ok = steer >= c.ticks; }
    if (ok) { done.push(k); idx++; steer = 0; }
  }
  return done.length === def.steps.length ? done : null;
}

/** Whether steering `dir` for the next step still lets a fresh bot keep climbing 2 s. */
function safeWith(state, dir) {
  const sim = R.deserializeState(R.serializeState(state));
  sim.queue = [];
  sim.dir = dir;
  R.step(sim); if (!sim.terminal) R.step(sim);
  const bot = createBot();
  for (let i = 0; i < 120 && !sim.terminal; i++) {
    sim.dir = bot.decide(sim);
    R.step(sim); if (!sim.terminal) R.step(sim);
  }
  return !sim.terminal || sim.terminal.reason === 'goal-reached';
}

const KEY = { '-1': 'ArrowLeft', 1: 'ArrowRight' };
/** The key lines after `until 300 Go!` that hold `dirs` step by step. */
export function keyLines(dirs) {
  const out = [];
  let c = 0; // frames since the `until` frame
  let prev = 0;
  dirs.forEach((d, k) => {
    if (d === prev) return;
    const f = FIRST_STEP + k;
    const g = f - c - 1;
    if (g > 0) out.push(`frames ${g - 1}`);
    if (g < 0) throw new Error(`step ${k}: two key lines in one frame`);
    out.push(prev !== 0 && d === 0 ? `release ${KEY[prev]}` : `hold ${KEY[d]}`);
    if (prev !== 0 && d !== 0) throw new Error(`step ${k}: reversal without release`);
    c = f;
    prev = d;
  });
  if (prev !== 0) {
    // let go once the run has ended (the step after the last)
    const g = FIRST_STEP + dirs.length - c - 1;
    if (g > 0) out.push(`frames ${g - 1}`);
    out.push(`release ${KEY[prev]}`);
  }
  return out;
}

function cfgOf(st) { return { seed: st.seed, difficulty: st.difficulty, goal: st.goal, mechanics: st.mechanics, moveLimitTicks: st.moveLimitTicks || 0 }; }
function header(lines) { return lines.join('\n') + '\n'; }

/** Journey stage 1 won by keys on a desktop, then its 4× replay checked. */
function journeyScript() {
  const st = stageConfig(0);
  const p = plan(cfgOf(st));
  if (p.terminal.reason !== 'goal-reached') throw new Error('stage 1 not won: ' + JSON.stringify(p.terminal));
  return header([
    `# Journey stage 1 (${st.name}) climbed to ${st.goal.target} m by keys from the bot's plan (${p.dirs.length} steps, ${p.total} points),`,
    '# the results with the next stage, then the replay at 4× checked against the run. Generated by tools/gen-plays.mjs.',
    '# viewport 1280x800@1',
    'until 300 Skybound Spring',
    'frames 10',
    'click ▶ Play',
    'until 300 Go!',
    ...keyLines(p.dirs),
    'until 200 Goal reached!',
    'frames 10',
    `expect ${p.total}`,
    'expect Next: Ascent 2',
    'save journey-won',
    'click Watch replay',
    `until ${Math.ceil(p.dirs.length / 2) + 300} Replay verified`,
    'frames 5',
    'save journey-replay',
    'click Next: Ascent 2',
    'until 300 Go!',
    'frames 60',
    'expect Ascent 2: reach 355m altitude.',
  ]);
}

/** Today's Daily (the date's seed) by keys at 1024 × 640 (the rails' narrowest), to its end. */
export function dailyScript(date) {
  const d = dailyConfig(date);
  // an endless chase: the bot climbs 45 s, then steers away from the pads below until it falls
  const away = (s, k) => {
    if (k < 60 * 45) return null;
    let below = null;
    for (const q of s.platforms) if (q.alive && q.y <= s.player.y && (!below || q.y > below.y)) below = q;
    return below && s.player.x < below.x ? -1 : 1;
  };
  const p = plan({ seed: d.seed, difficulty: d.difficulty, goal: { type: 'none', target: 0 }, mechanics: d.mechanics }, { maxSteps: 60 * 90, force: away });
  if (!p.terminal) throw new Error('the daily run did not end');
  const dirs = p.dirs;
  return header([
    `# Today's Daily (${date}, ${d.difficulty}) climbed 45 s by keys, then steered off the pads (ends at ${Math.round(dirs.length / 60)} s: ${p.terminal.reason}, ${p.total} points). Written by tests/native.mjs.`,
    '# viewport 1024x640@1',
    'until 300 Skybound Spring',
    'frames 10',
    `click Daily (${date})`,
    'until 300 Go!',
    ...keyLines(dirs),
    'until 600 Run over',
    'frames 10',
    `expect ${p.total}`,
    'save daily-end',
  ]);
}

/** The Steady Hands challenge on a short landscape phone, by keys, to its end. */
function challengeScript() {
  const ch = CHALLENGES[0];
  const p = plan(cfgOf(ch));
  return header([
    `# Challenge ${ch.name} on a short landscape phone by keys from the bot's plan`,
    `# (ends: ${p.terminal.reason}, ${p.total} points). Generated by tools/gen-plays.mjs.`,
    '# viewport 844x390@3',
    'until 300 Skybound Spring',
    'frames 10',
    'touch Challenges',
    'until 100 Steady Hands',
    'frames 10',
    'touch =Attempt — Steady Hands',
    'until 300 Go!',
    ...keyLines(p.dirs),
    `until 600 ${p.terminal.reason === 'goal-reached' ? 'Goal reached!' : 'Run over'}`,
    'frames 10',
    `expect ${p.total}`,
    'save challenge-end',
  ]);
}

/** The first lesson on a DPR-3 phone: menus by finger, the steering by keys from the bot's plan. */
function lessonScript() {
  const def = TUTORIALS[0];
  const cfg = { seed: def.seed, difficulty: def.difficulty, goal: def.goal, mechanics: def.mechanics };
  // while a step asks to steer one way, steer that way whenever it is safe (counted from the first landing, as the lesson does)
  let left = 0, right = 0, landed = false;
  const prefer = (s, dirs) => {
    const last = dirs[dirs.length - 1] ?? 0;
    if (landed) { if (left < 125) { if (last === -1) left++; } else if (last === 1) right++; }
    if (s.landings >= 1) landed = true;
    if (!landed) return null;
    if (left < 125) return -1;
    if (right < 125) return 1;
    return null;
  };
  const p = plan(cfg, { prefer });
  const steps = lessonSteps(def, p.dirs);
  if (!steps) throw new Error(`the lesson does not finish on the plan (${JSON.stringify(p.terminal)}, left ${left}, right ${right})`);
  return header([
    `# The first lesson (${def.name}) on a DPR-3 phone: Learn and the lesson by finger, the steering by keys from the bot's plan`,
    `# (its four steps done at steps ${steps.join(', ')}; the run ends: ${p.terminal.reason}), then "More lessons" shows it ticked.`,
    '# Generated by tools/gen-plays.mjs.',
    '# viewport 390x844@3',
    'until 300 Skybound Spring',
    'frames 10',
    'touch Learn',
    'until 100 Find the Wind',
    'frames 10',
    'touch Find the Wind',
    'until 300 Go!',
    ...keyLines(p.dirs),
    `until 600 ${p.terminal.reason === 'goal-reached' ? 'Goal reached!' : 'Run over'}`,
    'frames 10',
    'save lesson-end',
    'touch More lessons',
    'until 100 Find the Wind ✓',
  ]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = { 'journey-keys.play': journeyScript(), 'lesson-phone.play': lessonScript(), 'challenge-landscape.play': challengeScript() };
  for (const [name, text] of Object.entries(out)) {
    writeFileSync(join(root, 'tests', 'native', name), text);
    console.log(`wrote tests/native/${name} (${text.split('\n').length} lines)`);
  }
}
