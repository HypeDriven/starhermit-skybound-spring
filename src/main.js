/**
 * Skybound Spring — bootstrap and state machine.
 * boot → title → preparing → countdown → active ↔ paused → resolving →
 * results → title. Every transition carries an explicit reason.
 */
import * as R from './rules.js';
import * as C from './content.js';
import { GameRenderer } from './render.js';
import { UI } from './ui.js';
import { AudioSys } from './audio.js';
import { Platform } from './platform.js';
import {
  RunSession, Analytics, loadLocal, saveLocal, loadProgress, saveProgress,
  recordResult, evaluateAchievements,
} from './session.js';

const DEFAULT_SETTINGS = {
  music: 0.5, effects: 0.7, ambience: 0.4, muted: false, muteWhenHidden: true,
  captions: false, quality: 'medium', leftHanded: false, toggleSteer: false,
  hapticsOff: false, largeText: false, highContrast: false, reducedMotion: false,
  cvdPalette: 'default', timingAssist: false, analyticsConsent: false,
};

function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...(loadLocal('settings', null) || {}) };
}

class Game {
  constructor(root) {
    this.state = 'boot';
    this.settings = loadSettings();
    this.progress = loadProgress();
    this.platform = new Platform();
    this.analytics = new Analytics(this.settings.analyticsConsent);
    this.actions = this.makeActions();
    this.ui = new UI(root, this.actions, this.settings);
    this.audio = new AudioSys(this.settings, (t) => this.ui.caption(t));
    this.renderer = null;
    this.session = null;
    this.runMeta = null;   // { mode, label, cfg, ranked, allowUndo, par }
    this.keys = new Set();
    this.touchDir = 0;
    this.accumulator = 0;
    this.lastFrame = 0;
    this.hiddenAt = null;
    this.replayPlayback = null;
    this.tutorial = null;  // { def, stepIdx, steerTicks }
  }

  setState(next, reason) {
    this.state = next;
    this.ui.setStatus(`${next} — ${reason}`);
  }

  async start() {
    this.setState('boot', 'initial load');
    // Progressive load: rules/UI are already here (bundled); scenic init next.
    this.ui.screens.innerHTML = '<div class="screen open"><div class="panel"><h1>Skybound Spring</h1><p>Loading the garden…</p><progress></progress></div></div>';

    const host = document.getElementById('scene-host');
    this.renderer = new GameRenderer(host, {
      settings: this.settings,
      onContextLost: () => {
        // Preserve the session; show a recoverable message.
        if (this.state === 'active') this.pause('webgl context lost');
        this.ui.announceError('Graphics context lost — your run is paused and safe. Restoring…');
      },
      onContextRestored: () => {
        this.ui.announce('Graphics restored.');
      },
    });
    if (!this.renderer.ok) {
      this.ui.screens.innerHTML = '';
      this.ui.showScreen('Compatibility', this.compatPanel());
      return;
    }
    this.applyTheme(C.THEMES[0]);

    window.addEventListener('resize', () => this.renderer.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.renderer.resize(), 60));
    document.addEventListener('visibilitychange', () => this.onVisibility());
    this.bindInput();

    await this.platform.detect();
    if (this.platform.available) {
      await this.platform.fetchDaily();
      this.ui.setStatus('Online — server time synced, ranked daily available.');
    } else {
      this.ui.setStatus('Offline mode — practice and local daily fully playable.');
    }
    this.toTitle('boot complete');
    requestAnimationFrame((t) => this.frame(t));
  }

  compatPanel() {
    const div = document.createElement('div');
    div.className = 'panel';
    div.innerHTML = '<h1>Compatibility</h1><p>Skybound Spring needs WebGL. Your progress and settings are preserved in this browser; the game is unplayable without 3D.</p>';
    return div;
  }

  applyTheme(themeOrKey) {
    const theme = typeof themeOrKey === 'string' ? C.THEMES.find(t => t.key === themeOrKey) : themeOrKey;
    this.renderer.setTheme(theme || C.THEMES[0]);
  }

  /* ---------------- state transitions ---------------- */

  toTitle(reason) {
    clearInterval(this._cd); // an in-flight countdown must not force-start a run from the title screen
    this.setState('title', reason);
    this.session = null;
    this.tutorial = null;
    this.replayPlayback = null;
    this.ui.updateHud(null);
    this.ui.hideTutorialOverlay();
    this.ui.showTitle({ progress: this.progress, daily: this.platform.daily, online: this.platform.available });
    this.ui.setActions([
      ['Play', () => this.actions.quickPlay(), true],
      ['Journey', () => this.actions.openJourney()],
      ['Settings', () => this.ui.showSettings()],
    ]);
  }

  goalText(cfg, label) {
    if (!cfg.goal || cfg.goal.type === 'none') return `${label}: climb as high as you can.`;
    if (cfg.goal.type === 'altitude') return `${label}: reach ${cfg.goal.target}m altitude${cfg.goal.timeLimitTicks ? ` in ${Math.round(cfg.goal.timeLimitTicks / R.TICK_RATE)}s` : ''}.`;
    return `${label}: collect ${cfg.goal.target} glow motes.`;
  }

  startRun(cfg, meta) {
    const baseConfig = { ...cfg };
    cfg = { ...cfg };
    const assists = [];
    // difficulty is a tier KEY on the first entry, but restartRun re-enters
    // with the already-assisted tier OBJECT from runMeta.cfg — indexing
    // DIFFICULTY with it would crash and double-applying would stack the
    // gravity reduction. Only apply the assist to a fresh string key.
    if (this.settings.timingAssist && meta.mode === 'practice' && typeof cfg.difficulty === 'string') {
      cfg = { ...cfg, difficulty: { ...R.DIFFICULTY[cfg.difficulty], gravity: R.DIFFICULTY[cfg.difficulty].gravity * 0.92 } };
      assists.push('timing');
    }
    cfg.assists = assists;
    this.setState('preparing', meta.reason || 'run setup');
    this.session = new RunSession(cfg, {
      mode: meta.mode,
      ranked: meta.ranked && !assists.length,
      allowUndo: meta.allowUndo,
      onEvents: (evs, state) => this.onSimEvents(evs, state),
    });
    this.runMeta = { ...meta, cfg: baseConfig };
    this.applyTheme(meta.theme || C.THEMES[0]);
    this.ui.closeScreen();
    this.analytics.track('start', { mode: meta.mode });

    let n = 3;
    this.setState('countdown', 'pre-run countdown');
    this.ui.showCountdown(n);
    clearInterval(this._cd);
    this._cd = setInterval(() => {
      n--;
      this.audio.ensure();
      this.audio.play('click');
      if (n < 0) {
        clearInterval(this._cd);
        this.ui.closeScreen();
        this.setState('active', 'countdown finished');
        this.deriveActions();
      } else {
        this.ui.showCountdown(n);
      }
    }, 650);
  }

  pause(reason) {
    if (this.state !== 'active') return;
    this.setState('paused', reason);
    this.ui.showPause({
      mode: this.runMeta.label, ranked: this.session.ranked,
      allowUndo: this.session.allowUndo, tick: this.session.state.tick,
    });
    this.analytics.track('pause', { mode: this.runMeta.mode });
  }

  resume(reason) {
    if (this.state !== 'paused') return;
    this.ui.closeScreen();
    this.setState('active', reason || 'player resumed');
  }

  finishRun() {
    this.setState('resolving', 'terminal state reached');
    const s = this.session.state;
    const meta = this.runMeta;
    const score = { ...s.score, total: R.totalScore(s) };
    const summary = {
      completed: s.terminal.reason === 'goal-reached',
      altitude: score.altitude,
      springs: this.session.tutorialEvents.filter(e => e.type === 'spring').length,
      maxChain: Math.max(...this.session.tutorialEvents.map(e => e.chain || 0), 0),
      difficulty: meta.cfg.difficulty,
    };
    const id = meta.stageId || meta.mode;
    const result = recordResult(this.progress, meta.mode, id, score.total, s.terminal);
    const newAch = evaluateAchievements(this.progress, summary);
    for (const key of newAch) {
      const def = C.ACHIEVEMENTS.find(a => a.key === key);
      this.ui.announce(`Achievement unlocked: ${def ? def.name : key}!`);
      this.platform.unlockAchievement(key);
    }
    this.analytics.track('round-end', { mode: meta.mode, score: score.total, reason: s.terminal.reason });

    const envelope = this.session.buildEnvelope();
    const shouldSubmit = this.session.ranked && (meta.mode === 'daily' || meta.mode === 'practice' || meta.mode === 'journey');
    let submitted = false;
    let submitError = null;
    const showResults = () => {
      this.setState('results', 'run resolved');
      const nextAction = this.nextRecommendedAction(meta, result);
      this.ui.showResults({
        score, terminal: s.terminal, isBest: result.isBest, best: result.best, prevBest: result.prevBest,
        newAchievements: newAch, submitted, submitError, nextAction,
        modeLabel: meta.label, par: meta.par,
      });
      this.ui.setActions([
        ['Retry', () => this.actions.restartRun(), true],
        ['Title', () => this.toTitle('results done')],
      ]);
    };
    if (shouldSubmit && this.platform.available) {
      this.platform.submitScore(envelope, meta.mode).then(r => {
        if (r.ok) submitted = true;
        else submitError = r.recoverable ? 'temporarily unavailable (rate limit) — score kept locally' : (r.error === 'offline' ? 'offline' : 'rejected: ' + r.error);
      }).finally(showResults);
    } else {
      showResults();
    }
  }

  nextRecommendedAction(meta, result) {
    if (meta.mode === 'journey' && result.completed && meta.stage) {
      const next = C.stageConfig(Math.min(meta.stage.index + 1, C.JOURNEY_STAGE_COUNT - 1));
      if (meta.stage.index + 1 < C.JOURNEY_STAGE_COUNT) {
        return { label: `Next: ${next.name}`, fn: () => this.actions.playStage(next) };
      }
    }
    if (meta.mode === 'tutorial') return { label: 'More lessons', fn: () => this.actions.openLearn() };
    return { label: 'Journey', fn: () => this.actions.openJourney() };
  }

  /* ---------------- tutorial ---------------- */

  startTutorial(def) {
    const cfg = {
      seed: def.seed, difficulty: def.difficulty, goal: def.goal, mechanics: def.mechanics,
    };
    this.tutorial = { def, stepIdx: 0, steerTicks: 0, counted: 0 };
    this.startRun(cfg, {
      mode: 'tutorial', label: `Lesson: ${def.name}`, theme: def.theme,
      ranked: false, allowUndo: false, reason: 'tutorial start',
    });
    this.ui.showTutorialOverlay(def.steps[0].text, 0, def.steps.length);
    this.announce(def.steps[0].text);
  }

  tutorialTick() {
    const t = this.tutorial;
    if (!t) return;
    const step = t.def.steps[t.stepIdx];
    const events = this.session.tutorialEvents;
    let done = false;
    if (step.check.event) {
      t.counted = events.filter(e => e.type === step.check.event).length;
      done = t.counted >= step.check.count;
    } else if (step.check.steerDir !== undefined) {
      if (this.session.state.dir === step.check.steerDir) t.steerTicks++;
      done = t.steerTicks >= step.check.ticks;
    }
    if (done) {
      t.stepIdx++;
      t.steerTicks = 0;
      this.analytics.track('tutorial-step', { lesson: t.def.id, step: t.stepIdx });
      if (t.stepIdx >= t.def.steps.length) {
        if (!this.progress.tutorialsDone.includes(t.def.id)) {
          this.progress.tutorialsDone.push(t.def.id);
          saveProgress(this.progress);
        }
        this.ui.hideTutorialOverlay();
        this.ui.announce('Lesson complete! Keep climbing to finish the run.');
        this.tutorial = null;
        return;
      }
      this.ui.showTutorialOverlay(t.def.steps[t.stepIdx].text, t.stepIdx, t.def.steps.length);
      this.announce(t.def.steps[t.stepIdx].text);
    }
  }

  /* ---------------- sim events → audio/vfx ---------------- */

  onSimEvents(events, state) {
    this.renderer.handleEvents(events, state);
    for (const e of events) {
      switch (e.type) {
        case 'land':
          this.audio.play('bounce');
          if (e.chain > 0 && e.chain % 8 === 0) { this.audio.play('combo'); this.ui.announce(`Chain ×${e.chain}`); }
          break;
        case 'spring': this.audio.play('spring'); break;
        case 'token': this.audio.play('token'); break;
        case 'thorn': this.audio.play('thorn'); break;
        case 'terminal':
          if (e.reason === 'goal-reached') this.audio.play('goal');
          else if (e.reason === 'fell') this.audio.play('fall');
          else if (e.reason === 'hazard') this.audio.play('thorn');
          this.audio.play('milestone');
          break;
      }
      if (e.type === 'land') {
        const plat = state.platforms.find(p => p.id === e.id);
        if (plat && !plat.alive) this.audio.play('crumble');
      }
    }
    if (!this.settings.hapticsOff && navigator.vibrate) {
      if (events.some(e => e.type === 'spring')) navigator.vibrate(15);
    }
  }

  /* ---------------- input ---------------- */

  bindInput() {
    const keyDir = () => {
      const lh = this.settings.leftHanded;
      let left = this.keys.has('ArrowLeft') || this.keys.has(lh ? 'KeyD' : 'KeyA');
      let right = this.keys.has('ArrowRight') || this.keys.has(lh ? 'KeyA' : 'KeyD');
      if (lh) { const tmp = left; left = this.keys.has('ArrowRight') || right; right = tmp || this.keys.has('ArrowLeft'); }
      return (right ? 1 : 0) - (left ? 1 : 0);
    };
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === 'active') this.pause('keyboard');
        else if (this.state === 'paused') this.resume('keyboard');
        return;
      }
      if (e.code === 'KeyZ' && this.state === 'active' && this.session && this.session.allowUndo) {
        this.actions.undo();
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code) &&
          ['active', 'countdown'].includes(this.state)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    // Touch/pointer drag steering on the playfield (tap-and-drag; no multi-touch).
    // The overlay screens (title, journey, pause, results, settings Help/Back,
    // etc.) render INSIDE #scene-host, so we only begin steering AND capture the
    // pointer when the press lands on the game canvas itself. Capturing on a
    // press that originated on a button/overlay would swallow the button's
    // click; letting those presses propagate keeps every menu button tappable.
    const canvasHost = document.getElementById('scene-host');
    const gameCanvas = this.renderer && this.renderer.domElement;
    let drag = null;
    canvasHost.addEventListener('pointerdown', (e) => {
      if (e.target !== gameCanvas) return;
      drag = { id: e.pointerId, x0: e.clientX, x: e.clientX, moved: false };
      canvasHost.setPointerCapture(e.pointerId);
    });
    canvasHost.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.x = e.clientX;
      const dx = drag.x - drag.x0;
      if (Math.abs(dx) > 24) drag.moved = true;
      this.touchDir = !drag.moved ? 0 : Math.abs(dx) < 24 ? 0 : Math.sign(dx);
    });
    const endDrag = (e) => {
      if (drag && e.pointerId === drag.id) { drag = null; this.touchDir = 0; }
    };
    canvasHost.addEventListener('pointerup', endDrag);
    canvasHost.addEventListener('pointercancel', endDrag);
    canvasHost.addEventListener('lostpointercapture', endDrag);

    this._keyDir = keyDir;
    this._gamepadTimer = 0;
  }

  pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const ax = gp.axes[0] || 0;
      const dpad = (gp.buttons[15] && gp.buttons[15].pressed ? 1 : 0) - (gp.buttons[14] && gp.buttons[14].pressed ? 1 : 0);
      let dir = dpad || (Math.abs(ax) > 0.3 ? Math.sign(ax) : 0);
      if (this.settings.leftHanded) dir = -dir;
      if (gp.buttons[9] && gp.buttons[9].pressed) {
        const now = performance.now();
        if (now - this._gamepadTimer > 400) {
          this._gamepadTimer = now;
          if (this.state === 'active') this.pause('gamepad');
          else if (this.state === 'paused') this.resume('gamepad');
        }
      }
      return dir;
    }
    return 0;
  }

  /* ---------------- main loop ---------------- */

  onVisibility() {
    if (document.hidden) {
      this.audio.setHidden(true);
      if (this.state === 'active') {
        this.hiddenAt = Date.now();
        this.pause('tab hidden');
      }
    } else {
      this.audio.setHidden(false);
      if (this.hiddenAt && this.state === 'paused') {
        const away = (Date.now() - this.hiddenAt) / 1000;
        this.hiddenAt = null;
        if (away > 5) {
          this.ui.showAwaySummary(away, `Altitude reached: ${this.session ? this.session.state.score.altitude : 0}m.`);
        }
      }
    }
  }

  frame(t) {
    requestAnimationFrame((tt) => this.frame(tt));
    const dt = Math.min(0.1, (t - this.lastFrame) / 1000 || 0.016);
    this.lastFrame = t;

    // Replay playback mode: fast-forward a recorded run, no live input.
    if (this.state === 'active' && this.replayPlayback) {
      this.replayTick();
      this.renderer.render(this.session ? this.session.state : null, dt, document.hidden);
      return;
    }

    if (this.state === 'active' && this.session && !document.hidden) {
      // Steering: keyboard > touch drag > gamepad; hold vs toggle per settings.
      let dir = this._keyDir() || this.touchDir || this.pollGamepad();
      if (this.settings.toggleSteer) {
        if (dir !== 0) this._toggleDir = dir;
        if (this._toggleDir !== undefined) dir = this._toggleDir;
      } else {
        this._toggleDir = undefined;
      }
      this.session.steer(dir);

      // Fixed-timestep accumulator: sim rate never depends on frame rate.
      this.accumulator += dt;
      const step = 1 / R.TICK_RATE;
      let steps = 0;
      while (this.accumulator >= step && steps < 12) {
        this.session.tick();
        this.accumulator -= step;
        steps++;
      }
      if (steps >= 12) this.accumulator = 0; // shed backlog after a hitch

      this.tutorialTick();
      this.audio.setIntensity(Math.min(1, this.session.state.score.altitude / 1500));
      this.ui.updateHud(this.session.state, this.goalText(this.runMeta.cfg, this.runMeta.label));

      if (this.session.terminal) {
        this.finishRun();
      }
    }

    const simState = this.session ? this.session.state : null;
    this.renderer.render(simState, dt, document.hidden);
  }

  deriveActions() {
    this.ui.setActions([
      ['Pause (P)', () => this.actions.pause(), true],
      ...(this.session && this.session.allowUndo ? [['Undo (Z)', () => this.actions.undo()]] : []),
      ['Restart', () => this.actions.restartRun()],
      ['Leave', () => this.actions.leaveRun()],
    ]);
  }

  /* ---------------- actions (UI callbacks) ---------------- */

  makeActions() {
    return {
      quickPlay: () => {
        this.analytics.track('retry', { via: 'quick-play' });
        // Shortest path: continue journey at first unfinished stage.
        const stages = C.allStages();
        const next = stages.find((s, i) => i === 0 || (this.progress.stagesCompleted[stages[i - 1].id] && !this.progress.stagesCompleted[s.id]))
          || stages[0];
        this.actions.playStage(next);
      },
      openJourney: () => this.ui.showJourney(this.progress),
      openLearn: () => this.ui.showLearn(this.progress),
      openPractice: () => this.ui.showPractice(),
      openChallenges: () => this.ui.showChallenges(),
      openProfile: () => this.ui.showProfile({ progress: this.progress, platform: this.platform }),
      toTitle: () => this.toTitle('navigation'),
      playStage: (stage) => {
        this.startRun({
          seed: stage.seed, difficulty: stage.difficulty, goal: stage.goal, mechanics: stage.mechanics,
        }, {
          mode: 'journey', label: stage.name, theme: stage.theme, ranked: false,
          allowUndo: false, stage, stageId: stage.id, par: stage.parSeconds,
          reason: 'journey stage selected',
        });
        if (stage.tutorial && !this.progress.tutorialsDone.includes(stage.tutorial)) {
          const tut = C.TUTORIALS.find(t => t.id === stage.tutorial);
          if (tut) this.ui.announce('Tip: a lesson for this mechanic is available in Learn.');
        }
      },
      playDaily: () => {
        const daily = this.platform.daily || C.dailyConfig();
        this.startRun({
          seed: daily.seed, difficulty: daily.difficulty,
          goal: { type: 'none', target: 0 }, mechanics: ['bud', 'drift', 'crumb', 'spring', 'wisp', 'thorn'],
        }, {
          mode: 'daily', label: `Daily ${daily.date || 'challenge'}`, theme: daily.theme,
          ranked: this.platform.available, allowUndo: false, reason: 'daily start',
        });
      },
      playPractice: (tier, seed) => {
        this.startRun({ seed, difficulty: tier, goal: { type: 'none', target: 0 } }, {
          mode: 'practice', label: `Practice (${R.DIFFICULTY[tier].label})`,
          theme: C.THEMES[seed % C.THEMES.length].key,
          ranked: false, allowUndo: true, reason: 'practice start',
        });
      },
      playChallenge: (ch) => {
        this.startRun({
          seed: ch.seed, difficulty: ch.difficulty, goal: ch.goal,
          moveLimitTicks: ch.moveLimitTicks || 0,
        }, {
          mode: 'challenge', label: `Challenge: ${ch.name}`, theme: ch.theme,
          ranked: false, allowUndo: false, reason: 'challenge start',
        });
      },
      playTutorial: (tut) => this.startTutorial(tut),
      skipTutorial: () => { this.tutorial = null; this.ui.hideTutorialOverlay(); },
      pause: () => this.pause('player'),
      resume: () => this.resume('player'),
      leaveRun: () => this.toTitle('run left'),
      restartRun: () => {
        if (!this.runMeta) return this.toTitle('no run');
        this.analytics.track('retry', { mode: this.runMeta.mode });
        const meta = this.runMeta;
        if (meta.mode === 'journey' && meta.stage) this.actions.playStage(meta.stage);
        else this.startRun({ ...meta.cfg }, { ...meta, reason: 'retry' });
      },
      replayRun: () => {
        if (!this.session) return;
        // Skip-to-end verification + quick visual replay at 4x.
        const env = this.session.buildEnvelope();
        const settled = RunSession.replaySettle(env);
        this.ui.announce(settled.matchesTerminal
          ? `Replay verified: identical end state, score ${settled.score.total}.`
          : 'Replay mismatch — local only.');
        this.ui.closeScreen();
        this.setState('active', 'replay playback');
        const cfg = { ...this.runMeta.cfg };
        this.session = new RunSession(cfg, {
          mode: this.runMeta.mode, ranked: false, allowUndo: false,
          onEvents: (evs, st) => this.onSimEvents(evs, st),
        });
        this.replayPlayback = { commands: env.commands, idx: 0, speed: 4 };
      },
      undo: () => {
        if (this.session && this.session.undo()) {
          this.ui.announce('Undone to last landing.');
        }
      },
      steerStart: (dir) => { this.touchDir = dir; },
      steerStop: () => { this.touchDir = 0; },
      settingsChanged: () => {
        saveLocal('settings', this.settings);
        this.ui.applySettings();
        this.audio.applySettings();
        this.analytics.setConsent(this.settings.analyticsConsent);
        if (this.renderer) {
          this.renderer.settings = this.settings;
          this.renderer.setQuality(this.settings.quality);
        }
        this.analytics.track('settings-change', {});
      },
      resetTutorials: () => {
        this.progress.tutorialsDone = [];
        saveProgress(this.progress);
        this.ui.announce('Tutorials reset — find them under Learn.');
      },
    };
  }

  /* ---------------- replay playback (deterministic fast-forward) ---------------- */

  replayTick() {
    const rp = this.replayPlayback;
    if (!rp) return;
    for (let k = 0; k < rp.speed && !this.session.terminal; k++) {
      while (rp.idx < rp.commands.length && rp.commands[rp.idx].tick <= this.session.state.tick + 1) {
        R.applyCommand(this.session.state, rp.commands[rp.idx]);
        rp.idx++;
      }
      this.session.tick();
    }
    if (this.session.terminal) {
      const s = this.session.state;
      this.replayPlayback = null;
      this.finishRun();
    }
  }
}

/* ---------------- boot ---------------- */

const game = new Game(document.getElementById('app'));
// Debug/testing hook (no gameplay effect; used by smoke tests).
window.__game = game;

game.start().catch((e) => {
  console.error(e);
  document.getElementById('app').innerHTML =
    '<div class="screen open"><div class="panel"><h1>Skybound Spring</h1><p>Failed to start: ' +
    String(e && e.message || e) + '</p></div></div>';
});
