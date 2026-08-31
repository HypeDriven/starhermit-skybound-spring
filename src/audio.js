/**
 * Skybound Spring — procedural WebAudio: short original transients per game
 * event, wind ambience, adaptive generative music stem whose intensity rises
 * with altitude. Per-bus gains, seeded pitch variants, captions hook,
 * auto-mute when tab is hidden (per settings).
 */
import { makeRng, rngRange } from './rules.js';

export class AudioSys {
  constructor(settings, onCaption) {
    this.settings = settings;   // { music, effects, ambience, muted, captions, muteWhenHidden }
    this.onCaption = onCaption || (() => {});
    this.ctx = null;
    this.buses = {};
    this.rng = makeRng(0xa0d10);
    this.musicTimer = null;
    this.intensity = 0;
    this.started = false;
    this.sfxManifest = null;          // parsed sfx/manifest.json entries
    this.eventSamples = new Map();    // event name -> [clip basenames]
    this.sfxBuffers = new Map();      // basename -> AudioBuffer, or null on permanent failure
    this.sfxPending = new Map();      // basename -> in-flight load Promise (dedupe)
  }

  /** Must be called from a user gesture. Idempotent. */
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const mk = (gain) => {
      const g = this.ctx.createGain();
      g.gain.value = gain;
      g.connect(this.ctx.destination);
      return g;
    };
    this.buses = {
      music: mk(this.settings.music),
      effects: mk(this.settings.effects),
      ambience: mk(this.settings.ambience),
    };
    this.startAmbience();
    this.startMusic();
    this.loadSfxManifest();
  }

  applySettings() {
    if (!this.ctx) return;
    this.buses.music.gain.value = this.settings.muted ? 0 : this.settings.music;
    this.buses.effects.gain.value = this.settings.muted ? 0 : this.settings.effects;
    this.buses.ambience.gain.value = this.settings.muted ? 0 : this.settings.ambience;
  }

  setHidden(hidden) {
    if (!this.ctx) return;
    if (hidden && this.settings.muteWhenHidden) this.ctx.suspend();
    else this.ctx.resume();
  }

  caption(text) {
    if (this.settings.captions) this.onCaption(text);
  }

  /* ---------- building blocks ---------- */

  blip(bus, { type = 'sine', f0 = 440, f1 = f0, dur = 0.12, gain = 0.2, attack = 0.004 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noiseBurst(bus, { dur = 0.15, gain = 0.15, freq = 1200, q = 1.2 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 1.6;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(bus);
    src.start(t);
  }

  /** Seeded pitch variant keeps replays feeling consistent. */
  variant(base) { return base * (1 + rngRange(this.rng, -0.06, 0.06)); }

  /* ---------- authored one-shot samples (sfx/*.opus) ---------- */

  /** Fetch the sample manifest once after unlock; failures keep pure synthesis. */
  async loadSfxManifest() {
    if (this.sfxManifest) return;
    try {
      const res = await fetch('sfx/manifest.json');
      if (!res.ok) return;
      const list = await res.json();
      if (!Array.isArray(list)) return;
      this.sfxManifest = list;
      for (const s of list) {
        if (!s || typeof s.name !== 'string' || typeof s.event !== 'string') continue;
        const names = this.eventSamples.get(s.event) || [];
        names.push(s.name);
        this.eventSamples.set(s.event, names);
      }
    } catch { /* missing/unreachable manifest: synthesis fallback stays */ }
  }

  /** Lazy-fetch/decode/cache one clip. In-flight loads dedupe; failures are cached as null. */
  loadSample(name) {
    if (this.sfxBuffers.has(name)) return Promise.resolve(this.sfxBuffers.get(name));
    if (this.sfxPending.has(name)) return this.sfxPending.get(name);
    const p = fetch(`sfx/${name}.opus`)
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
      .then((ab) => this.ctx.decodeAudioData(ab))
      .then((buf) => { this.sfxBuffers.set(name, buf); return buf; })
      .catch(() => { this.sfxBuffers.set(name, null); return null; })
      .finally(() => { this.sfxPending.delete(name); });
    this.sfxPending.set(name, p);
    return p;
  }

  /**
   * Try an authored sample for an event through the effects bus.
   * Returns true when a decoded clip actually starts; otherwise kicks the lazy
   * load and returns false so the caller runs its synthesis fallback.
   */
  playSample(event) {
    const names = this.eventSamples.get(event);
    if (!names || !names.length) return false;
    const name = names[Math.floor(rngRange(this.rng, 0, names.length)) % names.length];
    const buf = this.sfxBuffers.get(name);
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.buses.effects);
      src.start();
      return true;
    }
    if (buf === undefined) this.loadSample(name);
    return false;
  }

  /* ---------- event sounds ---------- */

  play(name) {
    if (!this.ctx || this.settings.muted) { this.caption(name); return; }
    const fx = this.buses.effects;
    switch (name) {
      case 'bounce':
        if (!this.playSample('bounce')) {
          this.blip(fx, { type: 'triangle', f0: this.variant(300), f1: 520, dur: 0.09, gain: 0.16 });
        }
        this.caption('bounce');
        break;
      case 'spring':
        if (!this.playSample('spring')) {
          this.blip(fx, { type: 'sine', f0: this.variant(240), f1: 980, dur: 0.22, gain: 0.22 });
        }
        this.caption('spring boost!');
        break;
      case 'crumble':
        if (!this.playSample('crumble')) {
          this.noiseBurst(fx, { dur: 0.12, gain: 0.14, freq: 700, q: 0.8 });
        }
        this.caption('petal breaks');
        break;
      case 'token':
        if (!this.playSample('token')) {
          this.blip(fx, { type: 'sine', f0: this.variant(880), f1: 1320, dur: 0.14, gain: 0.18 });
        }
        this.caption('glow mote collected');
        break;
      case 'combo':
        if (!this.playSample('combo')) {
          this.blip(fx, { type: 'square', f0: 520, f1: 780, dur: 0.08, gain: 0.10 });
          this.blip(fx, { type: 'square', f0: 780, f1: 1170, dur: 0.12, gain: 0.10 });
        }
        this.caption('chain bonus');
        break;
      case 'milestone':
        if (!this.playSample('milestone')) {
          [523, 659, 784].forEach((f, i) =>
            setTimeout(() => this.blip(this.buses.effects, { type: 'sine', f0: f, dur: 0.18, gain: 0.16 }), i * 90));
        }
        this.caption('milestone reached');
        break;
      case 'fall':
        if (!this.playSample('fall')) {
          this.blip(fx, { type: 'sawtooth', f0: 500, f1: 90, dur: 0.5, gain: 0.16 });
        }
        this.caption('falling!');
        break;
      case 'thorn':
        if (!this.playSample('thorn')) {
          this.noiseBurst(fx, { dur: 0.2, gain: 0.2, freq: 300, q: 2 });
          this.blip(fx, { type: 'sawtooth', f0: 200, f1: 60, dur: 0.3, gain: 0.14 });
        }
        this.caption('thorns!');
        break;
      case 'click':
        if (!this.playSample('click')) {
          this.blip(fx, { type: 'sine', f0: 700, f1: 700, dur: 0.04, gain: 0.08 });
        }
        break;
      case 'goal':
        if (!this.playSample('goal')) {
          [523, 659, 784, 1047].forEach((f, i) =>
            setTimeout(() => this.blip(this.buses.effects, { type: 'triangle', f0: f, dur: 0.22, gain: 0.16 }), i * 110));
        }
        this.caption('goal reached!');
        break;
    }
  }

  /* ---------- ambience: quiet filtered wind ---------- */

  startAmbience() {
    const ctx = this.ctx;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // pinkish noise via leaky integrator
      last = last * 0.97 + (Math.random() * 2 - 1) * 0.05;
      d[i] = last;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 480;
    const g = ctx.createGain();
    g.gain.value = 0.5;
    // slow swell LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.2;
    lfo.connect(lfoG).connect(g.gain);
    src.connect(f).connect(g).connect(this.buses.ambience);
    src.start();
    lfo.start();
  }

  /* ---------- adaptive generative music stem ---------- */

  startMusic() {
    if (this.musicTimer) return;
    const scale = [261.6, 311.1, 392, 466.2, 523.3]; // minor pentatonic-ish
    let stepIdx = 0;
    const tickMusic = () => {
      if (this.ctx && !this.settings.muted && this.ctx.state === 'running') {
        const density = 0.25 + this.intensity * 0.6;
        if (rngRange(this.rng, 0, 1) < density) {
          const note = scale[Math.floor(rngRange(this.rng, 0, scale.length)) % scale.length]
            * (rngRange(this.rng, 0, 1) < 0.25 + this.intensity * 0.3 ? 2 : 1);
          this.blip(this.buses.music, {
            type: 'sine', f0: note, dur: 0.5 + this.intensity * 0.2,
            gain: 0.05 + this.intensity * 0.05, attack: 0.05,
          });
        }
        // soft root drone
        if (stepIdx % 16 === 0) {
          this.blip(this.buses.music, { type: 'triangle', f0: 130.8, dur: 1.8, gain: 0.05, attack: 0.3 });
        }
        stepIdx++;
      }
      this.musicTimer = setTimeout(tickMusic, 330 - this.intensity * 120);
    };
    tickMusic();
  }

  /** 0..1 — rises with altitude. */
  setIntensity(v) { this.intensity = Math.max(0, Math.min(1, v)); }
}
