/**
 * Skybound Spring — graphics quality model: presets, per-category overrides,
 * GPU detection and a cost summary. Pure (no three.js) so the Settings panel,
 * the renderer and the unit tests agree on what a setting means.
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
export const BURST_CAP = { low: 12, high: 40 };

export const DEFAULT_GRAPHICS = Object.freeze({ preset: 'auto', render_scale: 1, adaptive: true, show_fps: false });

/**
 * Best preset for this GPU from the unmasked renderer string. Software
 * renderers get Low, discrete GPUs / Apple M-series get High, else Balanced.
 * `mobile` caps the result at Balanced.
 */
export function detectPreset(gpu, mobile = false) {
  const g = String(gpu || '').toLowerCase();
  let p = 'balanced';
  if (/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/.test(g)) p = 'low';
  else if (/nvidia|geforce|rtx|gtx|quadro|radeon rx|radeon pro|amd radeon(?! graphics)|apple m\d/.test(g)) p = 'high';
  if (mobile && PRESETS.indexOf(p) > PRESETS.indexOf('balanced')) p = 'balanced';
  return p;
}

/**
 * Resolve saved settings into concrete tiers.
 * `saved`: { preset: 'auto'|preset, render_scale, adaptive, show_fps, <category>: tier }.
 * Missing / unknown category values mean "from preset".
 */
export function resolve(saved, detected) {
  const s = saved || {};
  const auto = !PRESETS.includes(s.preset);
  const preset = auto ? (PRESETS.includes(detected) ? detected : 'balanced') : s.preset;
  const row = TABLE[preset];
  const out = { preset, auto, cap: row.cap, scale: row.scale * clamp(Number(s.render_scale) || 1, 0.5, 2) };
  for (const [cat, tiers] of Object.entries(CATEGORIES)) {
    out[cat] = tiers.includes(s[cat]) ? s[cat] : row[cat];
  }
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
