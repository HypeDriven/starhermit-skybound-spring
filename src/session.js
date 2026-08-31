/**
 * Skybound Spring — run lifecycle: input recording, periodic state hashes,
 * replay envelopes, undo snapshots (practice), local persistence, analytics.
 * No DOM rendering here; the sim only advances through rules.js commands.
 */
import * as R from './rules.js';

const SAVE_VERSION = 1;
const SAVE_PREFIX = 'skybound-spring:';

/* ---------------- versioned + checksummed local persistence ---------------- */

function checksum(str) {
  return R.fnv1a(str).toString(16).padStart(8, '0');
}

export function saveLocal(key, obj) {
  try {
    const payload = JSON.stringify({ v: SAVE_VERSION, data: obj });
    localStorage.setItem(SAVE_PREFIX + key, JSON.stringify({ payload, checksum: checksum(payload) }));
    return true;
  } catch { return false; }
}

export function loadLocal(key, migrate) {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + key);
    if (!raw) return null;
    const outer = JSON.parse(raw);
    if (!outer || checksum(outer.payload) !== outer.checksum) {
      // Corrupt/tampered local doc: keep it aside rather than deleting.
      localStorage.setItem(SAVE_PREFIX + key + '.corrupt', raw);
      return null;
    }
    let doc = JSON.parse(outer.payload);
    if (doc.v !== SAVE_VERSION) {
      if (!migrate) return null;
      doc = migrate(doc); // e.g. v0 -> v1
      if (!doc || doc.v !== SAVE_VERSION) return null;
    }
    return doc.data;
  } catch { return null; }
}

/* ---------------- analytics (anonymous, consent-gated, buffered) ---------------- */

const ALLOWED_EVENTS = new Set(['start', 'tutorial-step', 'round-end', 'retry', 'settings-change', 'error-category']);

export class Analytics {
  constructor(consent) {
    this.consent = !!consent;
    this.sessionId = 's-' + Math.random().toString(36).slice(2, 10);
    this.buffer = loadLocal('analytics-buffer', null) || [];
  }
  setConsent(v) { this.consent = !!v; }
  track(event, data = {}) {
    if (!this.consent || !ALLOWED_EVENTS.has(event)) return;
    this.buffer.push({ t: Date.now(), session: this.sessionId, event, data });
    if (this.buffer.length > 200) this.buffer.splice(0, 100);
    saveLocal('analytics-buffer', this.buffer);
  }
  flush() {
    // Hosted telemetry endpoint is optional; buffer stays local if absent.
    this.buffer = [];
    saveLocal('analytics-buffer', this.buffer);
  }
}

/* ---------------- run session ---------------- */

export class RunSession {
  /**
   * cfg: rules config. opts: { mode, ranked, allowUndo, onEvents }
   */
  constructor(cfg, opts = {}) {
    this.cfg = cfg;
    this.mode = opts.mode || 'practice';
    this.ranked = !!opts.ranked;
    this.allowUndo = !!opts.allowUndo;
    this.onEvents = opts.onEvents || (() => {});
    this.runId = 'run-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    this.cmdCounter = 0;
    this.state = R.createInitialState(cfg);
    this.initialHash = R.stateHash(this.state);
    this.commands = [];
    this.hashes = [{ tick: 0, hash: this.initialHash }];
    this.undoStack = [];
    this.tutorialEvents = []; // raw event stream for tutorial checks
    this.finished = false;
  }

  get terminal() { return this.state.terminal; }

  /** Quantized steering input. Returns true if the command was legal. */
  steer(dir) {
    if (this.state.dir === dir || this.finished) return true;
    const cmd = { id: `${this.runId}:${this.cmdCounter++}`, tick: this.state.tick + 1, type: 'steer', dir };
    const r = R.applyCommand(this.state, cmd);
    if (r.invalidReason) return false;
    this.commands.push(cmd);
    return true;
  }

  /** Advance one fixed tick; collects events + periodic hashes. */
  tick() {
    if (this.finished) return;
    const wasTerminal = !!this.state.terminal;
    const events = R.step(this.state);
    for (const e of events) {
      this.tutorialEvents.push({ ...e, tick: this.state.tick, dir: this.state.dir });
      if (e.type === 'land' || e.type === 'spring') {
        if (this.allowUndo) {
          this.undoStack.push(R.serializeState(this.state));
          if (this.undoStack.length > 24) this.undoStack.shift();
        }
      }
    }
    if (events.length) this.onEvents(events, this.state);
    if (this.state.tick % (R.TICK_RATE * 2) === 0) {
      this.hashes.push({ tick: this.state.tick, hash: R.stateHash(this.state) });
    }
    if (this.state.terminal && !wasTerminal) {
      this.finished = true;
      this.hashes.push({ tick: this.state.tick, hash: R.stateHash(this.state) });
    }
  }

  /** Practice undo: restore the last landing snapshot. */
  undo() {
    if (!this.allowUndo || this.undoStack.length === 0) return false;
    const snap = this.undoStack.pop();
    this.state = R.deserializeState(snap);
    this.finished = false;
    // Truncate recorded commands/hashes past the restored tick.
    this.commands = this.commands.filter(c => c.tick <= this.state.tick);
    this.hashes = this.hashes.filter(h => h.tick <= this.state.tick);
    return true;
  }

  /** Replay envelope for validation/sharing. */
  buildEnvelope() {
    return {
      schemaVersion: R.SCHEMA_VERSION,
      buildVersion: R.BUILD_VERSION,
      contentVersion: R.CONTENT_VERSION,
      seed: this.cfg.seed,
      settings: {
        difficulty: this.cfg.difficulty,
        goal: this.cfg.goal,
        moveLimitTicks: this.cfg.moveLimitTicks || 0,
        mechanics: this.cfg.mechanics,
        assists: this.cfg.assists || [],
      },
      initialHash: this.initialHash,
      timestampOffset: 0,
      commands: [...this.commands],
      hashes: [...this.hashes],
      terminal: this.state.terminal,
      scoreComponents: { ...this.state.score, total: R.totalScore(this.state) },
      checksum: R.stateHash(this.state),
    };
  }

  /** Settle an envelope to the exact deterministic end state (skip-to-end). */
  static replaySettle(envelope) {
    const cfg = {
      seed: envelope.seed,
      difficulty: envelope.settings.difficulty,
      goal: envelope.settings.goal,
      moveLimitTicks: envelope.settings.moveLimitTicks || 0,
      mechanics: envelope.settings.mechanics,
    };
    const result = R.simulateRun(cfg, envelope.commands);
    return {
      ...result,
      matchesTerminal: result.hash === envelope.checksum,
      periodicOk: (envelope.hashes || []).every(h => {
        // Periodic hashes are advisory; only the terminal hash is authoritative.
        return typeof h.hash === 'string' && Number.isInteger(h.tick);
      }),
    };
  }
}

/* ---------------- progress / bests ---------------- */

export function loadProgress() {
  return loadLocal('progress', (doc) => doc.v === 0 ? { v: 1, data: { stagesCompleted: {}, bests: {}, achievements: {}, daysPlayed: [], tutorialsDone: [] } } : null)
    || { stagesCompleted: {}, bests: {}, achievements: {}, daysPlayed: [], tutorialsDone: [] };
}
export function saveProgress(p) { saveLocal('progress', p); }

export function recordResult(progress, mode, id, score, terminal) {
  const completed = terminal && terminal.reason === 'goal-reached';
  if (mode === 'journey') {
    const prev = progress.stagesCompleted[id] || 0;
    if (completed && score > prev) progress.stagesCompleted[id] = score;
  }
  const best = progress.bests[mode] || 0;
  const isBest = score > best;
  if (isBest) progress.bests[mode] = score;
  const today = new Date().toISOString().slice(0, 10);
  if (!progress.daysPlayed.includes(today)) progress.daysPlayed.push(today);
  saveProgress(progress);
  return { completed, isBest, prevBest: best, best: Math.max(best, score) };
}

/** Evaluate achievement unlocks from a finished run. Returns newly unlocked keys. */
export function evaluateAchievements(progress, runSummary) {
  const fresh = [];
  const unlock = (key) => {
    if (!progress.achievements[key]) { progress.achievements[key] = Date.now(); fresh.push(key); }
  };
  if (runSummary.completed || runSummary.altitude >= 300) unlock('first-ascent');
  if (runSummary.springs >= 25) unlock('spring-master');
  if (runSummary.maxChain >= 30) unlock('streak-tender');
  if (runSummary.completed && runSummary.difficulty === 'storm') unlock('storm-summit');
  if (progress.daysPlayed.length >= 7) unlock('evergreen');
  saveProgress(progress);
  return fresh;
}
