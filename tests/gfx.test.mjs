import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPreset, resolve, presetTier, choosePreset, describe, PRESETS, CATEGORIES, DEFAULT_GRAPHICS } from '../src/gfx.js';
import { GFX_STRINGS, pickLocale } from '../src/gfx-i18n.js';

test('detectPreset maps GPU strings to tiers', () => {
  assert.equal(detectPreset('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)'), 'low');
  assert.equal(detectPreset('llvmpipe (LLVM 15.0.7, 256 bits)'), 'low');
  assert.equal(detectPreset('ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)'), 'high');
  assert.equal(detectPreset('Apple M2'), 'high');
  assert.equal(detectPreset('AMD Radeon RX 6800'), 'high');
  assert.equal(detectPreset('ANGLE (Intel, Intel(R) UHD Graphics 620)'), 'balanced');
  assert.equal(detectPreset('Adreno (TM) 640'), 'balanced');
  assert.equal(detectPreset(''), 'balanced');
  // touch / mobile devices are capped at Balanced
  assert.equal(detectPreset('Apple M1', true), 'balanced');
  assert.equal(detectPreset('SwiftShader', true), 'low');
});

test('resolve: Auto uses the detected preset, explicit preset wins', () => {
  const auto = resolve({}, 'low');
  assert.equal(auto.preset, 'low');
  assert.equal(auto.auto, true);
  assert.equal(auto.shadows, 'off');
  assert.equal(auto.post, false, 'Low renders without a post chain');
  const high = resolve({ preset: 'high' }, 'low');
  assert.equal(high.preset, 'high');
  assert.equal(high.auto, false);
  assert.equal(high.shadows, 'medium');
  assert.equal(high.post, true);
  assert.equal(resolve({ preset: 'bogus' }, 'nonsense').preset, 'balanced');
});

test('resolve: overrides replace preset tiers; invalid tiers fall back', () => {
  const r = resolve({ preset: 'high', bloom: 'off', shadows: 'high', particles: 'nope' }, 'low');
  assert.equal(r.bloom, 'off');
  assert.equal(r.shadows, 'high');
  assert.equal(r.particles, presetTier('high', 'particles'));
  // every category resolves to a legal tier
  for (const [cat, tiers] of Object.entries(CATEGORIES)) assert.ok(tiers.includes(r[cat]), cat);
});

test('resolve: render scale is clamped to 50–200% of the preset scale', () => {
  assert.equal(resolve({ preset: 'high', render_scale: 5 }).scale, 2);
  assert.equal(resolve({ preset: 'high', render_scale: 0.1 }).scale, 0.5);
  assert.equal(resolve({ preset: 'ultra', render_scale: 1 }).scale, 1.25);
  assert.equal(resolve({ preset: 'low' }).cap, 1);
  assert.equal(resolve({ preset: 'high' }).cap, 2);
  assert.equal(resolve({}).adaptive, true);
  assert.equal(resolve({ adaptive: false }).adaptive, false);
  assert.equal(resolve({}).showFps, false);
});

test('choosing a preset clears overrides but keeps scale / adaptive / fps', () => {
  const saved = { preset: 'high', bloom: 'off', shadows: 'low', render_scale: 1.5, adaptive: false, show_fps: true };
  const next = choosePreset(saved, 'ultra');
  assert.deepEqual(next, { preset: 'ultra', render_scale: 1.5, adaptive: false, show_fps: true });
  assert.equal(resolve(next).bloom, presetTier('ultra', 'bloom'));
  assert.equal(choosePreset(saved, 'auto').preset, 'auto');
  assert.equal(DEFAULT_GRAPHICS.preset, 'auto');
});

test('describe summarises cost and pixels', () => {
  const s = describe(resolve({ preset: 'high' }), [1280, 720]);
  assert.match(s, /1024² shadows/);
  assert.match(s, /SMAA/);
  assert.match(s, /1280×720 px/);
  assert.match(describe(resolve({ preset: 'low' })), /no shadows/);
});

test('graphics strings exist for every locale and key', () => {
  const need = ['en-US', 'en-GB', 'es-419', 'es-ES', 'de-DE', 'fr-FR', 'fr-CA', 'pt-BR', 'it-IT'];
  const en = GFX_STRINGS['en-US'];
  for (const loc of need) {
    const L = GFX_STRINGS[loc];
    assert.ok(L, loc);
    for (const k of Object.keys(en)) assert.ok(L[k], `${loc}.${k}`);
    for (const p of PRESETS) assert.ok(L[p], `${loc}.${p}`);
    for (const [cat, tiers] of Object.entries(CATEGORIES)) {
      assert.ok(L.cat[cat], `${loc}.cat.${cat}`);
      for (const t of tiers) assert.ok(L.tier[t], `${loc}.tier.${t}`);
    }
  }
  assert.equal(pickLocale('es-MX'), 'es-419');
  assert.equal(pickLocale('fr-CA'), 'fr-CA');
  assert.equal(pickLocale('en-AU'), 'en-GB');
  assert.equal(pickLocale('ja-JP'), 'en-US');
});
