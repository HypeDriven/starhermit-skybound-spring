/**
 * Skybound Spring — semantic HTML UI shell over the WebGL canvas.
 * All screens, focus management, live regions, settings, help cards.
 * No game rules here; UI calls host actions and renders host-provided state.
 */
import { THEMES, ACHIEVEMENTS, TUTORIALS, allStages, CHALLENGES, masteryTrack } from './content.js';
import { DIFFICULTY } from './rules.js';
import { GameRenderer } from './render.js';
import { PRESETS, CATEGORIES, choosePreset, presetTier, resolve } from './gfx.js';
import { gfxStrings } from './gfx-i18n.js';
import { shStrings } from './sh-i18n.js';
import { T, currentLang, onLanguage } from './i18n.js';

/** Localized display name of a Journey stage (content.js names are English data). */
export function stageName(s) {
  return s.mastery ? T('Mastery Gate {n}', { n: Math.floor(s.index / 8) + 1 }) : T('Ascent {n}', { n: s.index + 1 });
}

// Audio caption cues (audio.js passes these English cue texts, or the raw sound name when muted).
const CAPTIONS = {
  bounce: 'bounce', spring: 'spring boost!', crumble: 'petal breaks', token: 'glow mote collected',
  combo: 'chain bonus', milestone: 'milestone reached', fall: 'falling!', thorn: 'thorns!', goal: 'goal reached!', click: 'click',
};

const SYNC_LABELS = { offline: 'offline (local save)', local: 'cloud: not uploaded yet', saving: 'cloud: saving…', synced: 'cloud: synced', error: 'cloud: sync error' };

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
    this.sh = shStrings(currentLang());
    this.keys = { left: '← / A', right: '→ / D', pause: 'Esc / P', undo: 'Z' };
    this.build();
    this.applySettings();
    // A language change re-renders every visible text in place: static chrome,
    // the action rail, status lines, the open screen and the lesson bar.
    onLanguage(() => this.relocalize());
  }

  relocalize() {
    this.sh = shStrings(currentLang());
    this.labelStatic();
    if (this._actions) this.setActions(this._actions);
    if (this._status) this.setStatus(...this._status);
    if (this._sync) this.setSyncStatus(this._sync);
    if (this._hudArgs) this.updateHud(...this._hudArgs);
    if (this._tut && document.getElementById('tut-bar')) this.showTutorialOverlay(...this._tut);
    if (this.currentScreen && this._redraw) {
      // Tall panels scroll inside themselves (.panel); keep the player's place.
      const scroller = this.screens.querySelector('.screen .panel');
      const top = scroller ? scroller.scrollTop : 0;
      const focusLang = document.activeElement && document.activeElement.matches && document.activeElement.matches('[data-game-language]');
      const last = this.lastFocus;
      this._redraw();
      this.lastFocus = last;
      // The shared options sections remount on the next tick; then restore scroll and focus.
      setTimeout(() => {
        const sc = this.screens.querySelector('.screen .panel');
        if (sc) sc.scrollTop = top;
        if (focusLang) this.screens.querySelector('[data-game-language="choice"]')?.focus();
      }, 30);
    }
  }

  /** Text of the persistent chrome (rails, HUD, toggles, touch tray). */
  labelStatic() {
    this.railLeft.setAttribute('aria-label', T('Objective and progress'));
    this.railRight.setAttribute('aria-label', T('Actions and status'));
    this.thumbTray.setAttribute('aria-label', T('Touch steering'));
    this.hud.setAttribute('aria-label', T('Play status'));
    this.toggleLeft.textContent = T('Objective');
    this.toggleRight.textContent = T('Actions');
    for (const c of this.root.querySelectorAll('.rail-close')) c.setAttribute('aria-label', T('Close panel'));
    this.objectiveHead.textContent = T('Objective');
    this.progressHead.textContent = T('Progress');
    this.statusHead.textContent = T('Status');
    this.hudScore.setAttribute('aria-label', T('Score'));
    this.hudChain.setAttribute('aria-label', T('Chain'));
    this.hudAlt.setAttribute('aria-label', T('Altitude'));
    this.hudPause.textContent = T('⏸ Pause');
    this.steerLeft.setAttribute('aria-label', T('Steer left'));
    this.steerRight.setAttribute('aria-label', T('Steer right'));
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

    // Compact layouts: rails are closed-by-default drawers opened from these
    // chips (one at a time), closed by their ✕ button or a tap on the scrim.
    this.railToggles = el('div', { class: 'rail-toggles' },
      this.toggleLeft = button(T('Objective'), () => this.toggleRail('left'), 'btn btn-small rail-toggle'),
      this.toggleRight = button(T('Actions'), () => this.toggleRail('right'), 'btn btn-small rail-toggle'));
    this.toggleLeft.setAttribute('aria-expanded', 'false');
    this.toggleRight.setAttribute('aria-expanded', 'false');
    this.railScrim = el('div', { class: 'rail-scrim', hidden: '' });
    this.railScrim.addEventListener('click', () => this.toggleRail(null));
    for (const [rail, side] of [[this.railLeft, 'left'], [this.railRight, 'right']]) {
      const close = button('✕', () => this.toggleRail(null), 'btn btn-small rail-close');
      close.setAttribute('aria-label', T('Close panel'));
      rail.prepend(close);
      rail.dataset.side = side;
    }

    this.root.append(this.livePolite, this.liveAssertive, this.boardMirror, this.captions,
      this.topBar, this.railLeft, this.sceneHost, this.railRight, this.hud, this.thumbTray,
      this.railToggles, this.railScrim);
    // Overlay screens cover the playfield only, so the side rails stay clickable
    // while a menu is open (a full-viewport overlay made the rail buttons dead).
    this.sceneHost.append(this.screens);

    this.buildRails();
    this.buildHud();
    this.buildThumbTray();
    this.labelStatic();
  }

  toggleRail(side) {
    const openLeft = side === 'left' && !this.railLeft.classList.contains('open');
    const openRight = side === 'right' && !this.railRight.classList.contains('open');
    this.railLeft.classList.toggle('open', openLeft);
    this.railRight.classList.toggle('open', openRight);
    this.toggleLeft.setAttribute('aria-expanded', String(openLeft));
    this.toggleRight.setAttribute('aria-expanded', String(openRight));
    this.railScrim.hidden = !(openLeft || openRight);
    if (openLeft) this.railLeft.focus?.();
    if (openRight) this.railRight.focus?.();
  }

  buildRails() {
    const keep = (rail) => rail.querySelector('.rail-close');
    const closeL = keep(this.railLeft), closeR = keep(this.railRight);
    this.railLeft.innerHTML = '';
    if (closeL) this.railLeft.append(closeL);
    this.objectiveBox = el('div', { class: 'card' },
      this.objectiveHead = el('h2', { text: T('Objective') }), this.objectiveText = el('p', { text: '—' }));
    this.progressBox = el('div', { class: 'card' },
      this.progressHead = el('h2', { text: T('Progress') }), this.progressText = el('p', { text: '—' }));
    this.railLeft.append(this.objectiveBox, this.progressBox);

    this.railRight.innerHTML = '';
    if (closeR) this.railRight.append(closeR);
    this.actionsBox = el('div', { class: 'card actions-card' });
    this.statusBox = el('div', { class: 'card' },
      this.statusHead = el('h2', { text: T('Status') }), this.statusText = el('p', { text: T('Offline practice available.') }),
      this.syncText = el('p', { class: 'muted small', text: T('offline (local save)') }));
    this.railRight.append(this.actionsBox, this.statusBox);
  }

  buildHud() {
    this.hud.innerHTML = '';
    this.hudScore = el('div', { class: 'hud-item', 'aria-label': 'Score' });
    this.hudChain = el('div', { class: 'hud-item', 'aria-label': 'Chain' });
    this.hudAlt = el('div', { class: 'hud-item', 'aria-label': 'Altitude' });
    this.hudPause = button(T('⏸ Pause'), () => this.actions.pause(), 'btn btn-small');
    this.hud.append(this.hudAlt, this.hudScore, this.hudChain, this.hudPause);
    this.hud.hidden = true;
  }

  buildThumbTray() {
    this.thumbTray.innerHTML = '';
    const left = this.steerLeft = el('button', { class: 'thumb-btn', type: 'button', 'aria-label': T('Steer left'), text: '◀' });
    const right = this.steerRight = el('button', { class: 'thumb-btn', type: 'button', 'aria-label': T('Steer right'), text: '▶' });
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
  announceError(msg) { this.announce(T('Error: {msg}', { msg }), true); }
  caption(text) {
    this.captions.textContent = T(CAPTIONS[text] || text);
    clearTimeout(this._capT);
    this._capT = setTimeout(() => { this.captions.textContent = ''; }, 1600);
  }

  /* ---------------- screen manager ---------------- */

  showScreen(name, node) {
    this.lastFocus = document.activeElement;
    this.screens.innerHTML = '';
    if (node) {
      const wrap = el('section', { class: 'screen', role: 'dialog', 'aria-label': T(name), tabindex: '-1' });
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
    this._redraw = null;
    const target = restoreFocusTo || this.lastFocus;
    if (target && target.isConnected && target.focus) target.focus();
  }

  /* ---------------- screens ---------------- */

  showTitle(data) {
    this._redraw = () => this.showTitle(data);
    const { progress, daily, name, canSignIn, inviteLink } = data;
    const done = Object.keys(progress.stagesCompleted).length;
    const onlineText = name ? T('Online as {name}', { name }) : T('Offline — practice & local daily');
    const node = el('div', { class: 'panel title-panel' },
      el('h1', { class: 'game-title', text: 'Skybound Spring' }),
      el('p', { class: 'tagline', text: T('Bounce up the endless garden. Chain landings, dodge thorns, chase the sky.') }),
      button(T('▶ Play'), () => this.actions.quickPlay(), 'btn btn-primary btn-huge'),
      el('div', { class: 'row gap' },
        button(T('Journey'), () => this.actions.openJourney()),
        button(daily ? T('Daily ({date})', { date: daily.date }) : T('Daily (offline seed)'), () => this.actions.playDaily()),
        button(T('Learn'), () => this.actions.openLearn())),
      el('div', { class: 'row gap' },
        button(T('Practice'), () => this.actions.openPractice()),
        button(T('Challenges'), () => this.actions.openChallenges()),
        button(T('Profile'), () => this.actions.openProfile())),
      el('div', { class: 'row gap' },
        button(T('Settings'), () => this.showSettings()), button(T('Help'), () => this.showHelp())),
      (canSignIn || inviteLink) ? el('div', { class: 'row gap' },
        canSignIn ? button(this.sh.signIn, () => this.actions.signIn()) : null,
        inviteLink ? button(this.sh.invite, () => this.actions.copyInvite()) : null) : null,
      el('p', { class: 'muted', text: T('Journey: {done}/40 stages · {online}', { done, online: onlineText }) }),
    );
    this.showScreen('Title', node);
  }

  showJourney(progress) {
    this._redraw = () => this.showJourney(progress);
    const stages = allStages();
    const firstLocked = stages.findIndex((s, i) => i > 0 && !progress.stagesCompleted[stages[i - 1].id]);
    // Compact tile grid: all 40 stages fit inside the panel on any viewport,
    // so no stage is ever laid out below the fold of a non-scrolling document.
    // Full stage details live on the tile's aria-label / tooltip.
    const grid = el('div', { class: 'stage-grid', role: 'list' });
    stages.forEach((s, i) => {
      const unlocked = i === 0 || !!progress.stagesCompleted[stages[i - 1].id];
      const best = progress.stagesCompleted[s.id];
      const theme = THEMES.find(t => t.key === s.theme);
      const goal = s.goal.type === 'tokens' ? T('collect {n} motes', { n: s.goal.target }) : T('reach {n}m', { n: s.goal.target });
      const desc = [stageName(s) + ' — ' + goal, T('par {n}s', { n: s.parSeconds }), T(theme.name), T(DIFFICULTY[s.difficulty].label)].join(' · ')
        + (best !== undefined ? ' · ' + T('best {n}', { n: best }) : '') + (unlocked ? '' : ' ' + T('(locked)'));
      const cell = button(
        `${s.mastery ? '★' : ''}${i + 1}${best !== undefined ? '✓' : ''}`,
        unlocked ? () => this.actions.playStage(s) : null,
        'btn btn-stage-cell' + (s.mastery ? ' stage-mastery' : '') + (unlocked ? '' : ' btn-locked'));
      cell.setAttribute('aria-label', desc);
      cell.title = desc;
      cell.setAttribute('role', 'listitem');
      if (!unlocked) cell.disabled = true;
      if (i === firstLocked) cell.classList.add('next-up');
      grid.append(cell);
    });
    const track = masteryTrack(progress);
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Journey') }),
      el('p', { class: 'muted', text: T('Mastery gates: {done}/{total} cleared', { done: track.filter(t => t.completed).length, total: track.length }) }),
      grid,
      button(T('Back'), () => this.actions.toTitle()));
    this.showScreen('Journey', node);
  }

  showLearn(progress) {
    this._redraw = () => this.showLearn(progress);
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Learn') }),
      el('p', { class: 'muted', text: T('Short interactive lessons. You must perform each move to advance.') }),
      ...TUTORIALS.map(t => el('div', { class: 'row gap' },
        button(`${T(t.name)}${progress.tutorialsDone.includes(t.id) ? ' ✓' : ''}`, () => this.actions.playTutorial(t)),
        el('span', { class: 'muted small', text: T(t.steps[0].text).slice(0, 60) + '…' }))),
      button(T('Back'), () => this.actions.toTitle()));
    this.showScreen('Learn', node);
  }

  showPractice() {
    let tier = this._practice ? this._practice.tier : 'sprout';
    let seedStr = this._practice ? this._practice.seed : String(Math.floor(Math.random() * 1e9));
    this._practice = { tier, seed: seedStr };
    // A language change redraws with the tier and seed the player already chose.
    this._redraw = () => this.showPractice();
    const seedInput = el('input', { type: 'text', value: seedStr, 'aria-label': T('Practice seed'), maxlength: '12' });
    seedInput.addEventListener('input', () => { seedStr = this._practice.seed = seedInput.value; });
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Practice') }),
      el('p', { class: 'muted', text: T('Unranked. Free restart, undo-to-last-landing (Z), any difficulty. Expected session: 2–5 minutes.') }),
      el('div', { class: 'row gap' }, Object.values(DIFFICULTY).map(d => {
        const b = button(T(d.label), () => { tier = this._practice.tier = d.key; node.querySelectorAll('.tier-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); }, 'btn tier-btn');
        if (d.key === tier) b.classList.add('active');
        return b;
      })),
      el('label', { class: 'row gap' }, T('Seed (shareable):') + ' ', seedInput),
      button(T('Start practice run'), () => {
        const seed = /^\d+$/.test(seedStr) ? Number(seedStr) >>> 0 : seedStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
        this._practice = null;
        this.actions.playPractice(tier, seed);
      }, 'btn btn-primary'),
      button(T('Back'), () => { this._practice = null; this.actions.toTitle(); }));
    this.showScreen('Practice', node);
  }

  showChallenges() {
    this._redraw = () => this.showChallenges();
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Challenges') }),
      ...CHALLENGES.map(c => el('div', { class: 'card' },
        el('h2', { text: T(c.name) }),
        el('p', { text: T(c.description) }),
        el('p', { class: 'muted small', text: T('Difficulty: {tier} · Ranked: no · Expected: under 2 minutes', { tier: T(DIFFICULTY[c.difficulty].label) }) }),
        button(T('Attempt'), () => this.actions.playChallenge(c), 'btn btn-primary'))),
      button(T('Back'), () => this.actions.toTitle()));
    this.showScreen('Challenges', node);
  }

  async showProfile(data) {
    this._redraw = () => this.showProfile(data);
    const { progress, platform } = data;
    // Hosted identity comes from the account profile (read-only); the editable
    // guest name is local/offline only.
    const nameInput = el('input', { type: 'text', value: platform.playerName, 'aria-label': T('Display name'), maxlength: '32' });
    const nameRow = platform.hosted
      ? el('p', { class: 'row gap' }, el('strong', { text: T('Account: {name}', { name: platform.nickname }) }),
          el('span', { class: 'muted small', text: T('Cloud save: {state}', { state: T(SYNC_LABELS[platform.syncState] || platform.syncState) }) }))
      : el('label', { class: 'row gap' }, T('Display name:') + ' ', nameInput,
          button(T('Save'), () => { platform.setPlayerName(nameInput.value); this.announce(T('Name saved.')); }));
    const boardsNode = el('div', { class: 'boards' }, el('p', { class: 'muted', text: T('Loading boards…') }));
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Profile') }),
      nameRow,
      el('h2', { text: T('Achievements') }),
      el('ul', {}, ...ACHIEVEMENTS.map(a => el('li', {},
        el('strong', { text: T(a.name) }), ` — ${T(a.description)} `,
        el('span', { class: progress.achievements[a.key] ? 'unlocked' : 'muted', text: progress.achievements[a.key] ? T('✓ unlocked') : T('locked') })))),
      el('h2', { text: T('Leaderboards') }),
      boardsNode,
      button(T('Back'), () => this.actions.toTitle()));
    this.showScreen('Profile', node);

    const localBests = el('p', { class: 'muted' },
      T('Local bests — Practice: {practice} · Daily: {daily} · Journey stages: {stages}/40', { practice: progress.bests.practice || 0, daily: progress.bests.daily || 0, stages: Object.keys(progress.stagesCompleted).length }));
    boardsNode.innerHTML = '';

    if (platform.hosted) {
      // Platform leaderboard is read-only; personal bests stay local/cloud-saved.
      const wrap = el('div', { class: 'card' }, el('h3', { text: T('Global') }), el('ol', { class: 'board-list' }));
      boardsNode.append(wrap, localBests);
      const r = await platform.leaderboard('global');
      if (!r.ok) { wrap.append(el('p', { class: 'muted', text: r.recoverable ? T('Temporarily unavailable — try again soon.') : T('No platform leaderboard for this game yet — local bests below.') })); return; }
      if (!r.entries.length) { wrap.append(el('p', { class: 'muted', text: T('No entries yet — be the first!') })); return; }
      const listEl = wrap.querySelector('.board-list');
      for (const e of r.entries.slice(0, 10)) {
        listEl.append(el('li', {}, `${e.name || T('Player')} — ${e.score}${e.rank ? ` (#${e.rank})` : ''}`));
      }
      return;
    }

    boardsNode.append(el('p', { class: 'muted', text: T('Offline — online leaderboards need a StarHermit sign-in.') }), localBests);
  }

  showPause(data) {
    this._redraw = () => this.showPause(data);
    const mode = typeof data.mode === 'function' ? data.mode() : data.mode;
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Paused') }),
      button(T('▶ Resume'), () => this.actions.resume(), 'btn btn-primary btn-huge'),
      el('div', { class: 'row gap' },
        button(T('Restart'), () => this.actions.restartRun()),
        data.allowUndo ? button(T('Undo to last landing (Z)'), () => this.actions.undo()) : null,
        button(T('Settings'), () => this.showSettings(() => this.showPause(data))),
        button(T('Help'), () => this.showHelp(() => this.showPause(data)))),
      button(T('Leave run'), () => this.actions.leaveRun(), 'btn btn-danger'),
      el('p', { class: 'muted small', text: T('Mode: {mode} · Ranked: {ranked} · Tick {tick}', { mode, ranked: data.ranked ? T('yes') : T('no'), tick: data.tick }) }));
    this.showScreen('Paused', node);
  }

  showResults(data, quiet = false) {
    this._redraw = () => { this.showResults(data, true); if (this._lb) this.setLeaderboardResult(this._lb); };
    if (!quiet) this._lb = null;
    const { score, terminal, isBest, best, prevBest, newAchievements, nextAction, par } = data;
    const reasons = {
      fell: T('You fell below the garden.'), hazard: T('Thorns got you.'), 'goal-reached': T('Goal reached!'),
      'move-limit': T('Steering budget spent.'), 'time-out': T('Out of time.'),
    };
    const next = nextAction ? (typeof nextAction.label === 'function' ? nextAction.label() : nextAction.label) : null;
    const node = el('div', { class: 'panel' },
      el('h1', { text: terminal.reason === 'goal-reached' ? T('🌼 Goal reached!') : T('Run over') }),
      el('p', { class: 'result-reason', text: reasons[terminal.reason] || terminal.reason }),
      el('div', { class: 'score-breakdown', role: 'table', 'aria-label': T('Score breakdown') },
        el('div', { role: 'row' }, el('span', { text: T('Altitude') }), el('strong', { text: String(score.altitude) })),
        el('div', { role: 'row' }, el('span', { text: T('Chain bonus') }), el('strong', { text: String(score.chainBonus) })),
        el('div', { role: 'row' }, el('span', { text: T('Glow motes') }), el('strong', { text: String(score.tokens) })),
        el('div', { role: 'row', class: 'total' }, el('span', { text: T('Total') }), el('strong', { text: String(score.total) }))),
      par ? el('p', { class: 'muted', text: T('Par: {n}s', { n: par }) }) : null,
      el('p', { class: 'muted', text: isBest ? (prevBest ? T('New best! (was {n})', { n: prevBest }) : T('New best!')) : T('Best: {n}', { n: best }) }),
      newAchievements.length ? el('p', { class: 'achv', text: T('Achievement unlocked: {list}', { list: newAchievements.map(k => T(ACHIEVEMENTS.find(a => a.key === k)?.name || k)).join(', ') }) }) : null,
      el('p', { class: 'muted small', text: T('Score saved to your local bests.') }),
      data.postLeaderboard ? el('p', { class: 'muted', id: 'results-lb', role: 'status', text: this.sh.lbPosting }) : null,
      el('div', { class: 'row gap' },
        button(T('Retry'), () => this.actions.restartRun(), 'btn btn-primary'),
        button(T('Watch replay'), () => this.actions.replayRun()),
        nextAction ? button(next, nextAction.fn) : null),
      button(T('Continue'), () => this.actions.toTitle()));
    this.showScreen('Results', node);
    if (!quiet) this.announce(T('Run over. {reason} Total score {n}.', { reason: reasons[terminal.reason] || terminal.reason, n: score.total }), true);
  }

  /** Results line for the StarHermit board: { posted, rank } from Platform.submitScore. */
  setLeaderboardResult(r) {
    this._lb = r;
    const line = document.getElementById('results-lb');
    if (!line) return;
    line.textContent = !r.posted ? this.sh.lbNotPosted
      : r.rank ? this.sh.lbRank.replace('{rank}', r.rank) : this.sh.lbPosted;
  }

  showCountdown(n) {
    this._redraw = () => this.showCountdown(n);
    this.showScreen('Countdown', el('div', { class: 'panel countdown-panel' },
      el('p', { class: 'countdown-num', text: n > 0 ? String(n) : T('Go!') })));
  }

  showAwaySummary(seconds, altitude) {
    this._redraw = () => this.showAwaySummary(seconds, altitude);
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('Welcome back') }),
      el('p', { text: T('You were away {n}s. The run was paused — nothing happened while you were gone.', { n: Math.round(seconds) }) }),
      el('p', { class: 'muted', text: T('Altitude reached: {n}m.', { n: altitude }) }),
      button(T('Resume'), () => this.actions.resume(), 'btn btn-primary'));
    this.showScreen('Away', node);
  }

  showTutorialOverlay(text, stepIdx, stepCount) {
    this._tut = [text, stepIdx, stepCount];
    let bar = document.getElementById('tut-bar');
    if (!bar) {
      bar = el('div', { class: 'tutorial-bar', id: 'tut-bar', role: 'status' });
      bar.append(el('span', { class: 'tutorial-step' }), el('p'), button('', () => this.actions.skipTutorial(), 'btn btn-small'));
      this.root.append(bar);
    }
    // Updated in place: steps advance mid-run, and a Skip button rebuilt between press and
    // release would lose the click.
    const [step, line, skip] = bar.children;
    step.textContent = T('Lesson {n}/{total}', { n: stepIdx + 1, total: stepCount });
    line.textContent = T(text);
    skip.textContent = T('Skip lesson');
  }
  hideTutorialOverlay() {
    this._tut = null;
    const bar = document.getElementById('tut-bar');
    if (bar) bar.remove();
  }

  showHelp(backTo) {
    this._redraw = () => this.showHelp(backTo);
    const cards = [
      [T('Auto-bounce'), T('Your sprout-hopper bounces on its own. Land on pads to keep climbing — each landing bounces you again.')],
      [T('Steering'), T('Hold {left} or {right} to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.', { left: this.keys.left, right: this.keys.right })],
      [T('Screen wrap'), T('Fly off the left edge and you reappear on the right (and vice versa). Classic garden physics!')],
      [T('Leaf pads (green)'), T('Safe, sturdy, unlimited bounces.')],
      [T('Moving leaves (blue)'), T('Slide sideways near their perch. Time your landing.')],
      [T('Brittle petals (brown)'), T('Break after one landing. Never plan to come back.')],
      [T('Spring blossoms (pink)'), T('Launch you nearly twice as high. Chain them for huge climbs.')],
      [T('Wisp pads (pale)'), T('Fragile: one landing and they fade.')],
      [T('Thorn clusters (red spikes)'), T('Never land on thorns — the run ends instantly.')],
      [T('Glow motes (gold)'), T('Worth 100 points each. Grab them mid-flight.')],
      [T('Chains'), T('Land on successively higher pads to grow your chain bonus. Dropping to a lower pad resets it.')],
      [T('Falling'), T('The camera only moves up. Fall below the bottom of the view and the run ends.')],
      [T('Undo (practice)'), T('Press {key} in practice to jump back to your last landing.', { key: this.keys.undo })],
      [T('Pause'), T('Press {key} to pause or resume.', { key: this.keys.pause })],
    ];
    const node = el('div', { class: 'panel' },
      el('h1', { text: T('How to play') }),
      el('div', { class: 'help-grid' }, ...cards.map(([t, d]) =>
        el('div', { class: 'card' }, el('h3', { text: t }), el('p', { text: d })))),
      button(T('Back'), () => backTo ? backTo() : this.actions.toTitle()));
    this.showScreen('Help', node);
  }

  showSettings(backTo) {
    this._redraw = () => this.showSettings(backTo);
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
      el('h1', { text: T('Settings') }),
      el('h2', { text: T('Audio') }),
      slider(T('Music'), 'music'), slider(T('Effects'), 'effects'), slider(T('Ambience'), 'ambience'),
      toggle(T('Mute all'), 'muted'), toggle(T('Mute when tab hidden'), 'muteWhenHidden'), toggle(T('Captions (text cues for sounds)'), 'captions'),
      this.buildGraphicsSection(),
      el('h2', { text: T('Controls') }),
      toggle(T('Left-handed layout'), 'leftHanded'),
      toggle(T('Hold-to-steer off (toggle steering)'), 'toggleSteer'),
      toggle(T('Haptics off'), 'hapticsOff'),
      el('h2', { text: T('Accessibility') }),
      toggle(T('Larger text'), 'largeText'), toggle(T('High contrast'), 'highContrast'),
      toggle(T('Reduced motion (no shake/swoops/dense particles)'), 'reducedMotion'),
      select(T('Color-vision palette'), 'cvdPalette', [['default', T('Default')], ['deuteranopia', T('Deuteranopia-safe')], ['tritanopia', T('Tritanopia-safe')]]),
      toggle(T('Timing assist (wider landing forgiveness in practice)'), 'timingAssist'),
      el('h2', { text: T('Data') }),
      toggle(T('Anonymous usage analytics (start/round-end/settings only)'), 'analyticsConsent'),
      button(T('Replay tutorials from the start'), () => this.actions.resetTutorials()),
      button(T('Back'), () => backTo ? backTo() : this.actions.toTitle()));
    this.showScreen('Settings', node);
  }

  /**
   * Graphics section: preset, render scale, per-effect overrides, adaptive resolution, FPS readout.
   * Only the inner box redraws on a change; the shared Frame rate / Language / Sound /
   * Report sections (game-options.js) mount after it inside the same section and stay put.
   */
  buildGraphicsSection() {
    const T = gfxStrings(currentLang());
    const section = el('section', { id: 'gfx-section', class: 'gfx-section', 'aria-labelledby': 'gfx-heading', 'data-options-graphics': '' });
    const inner = el('div', { class: 'gfx-inner' });
    section.append(inner);
    const save = () => { this.actions.settingsChanged(); render(); };
    const render = () => {
      const focusId = inner.contains(document.activeElement) ? document.activeElement.id : null;
      const g = this.settings.graphics || (this.settings.graphics = {});
      const info = this.actions.graphicsInfo ? this.actions.graphicsInfo(T.sum) : null;
      const detected = info ? info.detected : 'balanced';
      const r = info ? info.resolved : resolve(g, detected);
      inner.innerHTML = '';
      inner.append(el('h2', { id: 'gfx-heading', text: T.graphics }));

      const preset = el('select', { id: 'gfx-preset', 'data-gfx': 'preset', 'aria-label': T.quality });
      preset.append(el('option', { value: 'auto', text: T.auto.replace('{tier}', T[detected]) }));
      for (const p of PRESETS) preset.append(el('option', { value: p, text: T[p] }));
      preset.value = PRESETS.includes(g.preset) ? g.preset : 'auto';
      preset.addEventListener('change', () => { this.settings.graphics = choosePreset(g, preset.value); save(); });
      inner.append(el('label', { class: 'gfx-row' }, el('span', { text: T.quality }), preset));

      const pct = Math.round((Number(g.render_scale) || 1) * 100);
      const scale = el('input', { id: 'gfx-scale', 'data-gfx': 'render_scale', type: 'range', min: '50', max: '200', step: '5', value: String(pct), 'aria-label': T.renderScale });
      const out = el('output', { class: 'gfx-scale-value', for: 'gfx-scale', text: pct + '%' });
      scale.addEventListener('input', () => { out.textContent = scale.value + '%'; });
      scale.addEventListener('change', () => { g.render_scale = Number(scale.value) / 100; save(); });
      inner.append(el('label', { class: 'gfx-row gfx-slider' }, el('span', { text: T.renderScale }), scale, out));

      for (const [cat, tiers] of Object.entries(CATEGORIES)) {
        const sel = el('select', { id: 'gfx-cat-' + cat, 'data-gfx-cat': cat, 'aria-label': T.cat[cat] });
        sel.append(el('option', { value: '', text: T.fromPreset.replace('{tier}', T.tier[presetTier(r.preset, cat)]) }));
        for (const t of tiers) sel.append(el('option', { value: t, text: T.tier[t] }));
        sel.value = tiers.includes(g[cat]) ? g[cat] : '';
        sel.addEventListener('change', () => {
          if (sel.value) g[cat] = sel.value; else delete g[cat];
          save();
        });
        inner.append(el('label', { class: 'gfx-row' }, el('span', { text: T.cat[cat] }), sel));
      }

      const check = (id, key, label, def) => {
        const input = el('input', { id, type: 'checkbox', 'data-gfx': key, 'aria-label': label });
        input.checked = g[key] === undefined ? def : !!g[key];
        input.addEventListener('change', () => { g[key] = input.checked; save(); });
        return el('label', { class: 'row' }, input, el('span', { text: label }));
      };
      inner.append(check('gfx-adaptive', 'adaptive', T.adaptive, true), check('gfx-fps', 'show_fps', T.showFps, false));

      const summary = el('p', { id: 'gfx-summary', class: 'muted small gfx-summary', 'aria-live': 'polite' });
      const note = el('p', { id: 'gfx-post-note', class: 'small gfx-note', text: T.postFailed });
      const fill = () => {
        const i = this.actions.graphicsInfo ? this.actions.graphicsInfo(T.sum) : null;
        summary.textContent = i ? [i.gpu, i.level != null ? T.level.replace('{n}', i.level) : null, i.summary].filter(Boolean).join(' · ') : '';
        note.hidden = !(i && i.postFailed);
      };
      fill();
      inner.append(summary, note);
      clearInterval(this._gfxTimer);
      this._gfxTimer = setInterval(() => { if (!section.isConnected) clearInterval(this._gfxTimer); else fill(); }, 1000);
      if (focusId) document.getElementById(focusId)?.focus();
    };
    render();
    return section;
  }

  /* ---------------- in-run updates ---------------- */

  updateHud(state, goalText) {
    this._hudArgs = state ? [state, goalText] : null;
    if (!state) { this.hud.hidden = true; this.thumbTray.hidden = true; return; }
    const goal = typeof goalText === 'function' ? goalText() : goalText;
    this.hud.hidden = false;
    this.thumbTray.hidden = false;
    this.hudAlt.textContent = `${state.score.altitude} m`;
    this.hudScore.textContent = T('Score {n}', { n: state.score.altitude + state.score.chainBonus + state.score.tokens });
    this.hudChain.textContent = state.chain > 1 ? T('Chain ×{n}', { n: state.chain }) : '';
    this.objectiveText.textContent = goal;
    this.progressText.textContent = T('Altitude {alt} · motes {motes} · chain ×{chain}', { alt: state.score.altitude, motes: state.score.tokens / 100, chain: state.chain });
    this.boardMirror.textContent = GameRenderer.boardMirror(state, T);
  }

  /** Status line: an English key (+ vars), translated now and again on a language change. */
  setStatus(key, vars) { this._status = [key, vars]; this.statusText.textContent = T(key, vars); }
  setKeyLabels(keys) { this.keys = keys; }
  toast(msg) {
    if (!this.toastEl) {
      this.toastEl = el('p', { class: 'sh-toast', role: 'status', 'aria-live': 'polite' });
      this.root.append(this.toastEl);
    }
    this.toastEl.textContent = msg;
    this.toastEl.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this.toastEl.hidden = true; }, 3200);
  }
  setSyncStatus(state) {
    this._sync = state;
    this.syncText.textContent = T(SYNC_LABELS[state] || state);
  }
  /** Rail buttons: [English label, fn, primary?]; labels are translated here. */
  setActions(buttons) {
    this._actions = buttons;
    this.actionsBox.innerHTML = '';
    this.actionsBox.append(el('h2', { text: T('Actions') }));
    for (const [label, fn, primary] of buttons) {
      this.actionsBox.append(button(T(label), fn, primary ? 'btn btn-primary btn-block' : 'btn btn-block'));
    }
  }

  applySettings() {
    const s = this.settings;
    document.documentElement.classList.toggle('left-handed', !!s.leftHanded);
    document.documentElement.classList.toggle('large-text', !!s.largeText);
    document.documentElement.classList.toggle('high-contrast', !!s.highContrast);
    document.documentElement.classList.toggle('reduced-motion', !!s.reducedMotion);
  }
}
