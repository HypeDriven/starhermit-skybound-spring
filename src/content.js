/**
 * Skybound Spring — versioned content.
 * Deterministic, data-only module (no DOM/three). Themes, journey stages,
 * tutorials, achievements, daily seeds, challenge definitions.
 */
import { fnv1a, TICK_RATE, DIFFICULTY, CONTENT_VERSION, TOKEN_SCORE } from './rules.js';

export { CONTENT_VERSION };

/* ---------------- themes ---------------- */

export const THEMES = [
  {
    key: 'dawn-meadow', name: 'Dawn Meadow',
    skyTop: 0x7fb7e8, skyBottom: 0xffe3c2, fog: 0xf4d9c0, fogNear: 2600, fogFar: 7000,
    keyLight: 0xffe8c8, hemiSky: 0xbfd9ff, hemiGround: 0x8a9a6a,
    pad: 0x4f9e4f, padAlt: 0x6fbf5f, accent: 0xff9d5c, cloud: 0xfff4ea,
  },
  {
    key: 'cloud-terrace', name: 'Cloud Terrace',
    skyTop: 0x5e9fe0, skyBottom: 0xd9ecff, fog: 0xdfeefc, fogNear: 2600, fogFar: 7200,
    keyLight: 0xffffff, hemiSky: 0xcfe6ff, hemiGround: 0x9db3c8,
    pad: 0x3f8f6e, padAlt: 0x57ab83, accent: 0xffc45c, cloud: 0xffffff,
  },
  {
    key: 'dusk-canopy', name: 'Dusk Canopy',
    skyTop: 0x4a3a72, skyBottom: 0xe8876b, fog: 0xc77f6d, fogNear: 2400, fogFar: 6500,
    keyLight: 0xffb27a, hemiSky: 0x8a6fa8, hemiGround: 0x5a4a3a,
    pad: 0x6e5a9e, padAlt: 0x8a72b8, accent: 0xffd166, cloud: 0xf2c4b0,
  },
  {
    key: 'frostline', name: 'Frostline',
    skyTop: 0x33507a, skyBottom: 0xbfe3f2, fog: 0xcfe6f0, fogNear: 2200, fogFar: 6000,
    keyLight: 0xeaf6ff, hemiSky: 0xa8c8e8, hemiGround: 0x7a8a9a,
    pad: 0x5a8ab0, padAlt: 0x76a4c8, accent: 0x9fe8ff, cloud: 0xeef8ff,
  },
  {
    key: 'night-bloom', name: 'Night Bloom',
    skyTop: 0x141a3a, skyBottom: 0x3a2a5e, fog: 0x2a2450, fogNear: 2000, fogFar: 5600,
    keyLight: 0x9a8aff, hemiSky: 0x4a3a7a, hemiGround: 0x1a1626,
    pad: 0x3f6e8e, padAlt: 0x5488aa, accent: 0x7affd8, cloud: 0x4a4472,
  },
];

/** Color-vision-safe gameplay palette overrides (platform-type colors). */
export const CVD_PALETTES = {
  default: { bud: 0x58b368, drift: 0x3fa7d6, crumb: 0xc98a4b, spring: 0xe457a0, wisp: 0xb8b8d0, thorn: 0xd93b3b, token: 0xffd94d },
  deuteranopia: { bud: 0x4d9de0, drift: 0xf0c808, crumb: 0x8c6a4a, spring: 0xe457a0, wisp: 0xc0c0d8, thorn: 0x7a3bd9, token: 0xfff4a0 },
  tritanopia: { bud: 0x4dc0a8, drift: 0xd94f70, crumb: 0xa88860, spring: 0x3fa7d6, wisp: 0xc8c8c8, thorn: 0xe8b400, token: 0xffffff },
};

/* ---------------- journey stages ----------------
 * 40 authored stages via a parameterized deterministic generator:
 * one new concept at a time, then combinations, mastery check every 8th.
 */
export const JOURNEY_STAGE_COUNT = 40;

const INTRO = [
  { at: 0, mech: ['bud'] },
  { at: 4, add: 'spring' },
  { at: 8, add: 'drift' },
  { at: 14, add: 'crumb' },
  { at: 20, add: 'thorn' },
  { at: 26, add: 'wisp' },
];

export function stageConfig(index) {
  if (index < 0 || index >= JOURNEY_STAGE_COUNT) throw new Error('stage out of range');
  const mechanics = ['bud'];
  for (const step of INTRO) {
    if (index >= step.at) {
      if (step.add && !mechanics.includes(step.add)) mechanics.push(step.add);
    }
  }
  const mastery = index % 8 === 7 && index > 0;
  const tierKey = index < 12 ? 'sprout' : index < 28 ? 'bloom' : 'storm';
  const theme = THEMES[Math.floor(index / 8) % THEMES.length].key;
  // Targets sized for a realistic sustained climb of ~75 world units/sec
  // (bounce cycle rises ~176 units in ~0.94 s, minus steering time).
  const target = Math.round((300 + index * 55) * (mastery ? 1.12 : 1));
  const tokenGoal = index % 8 === 5 ? { type: 'tokens', target: 4 + Math.floor(index / 8) } : null;
  const seed = fnv1a('skybound-stage-' + index);
  // Par: expected ticks at 75 units/sec climb rate, with 40% slack.
  const parTicks = Math.round((target * 10) / 75 * TICK_RATE * 1.4);
  return {
    id: 'stage-' + String(index + 1).padStart(2, '0'),
    index,
    name: mastery ? `Mastery Gate ${Math.floor(index / 8) + 1}` : `Ascent ${index + 1}`,
    seed,
    difficulty: tierKey,
    goal: tokenGoal || { type: 'altitude', target },
    parTicks,
    parSeconds: Math.round(parTicks / TICK_RATE),
    mastery,
    mechanics,
    theme,
    tutorial: index === 0 ? 'steer-basics' : index === 4 ? 'springs' : index === 8 ? 'drifters' : index === 14 ? 'crumbles' : null,
    version: CONTENT_VERSION,
  };
}

export function allStages() {
  const out = [];
  for (let i = 0; i < JOURNEY_STAGE_COUNT; i++) out.push(stageConfig(i));
  return out;
}

/* ---------------- challenges ---------------- */

export const CHALLENGES = [
  {
    id: 'steady-hands', name: 'Steady Hands', type: 'move-limit',
    description: 'Reach 900 altitude with a limited steering budget. Every tick you steer counts.',
    difficulty: 'bloom', goal: { type: 'altitude', target: 900 },
    moveLimitTicks: TICK_RATE * 45, // 45 steer-seconds
    seed: fnv1a('challenge-steady-hands'), theme: 'cloud-terrace', version: CONTENT_VERSION,
  },
  {
    id: 'sky-sprint', name: 'Sky Sprint', type: 'speed',
    description: 'Reach 700 altitude before the clock runs out. Keep bouncing, keep climbing.',
    difficulty: 'bloom', goal: { type: 'altitude', target: 700, timeLimitTicks: TICK_RATE * 50 },
    seed: fnv1a('challenge-sky-sprint'), theme: 'dusk-canopy', version: CONTENT_VERSION,
  },
];

/* ---------------- daily ---------------- */

/** Deterministic daily seed from a UTC date string ("2026-08-30"). */
export function dailySeed(utcDateString) {
  return fnv1a('skybound-daily-' + utcDateString);
}
export function utcDateString(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
export function dailyConfig(dateStr = utcDateString()) {
  const seed = dailySeed(dateStr);
  const keys = Object.keys(DIFFICULTY);
  const tierKey = keys[seed % keys.length];
  return {
    id: 'daily-' + dateStr,
    date: dateStr,
    seed,
    difficulty: tierKey,
    goal: { type: 'none', target: 0 }, // endless score chase
    theme: THEMES[seed % THEMES.length].key,
    mechanics: ['bud', 'drift', 'crumb', 'spring', 'wisp', 'thorn'],
    version: CONTENT_VERSION,
  };
}

/* ---------------- tutorials ----------------
 * Each lesson requires the player to perform the action; completion is
 * detected from run events via the same legalActions/rules pipeline.
 */
export const TUTORIALS = [
  {
    id: 'steer-basics', name: 'Find the Wind', theme: 'dawn-meadow',
    difficulty: 'sprout', mechanics: ['bud'], seed: fnv1a('tut-steer'),
    goal: { type: 'altitude', target: 60 },
    steps: [
      { text: 'You bounce on your own. Steer with ← → (or A / D), or drag on touch.', check: { event: 'land', count: 1 } },
      { text: 'Steer left until the arrow fills.', check: { steerDir: -1, ticks: TICK_RATE } },
      { text: 'Now steer right until the arrow fills.', check: { steerDir: 1, ticks: TICK_RATE } },
      { text: 'You can wrap around the screen edges — fly off one side, appear on the other!', check: { event: 'land', count: 3 } },
    ],
  },
  {
    id: 'springs', name: 'Spring Blooms', theme: 'cloud-terrace',
    difficulty: 'sprout', mechanics: ['bud', 'spring'], seed: fnv1a('tut-spring'),
    goal: { type: 'altitude', target: 120 },
    steps: [
      { text: 'Pink blossom pads launch you high. Land on one!', check: { event: 'spring', count: 1 } },
      { text: 'Ride the boost and climb!', check: { event: 'land', count: 2 } },
    ],
  },
  {
    id: 'drifters', name: 'Drifting Leaves', theme: 'dusk-canopy',
    difficulty: 'sprout', mechanics: ['bud', 'drift'], seed: fnv1a('tut-drift'),
    goal: { type: 'altitude', target: 150 },
    steps: [
      { text: 'Blue leaf pads slide sideways. Time your landing!', check: { event: 'land', count: 3 } },
    ],
  },
  {
    id: 'crumbles', name: 'Brittle Petals', theme: 'frostline',
    difficulty: 'bloom', mechanics: ['bud', 'crumb'], seed: fnv1a('tut-crumb'),
    goal: { type: 'altitude', target: 180 },
    steps: [
      { text: 'Brown petals break after one landing. Never plan to return to them.', check: { event: 'land', count: 4 } },
    ],
  },
];

/* ---------------- achievements ----------------
 * Stable lowercase keys; unlocks are idempotent server-side and locally.
 */
export const ACHIEVEMENTS = [
  { key: 'first-ascent', name: 'First Ascent', description: 'Complete any stage or climb 300 altitude.' },
  { key: 'spring-master', name: 'Spring Master', description: 'Bounce on 25 spring pads in one run.' },
  { key: 'streak-tender', name: 'Streak Tender', description: 'Reach a landing chain of 30.' },
  { key: 'storm-summit', name: 'Storm Summit', description: 'Complete a Journey stage on Storm difficulty.' },
  { key: 'evergreen', name: 'Evergreen', description: 'Play on 7 different days.' },
];

/* ---------------- mastery track ---------------- */
export function masteryTrack(progress) {
  // progress: { stagesCompleted: {id: bestScore}, ... }
  const stages = allStages().filter(s => s.mastery);
  return stages.map(s => ({
    stageId: s.id,
    name: s.name,
    completed: !!(progress && progress.stagesCompleted && progress.stagesCompleted[s.id]),
  }));
}
