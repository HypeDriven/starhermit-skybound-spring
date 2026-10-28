// The look per graphics level: the browser build's four presets and budgets
// (src/gfx.js TABLE / BUDGETS, each tuned to hold 60 FPS on the weakest GPU
// its Auto gave it) keyed by the runtime's quality tier (frame().quality),
// with the pollen and the sparkle bursts scaled within the tier by the level
// (frame().levelIndex, at most 2×), as the browser build scaled them by its
// hardware level. Pads, motes, thorns, hit areas and timing are identical on
// every tier — only visuals change. The runtime owns the rest of the old
// Graphics panel: Auto and the level choice, render scale and the pixel-ratio
// cap, adaptive resolution, the frame-rate limit and the FPS readout. The
// panel's per-category overrides are not offered (Options choose a level).
import type { QualityTier } from "starhermit:engine";
import type { AntialiasMode } from "starhermit:scene";

export interface Budget {
  /** Shading: Lambert (Low), standard PBR (Balanced), physical clear-coated pads (High, Ultra). */
  material: "lambert" | "standard" | "physical";
  /** Tessellation of the pads, blossoms, hopper and clouds as a share of the authored counts. */
  segments: number;
  /** Leaf-vein / petal texture width in px (authored at 256 / 128). */
  texture: number;
  /** Background cloud clusters (detailed). */
  clouds: number;
  /** Floating pollen motes (Particles high). */
  pollen: number;
  /** Sparkles per burst (Particles high; low: half). */
  burst: number;
  bloomRes: number;
}
export interface Look {
  preset: QualityTier;
  /** Key-light shadow map (0 = off). */
  shadows: 0 | 512 | 1024 | 2048;
  bloom: boolean;
  grade: boolean;
  antialias: AntialiasMode;
  /** The room reflections (scene.environment). */
  reflections: boolean;
  particles: "low" | "high";
  /** Drifting clouds, swaying stalks and leaves, twinkling stars, rising pollen. */
  animated: boolean;
  /** Leaf-vein and petal textures, clear-coat, puffier clouds, the stalks' leaves, pollen, mote halos. */
  detailed: boolean;
  budget: Budget;
}

const TABLE: Record<QualityTier, Omit<Look, "preset" | "budget">> = {
  low: { shadows: 0, bloom: false, grade: false, antialias: "msaa", reflections: false, particles: "low", animated: false, detailed: false },
  balanced: { shadows: 512, bloom: true, grade: true, antialias: "fxaa", reflections: false, particles: "high", animated: true, detailed: true },
  high: { shadows: 1024, bloom: true, grade: true, antialias: "smaa", reflections: true, particles: "high", animated: true, detailed: true },
  ultra: { shadows: 2048, bloom: true, grade: true, antialias: "msaa", reflections: true, particles: "high", animated: true, detailed: true },
};
const BUDGETS: Record<QualityTier, Budget> = {
  low: { material: "lambert", segments: 0.5, texture: 128, clouds: 24, pollen: 30, burst: 16, bloomRes: 0.5 },
  balanced: { material: "standard", segments: 0.75, texture: 256, clouds: 32, pollen: 50, burst: 28, bloomRes: 0.5 },
  high: { material: "physical", segments: 1, texture: 256, clouds: 40, pollen: 70, burst: 40, bloomRes: 0.5 },
  ultra: { material: "physical", segments: 1.5, texture: 512, clouds: 56, pollen: 120, burst: 56, bloomRes: 1 },
};
export const POLLEN_MAX = 240;
export const BURST_MAX = 80;
/** The first level index of each tier. */
const TIER_FLOOR: Record<QualityTier, number> = { low: 0, balanced: 2, high: 4, ultra: 7 };

/** The look for a quality tier at a level index (0 … 9). */
export function lookFor(preset: QualityTier, levelIndex: number): Look {
  const b = { ...BUDGETS[preset] };
  // Levels are about 1.64× apart in GPU throughput: the counts grow with the
  // level above the tier's first, at most 2× (gfx.js budgetFor).
  const k = Math.min(2, Math.pow(1.64, Math.max(0, levelIndex - TIER_FLOOR[preset])));
  b.pollen = Math.min(POLLEN_MAX, Math.round(b.pollen * k));
  b.burst = Math.min(BURST_MAX, Math.round(b.burst * k));
  return { preset, ...TABLE[preset], budget: b };
}
