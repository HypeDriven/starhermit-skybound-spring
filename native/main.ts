// Skybound Spring on the StarHermit engine: the entry module (starhermit.txt
// engine.entry), played natively by the StarHermit client and in browsers by
// the engine's web runtime. The rules (src/rules.js), the run session
// (src/session.js) and the content (src/content.js) are the browser build's,
// unchanged; this module is what src/main.js did around them — the state
// machine (title → a Journey stage, lesson, Practice run, Challenge or
// today's Daily → the 3-2-1-Go countdown → climbing ⇄ paused → results),
// steering from keys, pads, the thumb tray and drags on the playfield (held,
// or toggled with the game's option), the Practice undo to the last landing,
// the lessons' step checks, sounds and effects per rules event, progression
// and achievements, posting a finished Journey, Daily or Challenge run to the
// high-score board, the 4× replay of the last run (checked against its end
// hash), and the lifecycle (a hidden window pauses the run, as
// visibilitychange did, and coming back after 5 s says nothing happened
// meanwhile). Screens are drawn by screens.ts (starhermit:ui), the garden by
// render.ts (starhermit:scene).
//
// Time is the runtime's fixed steps at 60 Hz: each step applies the steering
// held then (the browser build read it once a frame), runs two rules ticks
// (TICK_RATE 120), then the lesson checks — so pauses, a hidden window and
// slow frames never cost time and play scripts replay exactly. The countdown
// counts the same steps (39 a number, its 650 ms). The replay runs four ticks
// a step, as the old one ran four a frame.
import "./i18n.ts";
import { clipboard, frame, onFixedUpdate, onPreferencesChange, onRender, onResume, onStart, onSuspend, onUpdate, preferences, setFixedRate } from "starhermit:engine";
import { isDown, onAction, onPointerButton, onPointerMove, onTouch, primaryPointer, vibrate } from "starhermit:input";
import * as ui from "starhermit:ui";
import { onSessionEnded, requestSignIn } from "starhermit:platform";
import { Content, Progress, Rules, Session, type Challenge, type Command, type Lesson, type RunConfig, type RunSession, type SimEvent, type Stage, type State } from "./game.ts";
import * as audio from "./audio.ts";
import { N, S, T } from "./i18n.ts";
import * as platform from "./platform.ts";
import { lookFor } from "./quality.ts";
import * as render from "./render.ts";
import { drawScreens } from "./screens.ts";
import { applyContrast, initStyles } from "./style.ts";

export type Screen = "title" | "journey" | "learn" | "practice" | "challenges" | "profile" | "pause" | "results" | "help" | "settings" | "countdown" | "away";
export type Machine = "title" | "countdown" | "active" | "paused" | "results";
export type Mode = "journey" | "tutorial" | "daily" | "practice" | "challenge";
export interface RunMeta {
  mode: Mode; label: () => string; theme: string; allowUndo: boolean; cfg: RunConfig;
  stage?: Stage; challenge?: Challenge; lesson?: Lesson; tier?: string; seed?: number; par?: number;
}
export interface Results {
  score: { altitude: number; chainBonus: number; tokens: number; total: number };
  reason: string; isBest: boolean; best: number; prevBest: number; achievements: string[];
  next: { label: () => string; act: () => void } | null; par: number | null; post: boolean;
}

/** main.js STATE_LABELS: the Status card's phase name. */
export const STATE_LABELS: Record<string, string> = {
  title: N("Title screen"), countdown: N("Countdown"), active: N("Climbing"), paused: N("Paused"), results: N("Results"),
};

export const app = {
  /** The screen shown over the playfield (null: the run). */
  screen: "title" as Screen | null,
  machine: "title" as Machine,
  /** Where Help and Settings go back to. */
  back: "title" as "title" | "pause",
  openedFrame: 0,
  focusNext: null as string | null,
  run: null as RunMeta | null,
  sess: null as RunSession | null,
  countdown: 3,
  results: null as Results | null,
  lb: null as platform.Posted | "posting" | null,
  board: null as platform.BoardRow[] | "none" | "loading" | null,
  accountNote: null as (() => string) | null,
  away: null as { seconds: number; altitude: number } | null,
  toast: null as { text: () => string; until: number } | null,
  caption: null as { text: string; until: number } | null,
  /** The lesson in progress (main.js this.tutorial). */
  tutorial: null as { def: Lesson; stepIdx: number; steerTicks: number } | null,
  /** The replay of the last run (main.js replayPlayback). */
  replay: null as { commands: Command[]; idx: number; checksum: string } | null,
  /** The compact layouts' open drawer. */
  drawer: null as "left" | "right" | null,
  /** The practice screen's choices. */
  practice: { tier: "sprout", seed: "" },
  /** Steering from the tray buttons (screens.ts) and drags on the playfield. */
  trayDir: 0,
};
let countdownSteps = 0;
let toggleDir: number | undefined;
let hiddenAt = 0;
let summary = { springs: 0, maxChain: 0 };

// ------------------------------------------------------------------ helpers
const announcements: string[] = [];
/** The live regions (ui.announce): joined and flushed once a frame. */
export function announce(text: string): void { if (text) announcements.push(text); }
export function click(): void { audio.event("click"); }
export function toast(text: () => string): void { app.toast = { text, until: frame().time + 3.2 }; }
/** Pure-touch devices (a phone may report no pointer before its first touch). */
export function touchOnly(): boolean {
  const pp = primaryPointer();
  if (pp !== "none") return pp === "coarse";
  const f = frame(), sc = ui.preferences().scale;
  const w = f.width / sc, h = f.height / sc;
  return (w <= 700 && h >= w) || (w > h && h <= 500);
}
/** The Daily's UTC day by the platform's clock (the device's when offline). */
export function today(): string { return new Date(platform.nowMs()).toISOString().slice(0, 10); }
export function progress(): ReturnType<typeof platform.progress> { return platform.progress(); }
/** Localized display name of a Journey stage (ui.js stageName). */
export function stageName(s: Stage): string {
  return s.mastery ? T("Mastery Gate {n}", { n: Math.floor(s.index / 8) + 1 }) : T("Ascent {n}", { n: s.index + 1 });
}

// ------------------------------------------------------------------ navigation
const FIRST: Partial<Record<Screen, string>> = {
  title: "btn-play", journey: "stage-1", learn: "lesson-1", practice: "tier-sprout", challenges: "challenge-1", profile: "btn-back",
  pause: "btn-resume", results: "btn-retry", help: "btn-back", settings: "set-captions", away: "btn-away-resume",
};
export function open(screen: Screen | null): void {
  app.screen = screen;
  app.openedFrame = frame().frame;
  app.focusNext = screen ? FIRST[screen] ?? null : null;
  app.drawer = null;
  ui.setFocus(null);
}
export function openOverlay(screen: "help" | "settings"): void {
  click();
  app.back = app.machine === "paused" ? "pause" : "title";
  open(screen);
}
export function overlayBack(): void { click(); open(app.back === "pause" && app.machine === "paused" ? "pause" : "title"); }
export function toTitle(): void {
  app.machine = "title";
  app.sess = null;
  app.tutorial = null;
  app.replay = null;
  app.results = null;
  open("title");
}
export function openProfile(): void {
  click();
  app.board = platform.signedIn() ? "loading" : null;
  open("profile");
  if (platform.signedIn()) void platform.boardTop(10).then((b) => { app.board = b ?? "none"; });
}

// ------------------------------------------------------------------ runs
/** main.js goalText. */
export function goalText(cfg: RunConfig, label: string): string {
  const g = cfg.goal;
  if (!g || g.type === "none") return T("{label}: climb as high as you can.", { label });
  if (g.type === "altitude") {
    return g.timeLimitTicks
      ? T("{label}: reach {n}m altitude in {s}s.", { label, n: g.target, s: Math.round(g.timeLimitTicks / Rules.TICK_RATE) })
      : T("{label}: reach {n}m altitude.", { label, n: g.target });
  }
  return T("{label}: collect {n} glow motes.", { label, n: g.target });
}

function startRun(cfg: RunConfig, meta: Omit<RunMeta, "cfg">): void {
  const base = { ...cfg };
  let run = { ...cfg };
  const assists: string[] = [];
  // timing assistance (Practice): gravity × 0.92 on a fresh tier key, never stacked on a retry
  if (platform.options.timingAssist && meta.mode === "practice" && typeof run.difficulty === "string") {
    const tier = Rules.DIFFICULTY[run.difficulty]!;
    run = { ...run, difficulty: { ...tier, gravity: tier.gravity * 0.92 } };
    assists.push("timing");
  }
  run.assists = assists;
  app.sess = new Session.RunSession(run, { mode: meta.mode, ranked: false, allowUndo: meta.allowUndo, onEvents: onSimEvents });
  app.run = { ...meta, cfg: base };
  app.results = null;
  app.lb = null;
  app.replay = null;
  app.away = null;
  summary = { springs: 0, maxChain: 0 };
  toggleDir = undefined;
  render.setTheme(meta.theme);
  render.resetRun();
  app.countdown = 3;
  countdownSteps = 0;
  app.machine = "countdown";
  open("countdown");
  app.focusNext = null;
}
export function playStage(st: Stage): void {
  click();
  startRun({ seed: st.seed, difficulty: st.difficulty, goal: st.goal, mechanics: st.mechanics }, {
    mode: "journey", label: () => stageName(st), theme: st.theme, allowUndo: false, stage: st, par: st.parSeconds,
  });
  app.tutorial = null;
  if (st.tutorial && !progress().tutorialsDone.includes(st.tutorial)) announce(T("Tip: a lesson for this mechanic is available in Learn."));
}
/** quickPlay: the first unfinished Journey stage. */
export function quickPlay(): void {
  const stages = Content.allStages();
  const done = progress().stagesCompleted;
  const next = stages.find((s, i) => i === 0 || (done[stages[i - 1]!.id] && !done[s.id])) ?? stages[0]!;
  playStage(next);
}
export function playDaily(): void {
  click();
  const d = Content.dailyConfig(today());
  startRun({ seed: d.seed, difficulty: d.difficulty, goal: { type: "none", target: 0 }, mechanics: ["bud", "drift", "crumb", "spring", "wisp", "thorn"] }, {
    mode: "daily", label: () => T("Daily {date}", { date: d.date }), theme: d.theme, allowUndo: false,
  });
  app.tutorial = null;
}
/** The practice seed field: digits are the seed, other text hashes (ui.js). */
export function practiceSeed(text: string): number {
  return /^\d+$/.test(text) ? Number(text) >>> 0 : text.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
}
export function playPractice(tier: string, seed: number): void {
  click();
  startRun({ seed, difficulty: tier, goal: { type: "none", target: 0 } }, {
    mode: "practice", label: () => T("Practice ({tier})", { tier: T(Rules.DIFFICULTY[tier]!.label) }),
    theme: Content.THEMES[seed % Content.THEMES.length]!.key, allowUndo: true, tier, seed,
  });
  app.tutorial = null;
}
export function playChallenge(ch: Challenge): void {
  click();
  startRun({ seed: ch.seed, difficulty: ch.difficulty, goal: ch.goal, moveLimitTicks: ch.moveLimitTicks || 0 }, {
    mode: "challenge", label: () => T("Challenge: {name}", { name: T(ch.name) }), theme: ch.theme, allowUndo: false, challenge: ch,
  });
  app.tutorial = null;
}
export function playLesson(def: Lesson): void {
  click();
  startRun({ seed: def.seed, difficulty: def.difficulty, goal: def.goal, mechanics: def.mechanics }, {
    mode: "tutorial", label: () => T("Lesson: {name}", { name: T(def.name) }), theme: def.theme, allowUndo: false, lesson: def,
  });
  app.tutorial = { def, stepIdx: 0, steerTicks: 0 };
  announce(T(def.steps[0]!.text));
}
export function skipLesson(): void { app.tutorial = null; }
export function restartRun(): void {
  const meta = app.run;
  if (!meta) { toTitle(); return; }
  if (meta.mode === "journey" && meta.stage) { playStage(meta.stage); return; }
  if (meta.mode === "tutorial" && meta.lesson) { playLesson(meta.lesson); return; }
  click();
  startRun({ ...meta.cfg }, meta);
}
export function pauseRun(): void {
  if (app.machine !== "active") return;
  app.machine = "paused";
  open("pause");
}
export function resumeRun(): void {
  if (app.machine !== "paused") return;
  app.machine = "active";
  open(null);
}
export function leaveRun(): void { click(); toTitle(); }
export function undo(): void {
  if (app.sess && app.machine === "active" && app.sess.undo()) announce(T("Undone to last landing."));
}

/** replayRun: the last run again at 4×, from its recorded steering; its end is checked against the run's hash. */
export function replayRun(): void {
  const sess = app.sess, meta = app.run;
  if (!sess || !meta) return;
  click();
  const env = sess.buildEnvelope();
  app.sess = new Session.RunSession({ ...sess.cfg }, { mode: meta.mode, ranked: false, allowUndo: false, onEvents: onSimEvents });
  app.replay = { commands: env.commands, idx: 0, checksum: env.checksum };
  app.tutorial = null;
  render.resetRun();
  app.machine = "active";
  open(null);
}

// ------------------------------------------------------------------ lessons
function tutorialTick(): void {
  const t = app.tutorial;
  if (!t || !app.sess) return;
  const step = t.def.steps[t.stepIdx]!;
  const events = app.sess.tutorialEvents;
  let done = false;
  if (step.check.event) done = events.filter((e) => e.type === step.check.event).length >= step.check.count!;
  else if (step.check.steerDir !== undefined) {
    if (app.sess.state.dir === step.check.steerDir) t.steerTicks++;
    done = t.steerTicks >= step.check.ticks!;
  }
  if (!done) return;
  t.stepIdx++;
  t.steerTicks = 0;
  if (t.stepIdx >= t.def.steps.length) {
    const p = progress();
    if (!p.tutorialsDone.includes(t.def.id)) { p.tutorialsDone.push(t.def.id); platform.saveNow(); }
    announce(T("Lesson complete! Keep climbing to finish the run."));
    toast(() => T("Lesson complete! Keep climbing to finish the run."));
    app.tutorial = null;
    return;
  }
  announce(T(t.def.steps[t.stepIdx]!.text));
}
export function resetTutorials(): void {
  click();
  progress().tutorialsDone = [];
  platform.saveNow();
  announce(T("Tutorials reset — find them under Learn."));
  toast(() => T("Tutorials reset — find them under Learn."));
}

// ------------------------------------------------------------------ rules events → sound, effects, haptics
function onSimEvents(events: SimEvent[], state: State): void {
  render.handleEvents(events, state);
  for (const e of events) {
    switch (e.type) {
      case "land": {
        audio.event("bounce");
        if (e.chain > 0 && e.chain % 8 === 0) { audio.event("combo"); announce(T("Chain ×{n}", { n: e.chain })); }
        const plat = state.platforms.find((p) => p.id === e.id);
        if (plat && !plat.alive) audio.event("crumble");
        summary.maxChain = Math.max(summary.maxChain, e.chain);
        break;
      }
      case "spring": audio.event("spring"); summary.springs++; summary.maxChain = Math.max(summary.maxChain, e.chain); break;
      case "token": audio.event("token"); break;
      case "thorn": audio.event("thorn"); break;
      case "terminal":
        if (e.reason === "goal-reached") audio.event("goal");
        else if (e.reason === "fell") audio.event("fall");
        else if (e.reason === "hazard") audio.event("thorn");
        audio.event("milestone");
        break;
    }
  }
  if (events.some((e) => e.type === "spring")) { try { vibrate(15); } catch { /* no haptics */ } }
}

// ------------------------------------------------------------------ the end of a run
const REASONS: Record<string, string> = {
  fell: N("You fell below the garden."), hazard: N("Thorns got you."), "goal-reached": N("Goal reached!"),
  "move-limit": N("Steering budget spent."), "time-out": N("Out of time."),
};
function finishRun(): void {
  const sess = app.sess!, meta = app.run!, s = sess.state;
  app.machine = "results";
  if (app.replay) {
    // the replay's end: the same end state as the run (its hash), the results as they were
    const ok = Rules.stateHash(s) === app.replay.checksum;
    const total = Rules.totalScore(s);
    app.replay = null;
    const line = ok ? () => T("Replay verified: identical end state, score {n}.", { n: total }) : () => T("Replay mismatch — local only.");
    announce(line());
    toast(line);
    if (app.results) { open("results"); return; }
  }
  const score = { ...s.score, total: Rules.totalScore(s) };
  const p = progress();
  const id = meta.stage ? meta.stage.id : meta.mode;
  const result = Progress.recordResult(p, meta.mode, id, score.total, s.terminal, today());
  const fresh = Progress.evaluateAchievements(p, {
    completed: result.completed, altitude: score.altitude, springs: summary.springs, maxChain: summary.maxChain, difficulty: meta.cfg.difficulty,
  }, platform.nowMs());
  platform.saveNow();
  for (const k of fresh) {
    const def = Content.ACHIEVEMENTS.find((a) => a.key === k);
    announce(T("Achievement unlocked: {name}!", { name: def ? T(def.name) : k }));
  }
  let next: Results["next"] = null;
  if (meta.mode === "journey" && result.completed && meta.stage && meta.stage.index + 1 < Content.JOURNEY_STAGE_COUNT) {
    const st = Content.stageConfig(meta.stage.index + 1);
    next = { label: () => T("Next: {name}", { name: stageName(st) }), act: () => playStage(st) };
  } else if (meta.mode === "tutorial") next = { label: () => T("More lessons"), act: () => { click(); app.machine = "title"; app.sess = null; open("learn"); } };
  else next = { label: () => T("Journey"), act: () => { click(); app.machine = "title"; app.sess = null; open("journey"); } };
  const post = platform.signedIn() && (meta.mode === "journey" || meta.mode === "daily" || meta.mode === "challenge");
  app.results = {
    score, reason: s.terminal!.reason, isBest: result.isBest, best: result.best, prevBest: result.prevBest, achievements: fresh, next,
    par: meta.par ?? null, post,
  };
  open("results");
  announce(T("Run over. {reason} Total score {n}.", { reason: T(REASONS[s.terminal!.reason] ?? s.terminal!.reason), n: score.total }));
  if (post) {
    app.lb = "posting";
    const mine = app.results;
    void platform.postScore(score.total).then((r) => { if (app.results === mine) app.lb = r; });
  }
}
export function leaderboardLine(): string | null {
  const r = app.lb;
  if (!r) return null;
  if (r === "posting") return S("lbPosting");
  return !r.posted ? S("lbNotPosted") : r.rank ? S("lbRank", { rank: r.rank }) : S("lbPosted");
}

// ------------------------------------------------------------------ account
export function copyInvite(): void {
  click();
  const link = platform.inviteLink();
  if (!link) return;
  try { clipboard.writeText(link); toast(() => S("inviteCopied")); }
  catch { toast(() => S("inviteLink", { url: link })); }
}
export function signIn(): void { click(); void requestSignIn().catch(() => undefined); }

// ------------------------------------------------------------------ input
/** Rectangles (window pixels) of the HUD, tray, rails and bars, set by screens.ts each frame: presses there are not drags. */
export const uiRects: { x: number; y: number; width: number; height: number }[] = [];
/** The playfield (window pixels): where a drag steers. */
export const stageRect = { x: 0, y: 0, width: 0, height: 0 };
const inside = (r: { x: number; y: number; width: number; height: number }, x: number, y: number): boolean => x >= r.x && y >= r.y && x <= r.x + r.width && y <= r.y + r.height;
/** bindInput's drag steering: a press on the playfield, steering once it moved 24 px sideways. */
let drag: { id: number; x0: number; x: number; moved: boolean } | null = null;
let dragDir = 0;
function dragStart(id: number, x: number, y: number): void {
  if (app.machine !== "active" || app.screen !== null) return;
  if (!inside(stageRect, x, y) || uiRects.some((r) => inside(r, x, y))) return;
  drag = { id, x0: x, x, moved: false };
}
function dragMove(id: number, x: number): void {
  if (!drag || drag.id !== id) return;
  drag.x = x;
  const dx = (drag.x - drag.x0) / ui.preferences().scale;
  if (Math.abs(dx) > 24) drag.moved = true;
  dragDir = !drag.moved ? 0 : Math.abs(dx) < 24 ? 0 : Math.sign(dx);
}
function dragEnd(id: number): void { if (drag && drag.id === id) { drag = null; dragDir = 0; } }
let lastTouch = -1e9;
onTouch((e) => {
  lastTouch = frame().time;
  if (e.phase === "start") dragStart(e.id, e.x, e.y);
  else if (e.phase === "move") dragMove(e.id, e.x);
  else dragEnd(e.id);
});
onPointerButton((e) => {
  if (e.button !== 0 || frame().time - lastTouch < 0.6) return;
  if (e.pressed) dragStart(-1, e.x, e.y); else dragEnd(-1);
});
onPointerMove((x) => { if (frame().time - lastTouch >= 0.6) dragMove(-1, x); });

onAction((e) => {
  if (!e.pressed || ui.capturingKeys()) return;
  if (e.action === "left" || e.action === "right") {
    // steering keys must not also walk the UI focus over the HUD
    if (app.machine === "active" && app.screen === null) ui.setFocus(null);
    return;
  }
  if (frame().frame === app.openedFrame) return;
  switch (e.action) {
    case "pause":
      if (app.machine === "active" && app.screen === null && !app.replay) pauseRun();
      else if (app.machine === "paused" && (app.screen === "pause" || app.screen === "away")) { click(); resumeRun(); }
      else if (app.screen === "help" || app.screen === "settings") overlayBack();
      else if (app.drawer) app.drawer = null;
      else if (app.screen === "results") toTitle();
      else if (app.screen && app.screen !== "title" && app.screen !== "countdown") { click(); open("title"); }
      break;
    case "undo": if (app.sess?.allowUndo) undo(); break;
  }
});

/** The steering this step: keys and pads, else the tray or a drag; held, or toggled with the game's option. */
function steering(): number {
  const keys = (isDown("right") ? 1 : 0) - (isDown("left") ? 1 : 0);
  let dir = keys || app.trayDir || dragDir;
  if (platform.options.toggleSteer) {
    if (dir !== 0) toggleDir = dir;
    if (toggleDir !== undefined) dir = toggleDir;
  } else toggleDir = undefined;
  return dir;
}

const pendingActs: (() => void)[] = [];
/** A widget's press, run once the frame's UI is built (state changes mid-build would break later widgets). */
export function later(fn: () => void): void { pendingActs.push(fn); }

// ------------------------------------------------------------------ boot and lifecycle
let lookKey = "";
function applyLook(): void {
  const f = frame();
  const k = `${f.quality}:${f.levelIndex}`;
  if (k === lookKey) return;
  lookKey = k;
  render.applyLook(lookFor(f.quality, f.levelIndex));
}
const CAPTIONS: Record<string, string> = {
  bounce: N("bounce"), spring: N("spring boost!"), crumble: N("petal breaks"), token: N("glow mote collected"), combo: N("chain bonus"),
  milestone: N("milestone reached"), fall: N("falling!"), thorn: N("thorns!"), goal: N("goal reached!"),
};
audio.onCaption((ev) => {
  const key = CAPTIONS[ev];
  if (key && platform.options.captions) app.caption = { text: key, until: frame().time + 1.6 };
});

onStart(() => {
  setFixedRate(60);
  initStyles();
  platform.initPlatform();
  render.setReducedMotion(preferences().reducedMotion);
  render.setPalette(platform.options.cvdPalette);
  applyLook();
  render.setTheme(Content.THEMES[0]!.key);
  open("title");
  announce(T("Skybound Spring loaded. Press Play to start climbing."));
});
onPreferencesChange((p) => render.setReducedMotion(p.reducedMotion));
platform.onOptionsChange(() => render.setPalette(platform.options.cvdPalette));
platform.onPlayer((on) => { if (!on) toast(() => S("signedOut")); });
onSessionEnded(() => { toast(() => S("signedOut")); }); // keep playing locally
let hidden = false;
onSuspend(() => {
  hidden = true;
  platform.flush();
  if (app.machine === "active" && !app.replay) { pauseRun(); hiddenAt = Date.now(); }
  audio.setSuspended(true);
});
onResume(() => {
  hidden = false;
  audio.setSuspended(false);
  if (hiddenAt && app.machine === "paused") {
    const away = (Date.now() - hiddenAt) / 1000;
    if (away > 5) { app.away = { seconds: Math.round(away), altitude: app.sess?.state.score.altitude ?? 0 }; open("away"); }
  }
  hiddenAt = 0;
});

onFixedUpdate(() => {
  if (hidden) return;
  if (app.machine === "countdown") {
    if (++countdownSteps >= 39) {
      countdownSteps = 0;
      app.countdown -= 1;
      click();
      if (app.countdown < 0) { app.machine = "active"; open(null); }
    }
    return;
  }
  if (app.machine !== "active" || !app.sess) return;
  const sess = app.sess;
  if (app.replay) {
    const rp = app.replay;
    for (let k = 0; k < 4 && !sess.terminal; k++) {
      while (rp.idx < rp.commands.length && rp.commands[rp.idx]!.tick <= sess.state.tick + 1) Rules.applyCommand(sess.state, rp.commands[rp.idx++]!);
      sess.tick();
    }
  } else {
    sess.steer(steering());
    sess.tick();
    if (!sess.terminal) sess.tick();
    tutorialTick();
  }
  audio.setIntensity(Math.min(1, sess.state.score.altitude / 1500));
  if (sess.terminal) finishRun();
});

let frameDt = 0;
onUpdate((dt) => {
  frameDt = Math.min(0.1, dt);
  applyLook();
  applyContrast(ui.preferences().highContrast);
  audio.update();
  const t = frame().time;
  if (app.toast && t > app.toast.until) app.toast = null;
  if (app.caption && t > app.caption.until) app.caption = null;
  if (app.machine === "title") audio.setIntensity(0);
});
onRender(() => {
  uiRects.length = 0;
  drawScreens();
  for (const fn of pendingActs.splice(0)) fn();
  if (announcements.length) {
    const text = announcements.splice(0).join(" ").slice(0, 500);
    try { ui.announce(text); } catch { /* the runtime keeps the newest */ }
  }
  render.draw(app.sess && app.machine !== "title" ? app.sess.state : null, frameDt);
});
