/**
 * Skybound Spring — graphics quality model: presets, per-category overrides,
 * StarHermit hardware-level detection, per-preset asset/effect budgets and a
 * cost summary. Pure (no three.js) so the Settings panel, the renderer and
 * the unit tests agree on what a setting means.
 */

export const PRESETS = ['low', 'balanced', 'high', 'ultra'];

// Category → allowed tiers, cheapest first.
export const CATEGORIES = {
  shadows: ['off', 'low', 'medium', 'high'],
  bloom: ['off', 'on'],
  grade: ['off', 'on'],
  antialias: ['off', 'fxaa', 'smaa', 'msaa'],
  reflections: ['off', 'on'],
  particles: ['low', 'high'],
  background: ['static', 'animated'],
  detail: ['plain', 'detailed'],
};

// Each preset is a row of tiers, a render scale (multiplies the pixel ratio)
// and a device-pixel-ratio cap so Low stays as cheap as the original game.
const TABLE = {
  low: { cap: 1, scale: 1, shadows: 'off', bloom: 'off', grade: 'off', antialias: 'msaa', reflections: 'off', particles: 'low', background: 'static', detail: 'plain' },
  balanced: { cap: 1.5, scale: 1, shadows: 'low', bloom: 'on', grade: 'on', antialias: 'fxaa', reflections: 'off', particles: 'high', background: 'animated', detail: 'detailed' },
  high: { cap: 2, scale: 1, shadows: 'medium', bloom: 'on', grade: 'on', antialias: 'smaa', reflections: 'on', particles: 'high', background: 'animated', detail: 'detailed' },
  ultra: { cap: 2, scale: 1.25, shadows: 'high', bloom: 'on', grade: 'on', antialias: 'msaa', reflections: 'on', particles: 'high', background: 'animated', detail: 'detailed' },
};

export const SHADOW_MAP = { off: 0, low: 512, medium: 1024, high: 2048 };

export const DEFAULT_GRAPHICS = Object.freeze({ preset: 'auto', render_scale: 1, adaptive: true, show_fps: false });

// Auto picks the preset from the StarHermit hardware level (0 = Galaxy S20 / Intel UHD or weaker, 20 = RTX
// 5090, each level ≈ 1.23× the one below; gpu-level.js → window.StarHermitGpu, a classic script loaded
// before app.js): Low from 0, Balanced from 4, High from 10, Ultra from 17. Phones, tablets and ≤ 4 GB
// machines are capped at level 9.
export const LEVELS = { low: 0, balanced: 4, high: 10, ultra: 17 };

const gpuApi = () => globalThis.StarHermitGpu;

/** Hardware level 0–20 for an unmasked renderer string plus StarHermitGpu.detectSystem() facts. */
export function detectLevel(gpu, system) {
  const G = gpuApi();
  if (!G) return LEVELS.balanced;
  return G.detectLevel({ webgl: true, webgl2: true, ...(system || {}), gpu: String(gpu || '') });
}

/** The preset Auto starts from for a hardware level. */
export function presetForLevel(level) {
  const G = gpuApi();
  return G ? G.presetForLevel(level, LEVELS) : PRESETS.filter((p) => LEVELS[p] <= level).pop() || 'low';
}

/** Best preset for this GPU (the hardware level already caps phones/tablets at Balanced). */
export function detectPreset(gpu, system) {
  return presetForLevel(detectLevel(gpu, system));
}

/*
 * Per-preset asset and effect budget. Each preset is tuned to hold 60 FPS on the weakest GPU Auto gives
 * it (Low → level 0, Balanced → 4, High → 10, Ultra → 17; measured with tests/gfx-bench.mjs). Gameplay,
 * physics and hit areas are identical on every preset — only visuals change.
 *   material   shading model: 'lambert' (diffuse only), 'standard' (PBR; clearcoat/sheen dropped) or
 *              'physical' (clearcoat pads and sheen on the hopper and spring blossoms)
 *   segments   tessellation of the pads, blossoms, hopper and clouds as a share of the authored counts
 *   texture    leaf-vein / petal texture width in px (authored at 256 / 128)
 *   clouds     background cloud clusters (instanced; detailed surface detail)
 *   pollen     floating pollen motes (Particles high), scaled with the level
 *   burst      sparkle cap per burst (Particles high; low: ⅓), scaled with the level
 *   bloomRes   bloom resolution as a share of the frame
 */
export const BUDGETS = {
  low: { material: 'lambert', segments: 0.5, texture: 128, clouds: 24, pollen: 30, burst: 16, bloomRes: 0.5 },
  balanced: { material: 'standard', segments: 0.75, texture: 256, clouds: 32, pollen: 50, burst: 28, bloomRes: 0.5 },
  high: { material: 'physical', segments: 1, texture: 256, clouds: 40, pollen: 70, burst: 40, bloomRes: 0.5 },
  ultra: { material: 'physical', segments: 1.5, texture: 512, clouds: 56, pollen: 120, burst: 56, bloomRes: 1 },
};
export const POLLEN_MAX = 240;
export const BURST_MAX = 80;

/** A preset's concrete budget for a hardware level (counts scale ≤ 2× within the preset). */
export function budgetFor(preset, level) {
  const b = { ...(BUDGETS[preset] || BUDGETS.balanced) };
  const G = gpuApi(), floor = LEVELS[preset] || 0;
  const lv = Math.max(Number.isFinite(level) ? level : floor, floor);
  const k = G ? Math.min(2, G.scaleBudget(1, lv, floor)) : 1;
  b.pollen = Math.min(POLLEN_MAX, Math.round(b.pollen * k));
  b.burst = Math.min(BURST_MAX, Math.round(b.burst * k));
  return b;
}

/**
 * Resolve saved settings into concrete tiers.
 * `saved`: { preset: 'auto'|preset, render_scale, adaptive, show_fps, <category>: tier }.
 * Missing / unknown category values mean "from preset".
 */
export function resolve(saved, detected, level) {
  const s = saved || {};
  const auto = !PRESETS.includes(s.preset);
  const preset = auto ? (PRESETS.includes(detected) ? detected : 'balanced') : s.preset;
  const row = TABLE[preset];
  const out = { preset, auto, cap: row.cap, scale: row.scale * clamp(Number(s.render_scale) || 1, 0.5, 2) };
  for (const [cat, tiers] of Object.entries(CATEGORIES)) {
    out[cat] = tiers.includes(s[cat]) ? s[cat] : row[cat];
  }
  out.level = Number.isFinite(level) ? level : LEVELS[preset];
  out.budget = budgetFor(preset, out.level);
  out.adaptive = s.adaptive !== false;
  out.showFps = !!s.show_fps;
  // The post chain only runs when an effect needs it; otherwise canvas MSAA is used.
  out.post = out.bloom === 'on' || out.grade === 'on' || out.antialias === 'fxaa' || out.antialias === 'smaa';
  return out;
}

/** Choosing a preset clears every per-category override (scale/adaptive/fps are kept). */
export function choosePreset(saved, preset) {
  const s = saved || {};
  return {
    preset: PRESETS.includes(preset) ? preset : 'auto',
    render_scale: clamp(Number(s.render_scale) || 1, 0.5, 2),
    adaptive: s.adaptive !== false,
    show_fps: !!s.show_fps,
  };
}

/** The preset's own tier for a category (for "From preset (…)" labels). */
export function presetTier(preset, cat) {
  return TABLE[preset]?.[cat];
}

/** Short cost summary, e.g. "1024² shadows · bloom · SMAA · 1280×720 px". */
export function describe(r, pixels, labels) {
  const L = { noShadows: 'no shadows', shadows: 'shadows', bloom: 'bloom', grade: 'grade', reflections: 'reflections', noAA: 'no AA', ...(labels || {}) };
  const parts = [
    r.shadows === 'off' ? L.noShadows : `${SHADOW_MAP[r.shadows]}² ${L.shadows}`,
    r.bloom === 'on' ? L.bloom : null,
    r.grade === 'on' ? L.grade : null,
    r.reflections === 'on' ? L.reflections : null,
    r.antialias === 'off' ? L.noAA : r.antialias.toUpperCase(),
    pixels ? `${pixels[0]}×${pixels[1]} px` : null,
  ];
  return parts.filter(Boolean).join(' · ');
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}
