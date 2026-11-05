// The look per graphics level: the engine's level settings (levelSettings():
// shadows and their map size, bloom resolution, grade, anti-aliasing) plus the
// browser build's art budgets keyed by the runtime's quality tier
// (frame().quality), with the pollen and the sparkle bursts scaled within the
// tier by the level's particle budget (at most 2×). Pads, motes, thorns, hit
// areas and timing are identical on every tier — only visuals change. The
// runtime owns the rest of the old Graphics panel: Auto and the level choice,
// render scale and the pixel-ratio cap, adaptive resolution, the frame-rate
// limit and the FPS readout. The panel's per-category overrides are not
// offered (Options choose a level).
import { levelSettings, type GraphicsLevel, type LevelSettings, type QualityTier } from "starhermit:engine";
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
}
export interface Look {
  preset: QualityTier;
  /** Key-light shadow map: the level's size (0 = off). */
  shadows: number;
  /** The level's bloom resolution (null = off). */
  bloom: number | null;
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

type Art = Pick<Look, "reflections" | "particles" | "animated" | "detailed">;
const ART: Record<QualityTier, Art> = {
  low: { reflections: false, particles: "low", animated: false, detailed: false },
  balanced: { reflections: false, particles: "high", animated: true, detailed: true },
  high: { reflections: true, particles: "high", animated: true, detailed: true },
  ultra: { reflections: true, particles: "high", animated: true, detailed: true },
};
const BUDGETS: Record<QualityTier, Budget> = {
  low: { material: "lambert", segments: 0.5, texture: 128, clouds: 24, pollen: 30, burst: 16 },
  balanced: { material: "standard", segments: 0.75, texture: 256, clouds: 32, pollen: 50, burst: 28 },
  high: { material: "physical", segments: 1, texture: 256, clouds: 40, pollen: 70, burst: 40 },
  ultra: { material: "physical", segments: 1.5, texture: 512, clouds: 56, pollen: 120, burst: 56 },
};
export const POLLEN_MAX = 240;
export const BURST_MAX = 80;
const ANCHOR: Record<QualityTier, GraphicsLevel> = { low: "quantum", balanced: "molecular", high: "terrestrial", ultra: "galactic" };

/** The look for a graphics level's settings. */
export function lookFor(s: LevelSettings = levelSettings()): Look {
  const preset = s.quality;
  const b = BUDGETS[preset];
  const k = Math.min(2, s.particles / levelSettings(ANCHOR[preset]).particles);
  return {
    preset, ...ART[preset],
    shadows: s.shadows ? s.shadowMapSize : 0,
    bloom: s.bloom ? s.bloom.resolution : null,
    grade: s.grade,
    antialias: s.antialias,
    budget: { ...b, texture: Math.min(b.texture, s.maxTextureSize), pollen: Math.min(POLLEN_MAX, Math.round(b.pollen * k)), burst: Math.min(BURST_MAX, Math.round(b.burst * k)) },
  };
}
