/**
 * Skybound Spring — StarHermit platform adapter over window.StarHermit
 * (starhermit-sdk.js, loaded before the bundle). The SDK reads the launch
 * token (#game_token / #access_token), renews it and makes every platform
 * call; this adapter keeps the game-facing API: identity, cloud save
 * (slot game:<slug>, a mirror of the progress doc), settings KV, keyboard
 * bindings, sign-in / invite link and the read-only platform board. Without
 * a token nothing here touches the network, and the game never calls its
 * own server routes (no time sync, submissions or server boards). Tokens
 * are never persisted.
 */

// Keyboard actions; mirrors the control.* lines in starhermit.txt.
export const DEFAULT_CONTROLS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  pause: ['Escape', 'KeyP'],
  undo: ['KeyZ'],
};

const SH = () => globalThis.StarHermit || null;

function cloneControls(c) {
  const out = {};
  for (const k of Object.keys(c)) out[k] = c[k].slice();
  return out;
}

export class Platform {
  constructor() {
    this.hosted = false;     // signed in through a StarHermit launch token
    this.slug = null;        // game scope from game_scope claim (never hard-coded)
    this.userId = null;      // sub claim
    this.daily = null;       // daily config is client-side (date-seeded)
    this.nickname = null;    // account display name (hosted)
    this.syncState = 'offline'; // offline | local | saving | synced | error
    this.onSync = null;      // UI hook: (state) => void
    this.onSignedOut = null; // UI hook when renewal is refused
    this.controls = cloneControls(DEFAULT_CONTROLS);
    // Guest profile lives only in memory + localStorage, never credentials.
    this.playerId = null;
    this.playerName = 'Guest';
    try {
      this.playerId = localStorage.getItem('skybound-spring:guest-id');
      if (!this.playerId) {
        this.playerId = 'guest-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('skybound-spring:guest-id', this.playerId);
      }
      this.playerName = localStorage.getItem('skybound-spring:guest-name') || 'Guest';
    } catch { this.playerId = 'guest-local'; }

    const sh = SH();
    if (sh) {
      if (!sh.token) sh.init();
      sh.on('saved', (ok) => this._setSync(ok ? 'synced' : 'error'));
      sh.on('auth', (a) => {
        const was = this.hosted;
        this._syncFromSdk();
        if (was && !a.signedIn) {
          this.nickname = null;
          this.playerName = 'Guest';
          this._setSync('offline');
          if (this.onSignedOut) this.onSignedOut();
        }
      });
      this._syncFromSdk();
    }
    if (this.hosted) {
      this.playerId = this.userId;
      this.nickname = 'Player ' + this.userId.slice(0, 6);
      this.playerName = this.nickname;
      this.syncState = 'local';
    }
  }

  _syncFromSdk() {
    const sh = SH();
    this.hosted = !!(sh && sh.signedIn && sh.userId);
    this.userId = this.hosted ? String(sh.userId) : null;
    this.slug = sh ? sh.slug : null;
  }

  get token() { const sh = SH(); return sh ? sh.token : null; }

  canSignIn() { const sh = SH(); return !!(sh && sh.canSignIn()); }
  signIn() { const sh = SH(); return !!(sh && sh.signIn()); }
  inviteLink() { return this.hosted ? SH().inviteLink() : null; }

  setPlayerName(name) {
    // Local guest name only — hosted identity comes from the account profile.
    if (this.hosted) return;
    if (typeof name === 'string' && name.trim() && name.length <= 32) {
      this.playerName = name.trim();
      try { localStorage.setItem('skybound-spring:guest-name', this.playerName); } catch { /* ignore */ }
    }
  }

  /* ---------------- profile ---------------- */

  /** Account nickname (fallback "Player " + id prefix; never /api/v1/me). */
  async fetchProfile() {
    if (!this.hosted) return this.playerName;
    const p = await SH().profile().catch(() => null);
    if (p) {
      this.nickname = p.displayName.slice(0, 32);
      this.playerName = this.nickname;
    }
    return this.nickname;
  }

  /** Resolve any userId to a display nickname (cached by the SDK). */
  async profileName(userId) {
    const id = String(userId || '');
    if (!id) return 'Player';
    const p = this.hosted ? await SH().profile(id).catch(() => null) : null;
    return p ? p.displayName.slice(0, 32) : 'Player ' + id.slice(0, 6);
  }

  /* ---------------- cloud save (mirror of the progress doc) ---------------- */

  _setSync(state) {
    this.syncState = state;
    if (this.onSync) this.onSync(state);
  }

  /** Queue a debounced cloud save; localStorage stays the offline cache. */
  queueCloudSave(progress) {
    if (!this.hosted) {
      if (this.syncState !== 'offline') this._setSync('offline');
      return;
    }
    this._setSync('saving');
    SH().saveJSON({ v: 1, savedAt: Date.now(), progress });
  }

  /** Flush any pending cloud save (pagehide / visibilitychange). */
  flushCloud() {
    return this.hosted ? SH().flushSave(true) : Promise.resolve(false);
  }

  /** Load the remote progress doc (remote wins on conflict; none = null). */
  async loadCloudSave() {
    if (!this.hosted) return null;
    this._setSync('saving');
    const doc = await SH().loadJSON().catch(() => null);
    this._setSync(doc ? 'synced' : 'local');
    return doc && doc.progress ? doc.progress : null;
  }

  /* ---------------- settings KV + controls ---------------- */

  /** The player's platform settings ({} standalone / none). */
  async loadSettings() {
    if (!this.hosted) return {};
    return (await SH().getSettings().catch(() => null)) || {};
  }

  /** Mirror preferences to the platform settings KV (no-op standalone). */
  pushSettings(settings) {
    if (this.hosted) SH().patchSettings({ ...settings });
  }

  async loadControls() {
    if (this.hosted) this.controls = await SH().loadBindings(DEFAULT_CONTROLS).catch(() => this.controls);
    return this.controls;
  }

  actionFor(code) {
    for (const a of Object.keys(this.controls)) if (this.controls[a].includes(code)) return a;
    return null;
  }

  keyLabel(action) {
    const NAMES = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc' };
    return (this.controls[action] || []).map((c) => NAMES[c] || c.replace(/^Key|^Digit/, '')).join(' / ');
  }

  /* ---------------- read-only boards ---------------- */

  /**
   * Read-only boards. Hosted: the platform leaderboard (entries resolved to
   * account nicknames). Standalone: caller shows local records.
   */
  async leaderboard(scope = 'global', friends = []) {
    if (this.hosted) {
      const r = await SH().leaderboard(null, { pageSize: 10, scope: friends.length ? 'friends' : undefined }).catch(() => null);
      if (!r || !r.board) return { ok: false, error: 'no platform leaderboard', entries: [] };
      const entries = [];
      for (const e of (r.items || []).slice(0, 10)) {
        entries.push({ name: await this.profileName(e.userId), score: e.score, rank: e.rank });
      }
      return { ok: true, entries, scope };
    }
    return { ok: false, error: 'offline', entries: [] };
  }

  /**
   * Achievements are local — part of the cloud-saved progress doc. A pure
   * browser game has no server-authoritative unlock path, so nothing is
   * posted.
   */
  async unlockAchievement(key) {
    return { ok: true, local: true, key };
  }
}
