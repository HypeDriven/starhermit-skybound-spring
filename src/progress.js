// Skybound Spring — the progress this client stores as the engine save, and
// what it reads from the browser build. Pure: shared by native/platform.ts and
// the node tests.
// - The engine save is the browser build's progress document (src/session.js
//   loadProgress): cleared Journey stages (id -> best score), the best total
//   per mode, achievements (key -> unlock time in ms), the UTC days played and
//   the finished lessons. Two copies merge as the browser build's cloud
//   conflicts did (session.js mergeProgress: the higher score per stage and
//   mode, the earliest unlock, the union of days and lessons).
// - The browser build mirrored that document to the cloud slot game:<slug> as
//   JSON { v: 1, savedAt, progress } (StarHermit.saveJSON); the engine shows
//   the slot as foreign and readForeign() turns it into progress.
// - Of the old settings (the platform settings KV, one key per setting), the
//   left-handed tray, toggle steering, the colour-vision palette, timing
//   assistance and sound captions stay the game's options (engine settings);
//   volumes, mute, mute-when-hidden, graphics, haptics, larger text, high
//   contrast, reduced motion and language are the runtime's Options, and the
//   anonymous analytics buffer (local only, never sent) is gone. isLegacyKey()
//   names every per-player key the browser build (its settings mirror,
//   sh-language.js and game-options.js) wrote, to remove once read.
import { mergeProgress } from './session.js';

export const OPTION_KEYS = ['leftHanded', 'toggleSteer', 'cvdPalette', 'timingAssist', 'captions'];
export const PALETTES = ['default', 'deuteranopia', 'tritanopia'];
export const DEFAULT_OPTIONS = { leftHanded: false, toggleSteer: false, cvdPalette: 'default', timingAssist: false, captions: false };

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v));

/** A new player's progress. */
export function blank() { return normalize(null); }

/** Any stored or old document -> progress (unknown or broken input -> blank). */
export function normalize(raw) {
  const d = obj(raw);
  const out = { stagesCompleted: {}, bests: {}, achievements: {}, daysPlayed: [], tutorialsDone: [] };
  for (const [k, v] of Object.entries(obj(d.stagesCompleted))) {
    const n = num(v);
    if (Number.isFinite(n)) out.stagesCompleted[k] = Math.round(n);
  }
  for (const [k, v] of Object.entries(obj(d.bests))) {
    const n = num(v);
    if (Number.isFinite(n)) out.bests[k] = Math.round(n);
  }
  for (const [k, v] of Object.entries(obj(d.achievements))) {
    const n = num(v);
    if (v && Number.isFinite(n)) out.achievements[k] = n;
  }
  if (Array.isArray(d.daysPlayed)) out.daysPlayed = [...new Set(d.daysPlayed.filter((x) => typeof x === 'string'))].sort();
  if (Array.isArray(d.tutorialsDone)) out.tutorialsDone = [...new Set(d.tutorialsDone.filter((x) => typeof x === 'string'))];
  return out;
}

/** Two copies merged without losing either side's progress (session.js mergeProgress). */
export function merge(local, remote) {
  return normalize(mergeProgress(normalize(local), normalize(remote)));
}

function sorted(v) {
  if (Array.isArray(v)) return v.map(sorted);
  if (!v || typeof v !== 'object') return v;
  const out = {};
  for (const k of Object.keys(v).sort()) out[k] = sorted(v[k]);
  return out;
}
/** Whether two copies hold the same progress (key order ignored). */
export function same(a, b) {
  return JSON.stringify(sorted(normalize(a))) === JSON.stringify(sorted(normalize(b)));
}

/** session.js recordResult: the stage's and mode's best; today's date into the days played. */
export function recordResult(progress, mode, id, score, terminal, today) {
  const completed = !!terminal && terminal.reason === 'goal-reached';
  if (mode === 'journey') {
    const prev = progress.stagesCompleted[id] || 0;
    if (completed && score > prev) progress.stagesCompleted[id] = score;
  }
  const best = progress.bests[mode] || 0;
  const isBest = score > best;
  if (isBest) progress.bests[mode] = score;
  if (!progress.daysPlayed.includes(today)) { progress.daysPlayed.push(today); progress.daysPlayed.sort(); }
  return { completed, isBest, prevBest: best, best: Math.max(best, score) };
}

/** session.js evaluateAchievements: the keys a finished run unlocks (unlock time `nowMs`). */
export function evaluateAchievements(progress, run, nowMs) {
  const fresh = [];
  const unlock = (key) => {
    if (!progress.achievements[key]) { progress.achievements[key] = nowMs; fresh.push(key); }
  };
  if (run.completed || run.altitude >= 300) unlock('first-ascent');
  if (run.springs >= 25) unlock('spring-master');
  if (run.maxChain >= 30) unlock('streak-tender');
  if (run.completed && run.difficulty === 'storm') unlock('storm-summit');
  if (progress.daysPlayed.length >= 7) unlock('evergreen');
  return fresh;
}

/** Only well-typed option values. */
export function pickOptions(raw) {
  const out = {};
  const r = obj(raw);
  for (const k of OPTION_KEYS) {
    if (k === 'cvdPalette') { if (PALETTES.includes(r[k])) out[k] = r[k]; }
    else if (typeof r[k] === 'boolean') out[k] = r[k];
  }
  return out;
}

/** The browser build's cloud slot (JSON text of { v, savedAt, progress }) -> progress, or null. */
export function readForeign(text) {
  if (typeof text !== 'string' || !text) return null;
  let o;
  try { o = JSON.parse(text); } catch { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  return normalize(o.progress && typeof o.progress === 'object' ? o.progress : o);
}

/** The browser build's settings mirror (main.js DEFAULT_SETTINGS keys) and the shared page helpers' keys. */
const LEGACY_SETTINGS = [
  'music', 'effects', 'ambience', 'muted', 'muteWhenHidden', 'captions', 'graphics', 'leftHanded', 'toggleSteer',
  'hapticsOff', 'largeText', 'highContrast', 'reducedMotion', 'cvdPalette', 'timingAssist', 'analyticsConsent', 'quality',
];
export function isLegacyKey(key) {
  return LEGACY_SETTINGS.includes(key) || key === 'ui.language' || key === 'audio.options' || key.startsWith('graphics.');
}
