// Sound, as the browser build's src/audio.js: the authored one-shots
// (sfx/<name>.opus, sfx/manifest.json: a sound bank's pick when an event has two)
// per game event — bounce, spring boost, petal breaking, glow mote, chain
// bonus, milestone, falling, thorns, goal and the UI click — the quiet wind
// (pinkish noise low-passed at 480 Hz with its slow 0.07 Hz swell) and the
// adaptive pentatonic music whose density, tempo and level rise with the
// climb's altitude. The browser build synthesized the wind and the music
// live with WebAudio nodes; here the same graphs render once into clips
// (OfflineAudioContext, in onStart): the wind one 14.3 s swell, the music a calm
// stem (intensity 0) and a climbing stem (intensity 1), looped and
// crossfaded by the run's intensity. The wind plays on the music bus (the
// runtime has no ambience bus) at its old level relative to the music. The
// runtime's Options own the volumes, mute, mute-when-hidden and the voice
// limit; UI clicks play on the "interface" bus, the rest on "effects". The
// oscillator fallbacks the browser build played while a sample decoded are
// not ported, so a clip still loading is silent. Everything loads in onStart;
// only starting the loops waits for the mixer (in a browser, the first press).
// With captions on (the game's Settings) each sound shows its caption.
import { context, createClip, loadClip, OfflineAudioContext, play as playClip, SoundBank, type AudioClip, type Sound } from "starhermit:audio";
import { Rules } from "./game.ts";

export type SfxEvent = "bounce" | "spring" | "crumble" | "token" | "combo" | "milestone" | "fall" | "thorn" | "click" | "goal";
const SAMPLES: Record<SfxEvent, string[]> = {
  bounce: ["leaf-bounce", "vine-bounce"], spring: ["spring-launch"], crumble: ["petal-crumble"], token: ["mote-chime", "mote-sparkle"],
  combo: ["chain-bonus"], milestone: ["milestone-arp"], fall: ["fall-whistle"], thorn: ["thorn-hit"], click: ["ui-click"], goal: ["goal-fanfare"],
};
const banks = new Map<SfxEvent, SoundBank>();
let suspended = false;
let captionHook: ((event: SfxEvent) => void) | null = null;
/** Captions (ui.js caption()): called for every sound event; the game shows them when its option is on. */
export function onCaption(fn: (event: SfxEvent) => void): void { captionHook = fn; }

/** audio.js play(name): the event's bank, once loaded. */
export function event(kind: SfxEvent): void {
  captionHook?.(kind);
  if (suspended) return;
  try { banks.get(kind)?.play(); } catch { /* the mixer is full this frame: skip it */ }
}

/** A hidden window: everything quiet. */
export function setSuspended(on: boolean): void { suspended = on; }

// -- the rendered loops ----------------------------------------------------------------------------
const RATE = 22050;
const WIND_N = Math.round(RATE / 0.07);
const WIND_GAIN = 0.531; // make-up to the old wind's rms (.0557)
/** startAmbience: brown noise low-passed at 480 Hz, gain 0.5 swelling ±0.2 at 0.07 Hz. Periodic once the filter settled: no crossfade. */
async function renderWind(): Promise<AudioClip> {
  const settle = Math.round(0.5 * RATE);
  const off = new OfflineAudioContext(1, settle + WIND_N, RATE);
  const noise = off.createNoise({ color: "brown", seed: 0x9e37, seconds: WIND_N / RATE });
  const lp = off.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 480;
  const swell = off.createGain(); swell.gain.value = 0.5 * WIND_GAIN;
  const lfo = off.createOscillator(); lfo.frequency.value = 0.07;
  const depth = off.createGain(); depth.gain.value = 0.2 * WIND_GAIN;
  lfo.connect(depth).connect(swell.gain); lfo.start();
  noise.connect(lp).connect(swell).connect(off.destination); noise.start();
  const r = await off.startRendering();
  return createClip([r.getChannelData(0).slice(settle)], RATE);
}

/** startMusic: 32 steps of (330 − 120 × intensity) ms from the game's seeded stream. */
interface Note { t0: number; f: number; dur: number; peak: number; attack: number; tri: boolean }
const SCALE = [261.6, 311.1, 392, 466.2, 523.3];
interface Stem { n: number; notes: Note[]; clip: AudioClip | null; voice: Sound | null }
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
  return { n, notes, clip: null, voice: null };
}
const TAIL = Math.round(1.8 * RATE);
/** blip(): linear attack from 0 to the peak, exponential decay to 0.0001 at dur. A long note near the end rings into the start. */
async function renderStem(s: Stem): Promise<AudioClip> {
  const off = new OfflineAudioContext(1, s.n + TAIL, RATE);
  for (const n of s.notes) {
    const osc = off.createOscillator();
    if (n.tri) osc.type = "triangle";
    osc.frequency.value = n.f;
    const g = off.createGain();
    g.gain.setValueAtTime(0, n.t0);
    g.gain.linearRampToValueAtTime(n.peak, n.t0 + n.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, n.t0 + n.dur);
    osc.connect(g).connect(off.destination);
    osc.start(n.t0); osc.stop(n.t0 + n.dur);
  }
  const r = (await off.startRendering()).getChannelData(0);
  const data = r.slice(0, s.n);
  for (let i = 0; i < TAIL; i++) data[i]! += r[s.n + i]!;
  return createClip([data], RATE);
}
const calm = stem(0, 0x5eed1);
const climb = stem(1, 0x5eed2);
let windClip: AudioClip | null = null;
let windVoice: Sound | null = null;
let intensity = 0;
/** setIntensity(altitude / 1500): the climbing stem fades in as the run rises. */
export function setIntensity(v: number): void { intensity = Math.max(0, Math.min(1, v)); }

/** Loads every clip at once and renders the loops (onStart). */
export function loadSfx(): void {
  const warn = (e: unknown): void => { console.warn(`audio: ${String(e)}`); };
  const load = (name: string): Promise<AudioClip | null> => loadClip(`sfx/${name}.opus`).catch((e: unknown) => { console.warn(`sfx ${name}: ${String(e)}`); return null; });
  for (const [kind, names] of Object.entries(SAMPLES) as [SfxEvent, string[]][]) {
    void Promise.all(names.map(load)).then((loaded) => {
      const list = loaded.filter((c) => c !== null);
      if (list.length) banks.set(kind, new SoundBank({ clips: list, bus: kind === "click" ? "interface" : "effects" }));
    });
  }
  renderWind().then((c) => { windClip = c; }, warn);
  for (const s of [calm, climb]) renderStem(s).then((c) => { s.clip = c; }, warn);
}

/** Each frame, once the mixer runs and the loops are rendered: start them, then their levels. */
export function update(): void {
  if (context.state !== "running" || !windClip || !calm.clip || !climb.clip) return;
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
