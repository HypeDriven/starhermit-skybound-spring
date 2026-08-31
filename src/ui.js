/**
 * Skybound Spring — semantic HTML UI shell over the WebGL canvas.
 * All screens, focus management, live regions, settings, help cards.
 * No game rules here; UI calls host actions and renders host-provided state.
 */
import { THEMES, ACHIEVEMENTS, TUTORIALS, allStages, CHALLENGES, masteryTrack } from './content.js';
import { DIFFICULTY } from './rules.js';
import { GameRenderer } from './render.js';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c) node.append(c);
  return node;
}

function button(label, onClick, cls = 'btn') {
  return el('button', { class: cls, type: 'button', onclick: (e) => { e.currentTarget.blur(); onClick(e); } }, label);
}

export class UI {
  /** actions: callbacks implemented by main.js. */
  constructor(root, actions, initialSettings) {
    this.root = root;
    this.actions = actions;
    this.settings = initialSettings;
    this.screenStack = [];
    this.lastFocus = null;
    this.build();
    this.applySettings();
  }

  build() {
    this.root.innerHTML = '';
    this.root.className = 'app';

    // Live regions
    this.livePolite = el('div', { class: 'sr-only', 'aria-live': 'polite', role: 'status' });
    this.liveAssertive = el('div', { class: 'sr-only', 'aria-live': 'assertive', role: 'alert' });
    // Navigable text mirror of the 3D board
    this.boardMirror = el('div', { class: 'sr-only', 'aria-live': 'polite', id: 'board-mirror' });
    // Audio captions
    this.captions = el('div', { class: 'captions', 'aria-hidden': 'false' });

    // Canvas host
    this.sceneHost = el('div', { class: 'scene-host', id: 'scene-host' });

    // Left rail: objective/progression
    this.railLeft = el('aside', { class: 'rail rail-left', 'aria-label': 'Objective and progress' });
    // Right rail: contextual actions/status
    this.railRight = el('aside', { class: 'rail rail-right', 'aria-label': 'Actions and status' });
    // Portrait mobile: top status bar + bottom thumb tray
    this.topBar = el('header', { class: 'top-bar' });
    this.thumbTray = el('nav', { class: 'thumb-tray', 'aria-label': 'Touch steering' });

    // HUD
    this.hud = el('div', { class: 'hud', role: 'region', 'aria-label': 'Play status' });

    // Overlay screens host
    this.screens = el('div', { class: 'screens' });

    this.root.append(this.livePolite, this.liveAssertive, this.boardMirror, this.captions,
      this.topBar, this.railLeft, this.sceneHost, this.railRight, this.hud, this.thumbTray, this.screens);

    this.buildRails();
    this.buildHud();
    this.buildThumbTray();
  }

  buildRails() {
    this.railLeft.innerHTML = '';
    this.objectiveBox = el('div', { class: 'card' },
      el('h2', { text: 'Objective' }), this.objectiveText = el('p', { text: '—' }));
    this.progressBox = el('div', { class: 'card' },
      el('h2', { text: 'Progress' }), this.progressText = el('p', { text: '—' }));
    this.railLeft.append(this.objectiveBox, this.progressBox);

    this.railRight.innerHTML = '';
    this.actionsBox = el('div', { class: 'card actions-card' });
    this.statusBox = el('div', { class: 'card' },
      el('h2', { text: 'Status' }), this.statusText = el('p', { text: 'Offline practice available.' }));
    this.railRight.append(this.actionsBox, this.statusBox);
  }

  buildHud() {
    this.hud.innerHTML = '';
    this.hudScore = el('div', { class: 'hud-item', 'aria-label': 'Score' });
    this.hudChain = el('div', { class: 'hud-item', 'aria-label': 'Chain' });
    this.hudAlt = el('div', { class: 'hud-item', 'aria-label': 'Altitude' });
    this.hudPause = button('⏸ Pause', () => this.actions.pause(), 'btn btn-small');
    this.hud.append(this.hudAlt, this.hudScore, this.hudChain, this.hudPause);
    this.hud.hidden = true;
  }

  buildThumbTray() {
    this.thumbTray.innerHTML = '';
    const left = el('button', { class: 'thumb-btn', type: 'button', 'aria-label': 'Steer left', text: '◀' });
    const right = el('button', { class: 'thumb-btn', type: 'button', 'aria-label': 'Steer right', text: '▶' });
    const bind = (node, dir) => {
      const start = (e) => { e.preventDefault(); this.actions.steerStart(dir); };
      const end = (e) => { e.preventDefault(); this.actions.steerStop(dir); };
      node.addEventListener('pointerdown', start);
      node.addEventListener('pointerup', end);
      node.addEventListener('pointercancel', end);
      node.addEventListener('lostpointercapture', end);
    };
    bind(left, -1);
    bind(right, 1);
    this.thumbTray.append(left, right);
    this.thumbTray.hidden = true;
  }

  /* ---------------- announcements ---------------- */

  announce(msg, assertive = false) {
    (assertive ? this.liveAssertive : this.livePolite).textContent = '';
    (assertive ? this.liveAssertive : this.livePolite).textContent = msg;
  }
  announceError(msg) { this.announce('Error: ' + msg, true); }
  caption(text) {
    this.captions.textContent = text;
    clearTimeout(this._capT);
    this._capT = setTimeout(() => { this.captions.textContent = ''; }, 1600);
  }

  /* ---------------- screen manager ---------------- */

  showScreen(name, node) {
    this.lastFocus = document.activeElement;
    this.screens.innerHTML = '';
    if (node) {
      const wrap = el('section', { class: 'screen', role: 'dialog', 'aria-label': name, tabindex: '-1' });
      wrap.append(node);
      this.screens.append(wrap);
      wrap.focus();
      this.screens.classList.add('open');
    } else {
      this.screens.classList.remove('open');
    }
    this.currentScreen = name;
  }

  closeScreen(restoreFocusTo) {
    this.screens.innerHTML = '';
    this.screens.classList.remove('open');
    this.currentScreen = null;
    const target = restoreFocusTo || this.lastFocus;
    if (target && target.isConnected && target.focus) target.focus();
  }

  /* ---------------- screens ---------------- */

  showTitle(data) {
    const { progress, daily, online } = data;
    const done = Object.keys(progress.stagesCompleted).length;
    const node = el('div', { class: 'panel title-panel' },
      el('h1', { class: 'game-title', text: 'Skybound Spring' }),
      el('p', { class: 'tagline', text: 'Bounce up the endless garden. Chain landings, dodge thorns, chase the sky.' }),
      button('▶ Play', () => this.actions.quickPlay(), 'btn btn-primary btn-huge'),
      el('div', { class: 'row gap' },
        button('Journey', () => this.actions.openJourney()),
        button(daily ? `Daily (${daily.date})` : 'Daily (offline seed)', () => this.actions.playDaily()),
        button('Learn', () => this.actions.openLearn())),
      el('div', { class: 'row gap' },
        button('Practice', () => this.actions.openPractice()),
        button('Challenges', () => this.actions.openChallenges()),
        button('Profile', () => this.actions.openProfile())),
      el('div', { class: 'row gap' },
        button('Settings', () => this.showSettings()), button('Help', () => this.showHelp())),
      el('p', { class: 'muted', text: `Journey: ${done}/40 stages · ${online ? 'Online — ranked daily available' : 'Offline — practice & local daily'}` }),
    );
    this.showScreen('Title', node);
  }

  showJourney(progress) {
    const stages = allStages();
    const list = el('ol', { class: 'stage-list' });
    const firstLocked = stages.findIndex((s, i) => i > 0 && !progress.stagesCompleted[stages[i - 1].id]);
    stages.forEach((s, i) => {
      const unlocked = i === 0 || !!progress.stagesCompleted[stages[i - 1].id];
      const best = progress.stagesCompleted[s.id];
      const theme = THEMES.find(t => t.key === s.theme);
      const item = el('li', {},
        button(
          `${s.mastery ? '★ ' : ''}${s.name} — ${s.goal.type === 'tokens' ? `collect ${s.goal.target} motes` : `reach ${s.goal.target}m`} · par ${s.parSeconds}s ${best !== undefined ? '· best ' + best : ''}`,
          unlocked ? () => this.actions.playStage(s) : null,
          'btn btn-stage' + (unlocked ? '' : ' btn-locked')),
        el('span', { class: 'muted small', text: ` ${theme.name} · ${s.difficulty}` }));
      if (!unlocked) item.firstChild.disabled = true;
      if (i === firstLocked) item.classList.add('next-up');
      list.append(item);
    });
    const track = masteryTrack(progress);
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Journey' }),
      el('p', { class: 'muted', text: `Mastery gates: ${track.filter(t => t.completed).length}/${track.length} cleared` }),
      el('div', { class: 'scroll-list' }, list),
      button('Back', () => this.actions.toTitle()));
    this.showScreen('Journey', node);
  }

  showLearn(progress) {
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Learn' }),
      el('p', { class: 'muted', text: 'Short interactive lessons. You must perform each move to advance.' }),
      ...TUTORIALS.map(t => el('div', { class: 'row gap' },
        button(`${t.name}${progress.tutorialsDone.includes(t.id) ? ' ✓' : ''}`, () => this.actions.playTutorial(t)),
        el('span', { class: 'muted small', text: t.steps[0].text.slice(0, 60) + '…' }))),
      button('Back', () => this.actions.toTitle()));
    this.showScreen('Learn', node);
  }

  showPractice() {
    let tier = 'sprout';
    let seedStr = String(Math.floor(Math.random() * 1e9));
    const seedInput = el('input', { type: 'text', value: seedStr, 'aria-label': 'Practice seed', maxlength: '12' });
    seedInput.addEventListener('input', () => { seedStr = seedInput.value; });
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Practice' }),
      el('p', { class: 'muted', text: 'Unranked. Free restart, undo-to-last-landing (Z), any difficulty. Expected session: 2–5 minutes.' }),
      el('div', { class: 'row gap' }, Object.values(DIFFICULTY).map(d => {
        const b = button(d.label, () => { tier = d.key; node.querySelectorAll('.tier-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); }, 'btn tier-btn');
        if (d.key === tier) b.classList.add('active');
        return b;
      })),
      el('label', { class: 'row gap' }, 'Seed (shareable): ', seedInput),
      button('Start practice run', () => {
        const seed = /^\d+$/.test(seedStr) ? Number(seedStr) >>> 0 : seedStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
        this.actions.playPractice(tier, seed);
      }, 'btn btn-primary'),
      button('Back', () => this.actions.toTitle()));
    this.showScreen('Practice', node);
  }

  showChallenges() {
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Challenges' }),
      ...CHALLENGES.map(c => el('div', { class: 'card' },
        el('h2', { text: c.name }),
        el('p', { text: c.description }),
        el('p', { class: 'muted small', text: `Difficulty: ${DIFFICULTY[c.difficulty].label} · Ranked: no · Expected: under 2 minutes` }),
        button('Attempt', () => this.actions.playChallenge(c), 'btn btn-primary'))),
      button('Back', () => this.actions.toTitle()));
    this.showScreen('Challenges', node);
  }

  async showProfile(data) {
    const { progress, platform } = data;
    const nameInput = el('input', { type: 'text', value: platform.playerName, 'aria-label': 'Display name', maxlength: '32' });
    const boardsNode = el('div', { class: 'boards' }, el('p', { class: 'muted', text: 'Loading boards…' }));
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Profile' }),
      el('label', { class: 'row gap' }, 'Display name: ', nameInput,
        button('Save', () => { platform.setPlayerName(nameInput.value); this.announce('Name saved.'); })),
      el('h2', { text: 'Achievements' }),
      el('ul', {}, ...ACHIEVEMENTS.map(a => el('li', {},
        el('strong', { text: a.name }), ` — ${a.description} `,
        el('span', { class: progress.achievements[a.key] ? 'unlocked' : 'muted', text: progress.achievements[a.key] ? '✓ unlocked' : 'locked' })))),
      el('h2', { text: 'Leaderboards' }),
      boardsNode,
      button('Back', () => this.actions.toTitle()));
    this.showScreen('Profile', node);

    const scopes = platform.available ? ['global', 'daily', 'weekly'] : [];
    boardsNode.innerHTML = '';
    if (!scopes.length) {
      boardsNode.append(el('p', { class: 'muted', text: 'Offline — leaderboards need the hosted server. Local bests:' }),
        el('p', {}, `Practice best: ${progress.bests.practice || 0} · Daily best: ${progress.bests.daily || 0} · Journey stages: ${Object.keys(progress.stagesCompleted).length}/40`));
      return;
    }
    for (const scope of scopes) {
      const wrap = el('div', { class: 'card' }, el('h3', { text: scope[0].toUpperCase() + scope.slice(1) }), el('ol', { class: 'board-list' }));
      boardsNode.append(wrap);
      const r = await platform.leaderboard(scope);
      const list = wrap.querySelector('.board-list');
      if (!r.ok) { wrap.append(el('p', { class: 'muted', text: r.recoverable ? 'Temporarily unavailable (rate limit) — try again soon.' : 'Unavailable offline.' })); continue; }
      if (!r.entries.length) { wrap.append(el('p', { class: 'muted', text: 'No entries yet — be the first!' })); continue; }
      for (const e of r.entries.slice(0, 10)) {
        list.append(el('li', {}, `${e.playerName || 'Guest'} — ${e.score} (${e.mode})`));
      }
    }
  }

  showPause(data) {
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Paused' }),
      button('▶ Resume', () => this.actions.resume(), 'btn btn-primary btn-huge'),
      el('div', { class: 'row gap' },
        button('Restart', () => this.actions.restartRun()),
        data.allowUndo ? button('Undo to last landing (Z)', () => this.actions.undo()) : null,
        button('Settings', () => this.showSettings(() => this.showPause(data))),
        button('Help', () => this.showHelp(() => this.showPause(data)))),
      button('Leave run', () => this.actions.leaveRun(), 'btn btn-danger'),
      el('p', { class: 'muted small', text: `Mode: ${data.mode} · Ranked: ${data.ranked ? 'yes' : 'no'} · Tick ${data.tick}` }));
    this.showScreen('Paused', node);
  }

  showResults(data) {
    const { score, terminal, isBest, best, prevBest, newAchievements, submitted, submitError, nextAction, modeLabel, par } = data;
    const reasons = {
      fell: 'You fell below the garden.', hazard: 'Thorns got you.', 'goal-reached': 'Goal reached!',
      'move-limit': 'Steering budget spent.', 'time-out': 'Out of time.',
    };
    const node = el('div', { class: 'panel' },
      el('h1', { text: terminal.reason === 'goal-reached' ? '🌼 Goal reached!' : 'Run over' }),
      el('p', { class: 'result-reason', text: reasons[terminal.reason] || terminal.reason }),
      el('div', { class: 'score-breakdown', role: 'table', 'aria-label': 'Score breakdown' },
        el('div', { role: 'row' }, el('span', { text: 'Altitude' }), el('strong', { text: String(score.altitude) })),
        el('div', { role: 'row' }, el('span', { text: 'Chain bonus' }), el('strong', { text: String(score.chainBonus) })),
        el('div', { role: 'row' }, el('span', { text: 'Glow motes' }), el('strong', { text: String(score.tokens) })),
        el('div', { role: 'row', class: 'total' }, el('span', { text: 'Total' }), el('strong', { text: String(score.total) }))),
      par ? el('p', { class: 'muted', text: `Par: ${par}s` }) : null,
      el('p', { class: 'muted', text: isBest ? `New best!${prevBest ? ` (was ${prevBest})` : ""}` : `Best: ${best}` }),
      newAchievements.length ? el('p', { class: 'achv', text: 'Achievement unlocked: ' + newAchievements.join(', ') }) : null,
      el('p', { class: 'muted small', text: submitted ? 'Score validated & submitted to leaderboard.' : (submitError ? `Leaderboard: ${submitError}` : 'Unranked run.') }),
      el('div', { class: 'row gap' },
        button('Retry', () => this.actions.restartRun(), 'btn btn-primary'),
        button('Watch replay', () => this.actions.replayRun()),
        nextAction ? button(nextAction.label, nextAction.fn) : null),
      button('Continue', () => this.actions.toTitle()));
    this.showScreen('Results', node);
    this.announce(`Run over. ${reasons[terminal.reason]}. Total score ${score.total}.`, true);
  }

  showCountdown(n) {
    this.showScreen('Countdown', el('div', { class: 'panel countdown-panel' },
      el('p', { class: 'countdown-num', text: n > 0 ? String(n) : 'Go!' })));
  }

  showAwaySummary(seconds, what) {
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'Welcome back' }),
      el('p', { text: `You were away ${Math.round(seconds)}s. The run was paused — nothing happened while you were gone.` }),
      el('p', { class: 'muted', text: what }),
      button('Resume', () => this.actions.resume(), 'btn btn-primary'));
    this.showScreen('Away', node);
  }

  showTutorialOverlay(text, stepIdx, stepCount) {
    let bar = document.getElementById('tut-bar');
    if (!bar) {
      bar = el('div', { class: 'tutorial-bar', id: 'tut-bar', role: 'status' });
      this.root.append(bar);
    }
    bar.innerHTML = '';
    bar.append(el('span', { class: 'tutorial-step', text: `Lesson ${stepIdx + 1}/${stepCount}` }),
      el('p', { text }), button('Skip lesson', () => this.actions.skipTutorial(), 'btn btn-small'));
  }
  hideTutorialOverlay() {
    const bar = document.getElementById('tut-bar');
    if (bar) bar.remove();
  }

  showHelp(backTo) {
    const cards = [
      ['Auto-bounce', 'Your sprout-hopper bounces on its own. Land on pads to keep climbing — each landing bounces you again.'],
      ['Steering', 'Hold ← / → or A / D to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.'],
      ['Screen wrap', 'Fly off the left edge and you reappear on the right (and vice versa). Classic garden physics!'],
      ['Leaf pads (green)', 'Safe, sturdy, unlimited bounces.'],
      ['Moving leaves (blue)', 'Slide sideways near their perch. Time your landing.'],
      ['Brittle petals (brown)', 'Break after one landing. Never plan to come back.'],
      ['Spring blossoms (pink)', 'Launch you nearly twice as high. Chain them for huge climbs.'],
      ['Wisp pads (pale)', 'Fragile: one landing and they fade.'],
      ['Thorn clusters (red spikes)', 'Never land on thorns — the run ends instantly.'],
      ['Glow motes (gold)', 'Worth 100 points each. Grab them mid-flight.'],
      ['Chains', 'Land on successively higher pads to grow your chain bonus. Dropping to a lower pad resets it.'],
      ['Falling', 'The camera only moves up. Fall below the bottom of the view and the run ends.'],
      ['Undo (practice)', 'Press Z in practice to jump back to your last landing.'],
    ];
    const node = el('div', { class: 'panel' },
      el('h1', { text: 'How to play' }),
      el('div', { class: 'help-grid' }, ...cards.map(([t, d]) =>
        el('div', { class: 'card' }, el('h3', { text: t }), el('p', { text: d })))),
      button('Back', () => backTo ? backTo() : this.actions.toTitle()));
    this.showScreen('Help', node);
  }

  showSettings(backTo) {
    const s = this.settings;
    const slider = (label, key, min = 0, max = 1) => {
      const input = el('input', { type: 'range', min, max, step: '0.05', value: s[key], 'aria-label': label });
      input.addEventListener('input', () => { s[key] = Number(input.value); this.actions.settingsChanged(); });
      return el('label', { class: 'row slider-row' }, el('span', { text: label }), input);
    };
    const toggle = (label, key) => {
      const input = el('input', { type: 'checkbox', 'aria-label': label });
      input.checked = !!s[key];
      input.addEventListener('change', () => { s[key] = input.checked; this.actions.settingsChanged(); });
      return el('label', { class: 'row' }, input, el('span', { text: label }));
    };
    const select = (label, key, options) => {
      const sel = el('select', { 'aria-label': label });
      for (const [v, txt] of options) sel.append(el('option', { value: v, text: txt, selected: s[key] === v ? '' : null }));
      sel.value = s[key];
      sel.addEventListener('change', () => { s[key] = sel.value; this.actions.settingsChanged(); });
      return el('label', { class: 'row gap' }, el('span', { text: label }), sel);
    };
    const node = el('div', { class: 'panel settings-panel' },
      el('h1', { text: 'Settings' }),
      el('h2', { text: 'Audio' }),
      slider('Music', 'music'), slider('Effects', 'effects'), slider('Ambience', 'ambience'),
      toggle('Mute all', 'muted'), toggle('Mute when tab hidden', 'muteWhenHidden'), toggle('Captions (text cues for sounds)', 'captions'),
      el('h2', { text: 'Graphics' }),
      select('Quality tier', 'quality', [['low', 'Low (battery saver)'], ['medium', 'Medium'], ['high', 'High']]),
      el('h2', { text: 'Controls' }),
      toggle('Left-handed (swap A/D and arrows)', 'leftHanded'),
      toggle('Hold-to-steer off (toggle steering)', 'toggleSteer'),
      toggle('Haptics off', 'hapticsOff'),
      el('h2', { text: 'Accessibility' }),
      toggle('Larger text', 'largeText'), toggle('High contrast', 'highContrast'),
      toggle('Reduced motion (no shake/swoops/dense particles)', 'reducedMotion'),
      select('Color-vision palette', 'cvdPalette', [['default', 'Default'], ['deuteranopia', 'Deuteranopia-safe'], ['tritanopia', 'Tritanopia-safe']]),
      toggle('Timing assist (wider landing forgiveness in practice)', 'timingAssist'),
      el('h2', { text: 'Data' }),
      toggle('Anonymous usage analytics (start/round-end/settings only)', 'analyticsConsent'),
      button('Replay tutorials from the start', () => this.actions.resetTutorials()),
      button('Back', () => backTo ? backTo() : this.actions.toTitle()));
    this.showScreen('Settings', node);
  }

  /* ---------------- in-run updates ---------------- */

  updateHud(state, goalText) {
    if (!state) { this.hud.hidden = true; this.thumbTray.hidden = true; return; }
    this.hud.hidden = false;
    this.thumbTray.hidden = false;
    this.hudAlt.textContent = `${state.score.altitude} m`;
    this.hudScore.textContent = `Score ${state.score.altitude + state.score.chainBonus + state.score.tokens}`;
    this.hudChain.textContent = state.chain > 1 ? `Chain ×${state.chain}` : '';
    this.objectiveText.textContent = goalText;
    this.progressText.textContent = `Altitude ${state.score.altitude} · motes ${state.score.tokens / 100} · chain ×${state.chain}`;
    this.boardMirror.textContent = GameRenderer.boardMirror(state);
  }

  setStatus(text) { this.statusText.textContent = text; }
  setActions(buttons) {
    this.actionsBox.innerHTML = '';
    this.actionsBox.append(el('h2', { text: 'Actions' }));
    for (const [label, fn, primary] of buttons) {
      this.actionsBox.append(button(label, fn, primary ? 'btn btn-primary btn-block' : 'btn btn-block'));
    }
  }

  applySettings() {
    const s = this.settings;
    document.documentElement.classList.toggle('large-text', !!s.largeText);
    document.documentElement.classList.toggle('high-contrast', !!s.highContrast);
    document.documentElement.classList.toggle('reduced-motion', !!s.reducedMotion);
  }
}
