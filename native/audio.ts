// Sound, as the browser build's src/audio.js: the authored one-shots
// (sfx/<name>.opus, sfx/manifest.json: a seeded pick when an event has two)
// per game event — bounce, spring boost, petal breaking, glow mote, chain
// bonus, milestone, falling, thorns, goal and the UI click — the quiet wind
// (pinkish noise low-passed at 480 Hz with its slow 0.07 Hz swell) and the
// adaptive pentatonic music whose density, tempo and level rise with the
// climb's altitude. The browser build synthesized the wind and the music
// live with WebAudio nodes; here they are rendered once into clips
// (createClip, a slice a frame): the wind one 14.3 s swell, the music a calm
// stem (intensity 0) and a climbing stem (intensity 1), looped and
// crossfaded by the run's intensity. The wind plays on the music bus (the
// runtime has no ambience bus) at its old level relative to the music. The
// runtime's Options own the volumes, mute, mute-when-hidden and the voice
// limit; UI clicks play on the "interface" bus, the rest on "effects". The
// oscillator fallbacks the browser build played while a sample decoded are
// not ported (a live synthesis graph makes clip loads fail on the engine's
// web runtime), so a clip still loading is silent. Clips load once the mixer
// runs (natively at once, in a browser after the first press), one at a
// time. With captions on (the game's Settings) each sound shows its caption.
import { context, createClip, loadClip, play as playClip, type AudioClip, type Sound } from "starhermit:audio";
import { Rules } from "./game.ts";

export type SfxEvent = "bounce" | "spring" | "crumble" | "token" | "combo" | "milestone" | "fall" | "thorn" | "click" | "goal";
const SAMPLES: Record<SfxEvent, string[]> = {
  bounce: ["leaf-bounce", "vine-bounce"], spring: ["spring-launch"], crumble: ["petal-crumble"], token: ["mote-chime", "mote-sparkle"],
  combo: ["chain-bonus"], milestone: ["milestone-arp"], fall: ["fall-whistle"], thorn: ["thorn-hit"], click: ["ui-click"], goal: ["goal-fanfare"],
};
const clips = new Map<string, AudioClip>();
const queue: string[] = Object.values(SAMPLES).flat();
let loading = false;
let suspended = false;
const pick = Rules.makeRng(0xa0d10);
let captionHook: ((event: SfxEvent) => void) | null = null;
/** Captions (ui.js caption()): called for every sound event; the game shows them when its option is on. */
export function onCaption(fn: (event: SfxEvent) => void): void { captionHook = fn; }

/** audio.js play(name): the event's clip, once loaded. */
export function event(kind: SfxEvent): void {
  captionHook?.(kind);
  if (suspended) return;
  const names = SAMPLES[kind];
  const name = names[Math.floor(Rules.rngNext(pick) * names.length) % names.length]!;
  const clip = clips.get(name);
  if (!clip) return;
  try { playClip(clip, { bus: kind === "click" ? "interface" : "effects" }); }
  catch { clips.delete(name); if (!queue.includes(name)) queue.push(name); } // a clip the mixer lost: load it again
}

/** A hidden window: everything quiet. */
export function setSuspended(on: boolean): void { suspended = on; }

// -- the rendered loops ----------------------------------------------------------------------------
const RATE = 22050;
const TAU = Math.PI * 2;
const SINE = new Float32Array(4096);
for (let i = 0; i < SINE.length; i++) SINE[i] = Math.sin((i / SINE.length) * TAU);
const sin1 = (phase: number): number => SINE[Math.floor((phase - Math.floor(phase)) * 4096) & 4095]!;
let noise = 0x9e3779b9;
const rnd = (): number => { noise ^= noise << 13; noise ^= noise >>> 17; noise ^= noise << 5; return (noise >>> 0) / 4294967296; };

/** startAmbience: leaky-integrated noise, one-pole low-pass at 480 Hz, gain 0.5 swelling ±0.2 at 0.07 Hz. */
const WIND_N = Math.round(RATE / 0.07);
const wind = new Float32Array(WIND_N);
let windDone = 0, windLast = 0, windLp = 0;
const LP_A = 1 - Math.exp((-TAU * 480) / RATE);
function renderWind(count: number): boolean {
  const end = Math.min(WIND_N, windDone + count);
  for (let i = windDone; i < end; i++) {
    windLast = windLast * 0.97 + (rnd() * 2 - 1) * 0.05;
    windLp += (windLast - windLp) * LP_A;
    wind[i] = windLp * (0.5 + 0.2 * sin1((i / RATE) * 0.07));
  }
  windDone = end;
  return windDone >= WIND_N;
}

/** startMusic: 32 steps of (330 − 120 × intensity) ms from the game's seeded stream. */
interface Note { t0: number; f: number; dur: number; peak: number; attack: number; tri: boolean }
const SCALE = [261.6, 311.1, 392, 466.2, 523.3];
interface Stem { n: number; data: Float32Array; done: number; notes: Note[]; clip: AudioClip | null; voice: Sound | null }
function stem(intensity: number, seed: number): Stem {
  const rng = Rules.makeRng(seed);
  const r = (): number => Rules.rngNext(rng);
  const stepS = (330 - intensity * 120) / 1000;
  const notes: Note[] = [];
  for (let st = 0; st < 32; st++) {
    if (r() < 0.25 + intensity * 0.6) {
      const f = SCALE[Math.floor(r() * SCALE.length) % SCALE.length]! * (r() < 0.25 + intensity * 0.3 ? 2 : 1);
      notes.push({ t0: st * stepS, f, dur: 0.5 + intensity * 0.2, peak: 0.05 + intensity * 0.05, attack: 0.05, tri: false });
    }
    if (st % 16 === 0) notes.push({ t0: st * stepS, f: 130.8, dur: 1.8, peak: 0.05, attack: 0.3, tri: true });
  }
  const n = Math.round(32 * stepS * RATE);
  return { n, data: new Float32Array(n), done: 0, notes, clip: null, voice: null };
}
/** blip(): linear attack from 0 to the peak, exponential decay to 0.0001 at dur. */
function env(t: number, n: Note): number {
  if (t < 0 || t > n.dur) return 0;
  if (t < n.attack) return (n.peak * t) / n.attack;
  return n.peak * Math.pow(0.0001 / n.peak, (t - n.attack) / (n.dur - n.attack));
}
function renderStem(s: Stem, count: number): boolean {
  const end = Math.min(s.n, s.done + count);
  const len = s.n / RATE;
  for (let i = s.done; i < end; i++) {
    let v = 0;
    for (const n of s.notes) {
      let t = i / RATE - n.t0;
      if (t < 0) t += len; // the loop wraps: a long note near the end rings into the start
      if (t > n.dur) continue;
      const ph = t * n.f;
      const p = ph - Math.floor(ph);
      v += (n.tri ? (p < 0.5 ? 4 * p - 1 : 3 - 4 * p) : sin1(ph)) * env(t, n);
    }
    s.data[i] = v;
  }
  s.done = end;
  return s.done >= s.n;
}
const calm = stem(0, 0x5eed1);
const climb = stem(1, 0x5eed2);
let windClip: AudioClip | null = null;
let windVoice: Sound | null = null;
let intensity = 0;
/** setIntensity(altitude / 1500): the climbing stem fades in as the run rises. */
export function setIntensity(v: number): void { intensity = Math.max(0, Math.min(1, v)); }

/** Each frame: the clips once the mixer runs (one at a time), then the loops, then their levels. */
export function update(): void {
  if (context.state !== "running") return;
  if (!loading && queue.length) {
    const name = queue.shift()!;
    if (!clips.has(name)) {
      loading = true;
      loadClip(`sfx/${name}.opus`).then((c) => { clips.set(name, c); loading = false; }, (e: unknown) => { console.warn(`sfx ${name}: ${String(e)}`); loading = false; });
    }
    return;
  }
  if (loading) return;
  if (!windClip) {
    if (!renderWind(12000)) return;
    try { windClip = createClip([wind], RATE); } catch (e) { console.warn(`audio: ${String(e)}`); windDone = 0; }
    return;
  }
  for (const s of [calm, climb]) {
    if (s.clip) continue;
    if (!renderStem(s, 4000)) return;
    try { s.clip = createClip([s.data], RATE); } catch (e) { console.warn(`audio: ${String(e)}`); s.done = 0; }
    return;
  }
  // the wind (ambience 0.4 against music 0.5 in the old defaults) and the two stems; one start a frame
  const on = !suspended;
  if (on && !windVoice) { try { windVoice = playClip(windClip, { bus: "music", loop: true, gain: 0 }); } catch { windVoice = null; } return; }
  if (on && !calm.voice) { try { calm.voice = playClip(calm.clip!, { bus: "music", loop: true, gain: 0 }); } catch { calm.voice = null; } return; }
  if (on && !climb.voice) { try { climb.voice = playClip(climb.clip!, { bus: "music", loop: true, gain: 0 }); } catch { climb.voice = null; } return; }
  try {
    windVoice?.fade(on ? 0.8 : 0, 0.2);
    calm.voice?.fade(on ? 1 - intensity : 0, 0.4);
    climb.voice?.fade(on ? intensity : 0, 0.4);
  } catch { /* the mixer restarted */ }
}
