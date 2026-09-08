/**
 * Skybound Spring — platform adapter: same-origin /api detection with
 * timeout, server-time offset sync, score submission, leaderboards,
 * achievements. Every call degrades gracefully when the server is absent
 * (offline practice stays fully playable). No tokens are ever persisted.
 */

const API_TIMEOUT_MS = 3500;

async function tryFetch(path, opts = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), API_TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(path, { ...opts, signal: ctl.signal });
    const body = await res.json().catch(() => null);
    return { status: res.status, body, rtt: Date.now() - started };
  } catch (e) {
    return { status: 0, body: null, error: e.name === 'AbortError' ? 'timeout' : 'offline' };
  } finally {
    clearTimeout(timer);
  }
}

export class Platform {
  constructor() {
    this.available = false;
    this.serverOffset = 0; // serverNow - clientNow
    this.daily = null;
    this.playerId = null;
    this.playerName = 'Guest';
    // Guest profile lives only in memory + localStorage, never credentials.
    try {
      this.playerId = localStorage.getItem('skybound-spring:guest-id');
      if (!this.playerId) {
        this.playerId = 'guest-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('skybound-spring:guest-id', this.playerId);
      }
      this.playerName = localStorage.getItem('skybound-spring:guest-name') || 'Guest';
    } catch { this.playerId = 'guest-local'; }
  }

  setPlayerName(name) {
    if (typeof name === 'string' && name.trim() && name.length <= 32) {
      this.playerName = name.trim();
      try { localStorage.setItem('skybound-spring:guest-name', this.playerName); } catch { /* ignore */ }
    }
  }

  /** Feature-detect the hosted API and sync the clock (round-trip adjusted). */
  async detect() {
    const r = await tryFetch('/api/v1/time');
    if (r.status === 200 && r.body && Number.isFinite(r.body.now)) {
      this.available = true;
      this.serverOffset = r.body.now - (Date.now() - r.rtt / 2);
    } else {
      this.available = false;
    }
    return this.available;
  }

  serverNow() { return Date.now() + this.serverOffset; }

  async fetchDaily() {
    if (!this.available) return null;
    const r = await tryFetch('/api/v1/daily');
    if (r.status === 200 && r.body && !r.body.error) {
      this.daily = r.body;
      return r.body;
    }
    return null; // caller treats as recoverable (offline daily = local seed)
  }

  /** Submit a validated daily run. Returns { ok, score?, boards?, error? }. */
  async submitScore(envelope, mode) {
    if (!this.available) return { ok: false, error: 'offline' };
    const path = mode === 'daily' ? '/api/v1/daily/submit' : '/api/v1/score/submit';
    const r = await tryFetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...envelope,
        // Server validator expects the ordered command log as `inputLog`;
        // the replay envelope calls the same list `commands`.
        inputLog: envelope.commands,
        version: envelope.contentVersion,
        playerId: this.playerId,
        playerName: this.playerName,
        mode,
      }),
    });
    if (r.status === 200 && r.body && r.body.accepted) return { ok: true, score: r.body.score, boards: r.body.boards };
    if (r.status === 429) return { ok: false, error: 'rate-limited', recoverable: true };
    return { ok: false, error: (r.body && r.body.error) || 'submit failed', recoverable: r.status >= 500 || r.status === 0 };
  }

  async leaderboard(scope = 'global', friends = []) {
    if (!this.available) return { ok: false, error: 'offline', entries: [] };
    const q = friends.length ? '&friends=' + friends.map(encodeURIComponent).join(',') : '';
    const r = await tryFetch(`/api/v1/leaderboard?scope=${encodeURIComponent(scope)}${q}`);
    if (r.status === 200 && r.body && !r.body.error) return { ok: true, entries: r.body.entries, scope: r.body.scope };
    if (r.status === 429) return { ok: false, error: 'rate-limited', recoverable: true, entries: [] };
    return { ok: false, error: (r.body && r.body.error) || 'unavailable', entries: [] };
  }

  async unlockAchievement(key) {
    if (!this.available) return { ok: false, error: 'offline' };
    const r = await tryFetch('/api/v1/achievements', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ playerId: this.playerId, key }),
    });
    if (r.status === 200 && r.body && r.body.unlocked) return { ok: true, already: r.body.alreadyUnlocked };
    return { ok: false, error: (r.body && r.body.error) || 'unavailable' };
  }
}
