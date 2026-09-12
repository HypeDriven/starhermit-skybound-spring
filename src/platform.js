/**
 * Skybound Spring — StarHermit platform adapter.
 * Hosted mode activates only when a launch token was read from the URL
 * fragment (#game_token=…, stripped after the one read; query fallbacks are
 * local-dev only). Every call is same-origin, carries Bearer auth when
 * hosted, and degrades gracefully when the server is absent (offline
 * practice stays fully playable). Launch/access tokens are never persisted;
 * localStorage remains the offline cache and the cloud save is a mirror of
 * the progress doc.
 *
 * Contract (platform wiki): GET /api/v1/time (clock sync), POST
 * /api/v1/games/{slug}/launch-token (refresh), GET
 * /api/v1/users/{userId}/profile (nickname), GET/PUT
 * /api/v1/me/cloud-saves/{slug} (one zip+base64 slot), GET
 * /api/v1/games/{slug} + /api/v1/leaderboards/{id}/entries (read-only
 * boards). No fabricated routes are called in hosted mode.
 */

const API_TIMEOUT_MS = 3500;
const REFRESH_MS = 45 * 60 * 1000;   // re-mint a 60-min token every 45 min
const REFRESH_RETRY_MS = 60 * 1000;
const CLOUD_DEBOUNCE_MS = 2000;

async function tryFetch(path, opts = {}, binary = false) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), API_TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(path, { ...opts, signal: ctl.signal });
    const body = binary ? await res.arrayBuffer().catch(() => null) : await res.json().catch(() => null);
    return { status: res.status, body, rtt: Date.now() - started };
  } catch (e) {
    return { status: 0, body: null, error: e.name === 'AbortError' ? 'timeout' : 'offline' };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------- launch token ---------------- */

/** Read the token once from #game_token=… and strip it from the URL.
 *  Query-param fallbacks (?game_token= / ?token= / ?launch=) are local-dev only. */
function readLaunchToken() {
  try {
    const h = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
    if (h) {
      const frag = new URLSearchParams(h);
      const t = frag.get('game_token');
      if (t) {
        frag.delete('game_token');
        const rest = frag.toString();
        history.replaceState(null, '', location.pathname + location.search + (rest ? '#' + rest : ''));
        return t;
      }
    }
    const q = new URLSearchParams(location.search);
    return q.get('game_token') || q.get('token') || q.get('launch');
  } catch { return null; }
}

/** Base64url-decode the JWT payload (no signature verification). */
function decodeJwtPayload(token) {
  const parts = String(token).split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64 + '='.repeat((4 - b64.length % 4) % 4)));
  } catch { return null; }
}

/* ---------------- minimal ZIP (stored entries only, no compression) ---------------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function zipStore(name, dataBytes) {
  const enc = new TextEncoder();
  const nameB = enc.encode(name);
  const crc = crc32(dataBytes);
  const out = [];
  const u16 = (v) => out.push(v & 0xff, (v >> 8) & 0xff);
  const u32 = (v) => out.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff);
  u32(0x04034b50); u16(20); u16(0); u16(0); u16(0); u16(0);
  u32(crc); u32(dataBytes.length); u32(dataBytes.length);
  u16(nameB.length); u16(0);
  const local = out.length;
  const head = new Uint8Array(out);
  const cd = [];
  const c16 = (v) => cd.push(v & 0xff, (v >> 8) & 0xff);
  const c32 = (v) => cd.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff);
  c32(0x02014b50); c16(20); c16(20); c16(0); c16(0); c16(0); c16(0);
  c32(crc); c32(dataBytes.length); c32(dataBytes.length);
  c16(nameB.length); c16(0); c16(0); c16(0); c16(0); c32(0); c32(0); // attrs + local-header offset
  const cdHead = new Uint8Array(cd);
  const cdOff = head.length + nameB.length + dataBytes.length;
  const parts = [head, nameB, dataBytes, cdHead, nameB];
  const eocd = [];
  const e32 = (v) => eocd.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff);
  const e16 = (v) => eocd.push(v & 0xff, (v >> 8) & 0xff);
  e32(0x06054b50); e16(0); e16(0); e16(1); e16(1);
  e32(cdHead.length + nameB.length); e32(cdOff); e16(0);
  parts.push(new Uint8Array(eocd));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const buf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { buf.set(p, o); o += p.length; }
  return buf;
}
function unzipFirstEntry(zipBytes) {
  // Stored single-entry reader: scan local headers for compression 0.
  const dv = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  let off = 0;
  while (off + 30 <= zipBytes.length && dv.getUint32(off, true) === 0x04034b50) {
    const method = dv.getUint16(off + 8, true);
    const size = dv.getUint32(off + 18, true);
    const nameLen = dv.getUint16(off + 26, true);
    const extraLen = dv.getUint16(off + 28, true);
    const dataOff = off + 30 + nameLen + extraLen;
    if (method !== 0) throw new Error('unsupported zip entry');
    return zipBytes.slice(dataOff, dataOff + size);
  }
  throw new Error('bad zip');
}
function bytesToBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function base64ToBytes(b64) {
  const s = atob(b64);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}

export { zipStore, unzipFirstEntry, bytesToBase64, base64ToBytes };

/* ---------------- platform ---------------- */

export class Platform {
  constructor() {
    this.available = false;  // platform API / own dev server reachable
    this.hosted = false;     // a launch token was read (StarHermit hosted)
    this.slug = null;        // game scope from game_scope claim (never hard-coded)
    this.userId = null;      // sub claim
    this.token = null;       // current launch token (memory only)
    this.serverOffset = 0;   // serverNow - clientNow
    this.daily = null;       // daily config is client-side (date-seeded)
    this.nickname = null;    // account display name (hosted)
    this.syncState = 'offline'; // offline | local | saving | synced | error
    this.onSync = null;      // UI hook: (state) => void
    this._profileCache = new Map();
    this._cloudTimer = null;
    this._cloudPending = false;
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

    const token = readLaunchToken();
    const claims = token && decodeJwtPayload(token);
    if (token && claims && claims.sub) {
      this.token = token;
      this.hosted = true;
      this.userId = String(claims.sub);
      this.slug = typeof claims.game_scope === 'string' && claims.game_scope ? claims.game_scope : null;
      this.playerId = this.userId;
      this.nickname = 'Player ' + this.userId.slice(0, 8);
      this.playerName = this.nickname;
      this.syncState = 'local';
      if (this.slug) {
        this._refreshTimer = setInterval(() => this._refreshToken(), REFRESH_MS);
        if (this._refreshTimer.unref) this._refreshTimer.unref();
      }
    }
  }

  /** Bearer auth on every hosted call; nothing extra for local dev. */
  auth() { return this.token ? { authorization: 'Bearer ' + this.token } : {}; }

  setPlayerName(name) {
    // Local guest name only — hosted identity comes from the account profile.
    if (this.hosted) return;
    if (typeof name === 'string' && name.trim() && name.length <= 32) {
      this.playerName = name.trim();
      try { localStorage.setItem('skybound-spring:guest-name', this.playerName); } catch { /* ignore */ }
    }
  }

  /* ---------------- clock + profile ---------------- */

  /** Feature-detect the API and sync the clock (round-trip adjusted). */
  async detect() {
    const r = await tryFetch('/api/v1/time', { headers: this.auth() });
    if (r.status === 200 && r.body && Number.isFinite(r.body.now)) {
      this.available = true;
      this.serverOffset = r.body.now - (Date.now() - r.rtt / 2);
    } else {
      this.available = false;
    }
    return this.available;
  }

  serverNow() { return Date.now() + this.serverOffset; }

  /**
   * Account nickname for the launch-token user. NEVER /api/v1/me (403 for
   * launch tokens), never usernames. Fallback: "Player " + id.slice(0, 8).
   */
  async fetchProfile() {
    if (!this.hosted || !this.userId) return this.playerName;
    const r = await tryFetch(`/api/v1/users/${encodeURIComponent(this.userId)}/profile`, { headers: this.auth() });
    if (r.status === 200 && r.body && typeof r.body.nickname === 'string' && r.body.nickname.trim()) {
      this.nickname = r.body.nickname.trim().slice(0, 32);
      this.playerName = this.nickname;
    }
    return this.nickname;
  }

  /** Resolve any userId to a display nickname (cached). */
  async profileName(userId) {
    const id = String(userId || '');
    if (!id) return 'Player';
    if (this._profileCache.has(id)) return this._profileCache.get(id);
    let name = 'Player ' + id.slice(0, 8);
    if (this.hosted) {
      const r = await tryFetch(`/api/v1/users/${encodeURIComponent(id)}/profile`, { headers: this.auth() });
      if (r.status === 200 && r.body && typeof r.body.nickname === 'string' && r.body.nickname.trim()) {
        name = r.body.nickname.trim().slice(0, 32);
      }
    }
    this._profileCache.set(id, name);
    return name;
  }

  /** Re-mint the scoped launch token; swap it in and retry failures ~60 s. */
  async _refreshToken() {
    if (!this.token || !this.slug) return;
    const r = await tryFetch(`/api/v1/games/${encodeURIComponent(this.slug)}/launch-token`, {
      method: 'POST',
      headers: { ...this.auth(), 'content-type': 'application/json' },
    });
    const t = r.body && r.body.token;
    if (r.status === 200 && typeof t === 'string' && t.split('.').length >= 2) {
      this.token = t;
      const claims = decodeJwtPayload(t);
      if (claims && claims.sub) {
        this.userId = String(claims.sub);
        this._profileCache.clear();
        this.fetchProfile();
      }
    } else {
      setTimeout(() => this._refreshToken(), REFRESH_RETRY_MS);
    }
  }

  /* ---------------- cloud save (mirror of the progress doc) ---------------- */

  _setSync(state) {
    this.syncState = state;
    if (this.onSync) this.onSync(state);
  }

  /** Queue a debounced cloud PUT; localStorage stays the offline cache. */
  queueCloudSave(progress) {
    if (!this.hosted || !this.slug || !this.token) {
      if (this.syncState !== 'offline') this._setSync('offline');
      return;
    }
    this._cloudDoc = progress;
    this._cloudPending = true;
    this._setSync('saving');
    clearTimeout(this._cloudTimer);
    this._cloudTimer = setTimeout(() => { this._cloudTimer = null; this._flushCloud(); }, CLOUD_DEBOUNCE_MS);
  }

  /** Flush any pending cloud save (pagehide / visibilitychange). */
  flushCloud() {
    if (this._cloudTimer) { clearTimeout(this._cloudTimer); this._cloudTimer = null; }
    if (this._cloudPending) return this._flushCloud();
    return Promise.resolve();
  }

  async _flushCloud() {
    if (!this._cloudPending) return;
    const doc = this._cloudDoc;
    this._cloudPending = false;
    this._cloudDoc = null;
    try {
      const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, savedAt: Date.now(), progress: doc }));
      const r = await tryFetch(`/api/v1/me/cloud-saves/${encodeURIComponent(this.slug)}`, {
        method: 'PUT',
        headers: { ...this.auth(), 'content-type': 'application/json' },
        body: JSON.stringify({ dataBase64: bytesToBase64(zipStore('save.json', bytes)) }),
      });
      this._setSync(r.status >= 200 && r.status < 300 ? 'synced' : 'error');
    } catch { this._setSync('error'); }
  }

  /** Load the remote progress doc (remote wins on conflict; 404 = none). */
  async loadCloudSave() {
    if (!this.hosted || !this.slug || !this.token) return null;
    this._setSync('saving');
    const r = await tryFetch(`/api/v1/me/cloud-saves/${encodeURIComponent(this.slug)}`, { headers: this.auth() }, true);
    if (r.status === 404) { this._setSync('local'); return null; }
    if (r.status !== 200 || !r.body) { this._setSync('error'); return null; }
    try {
      const doc = JSON.parse(new TextDecoder().decode(unzipFirstEntry(new Uint8Array(r.body))));
      this._setSync('synced');
      return doc && doc.progress ? doc.progress : null;
    } catch { this._setSync('error'); return null; }
  }

  /* ---------------- validated submit + read-only boards ---------------- */

  /**
   * Submit a validated run to the game's own backend (server.js) as an
   * authenticated its-backend call, with graceful fallback when that service
   * is not present on this host. Platform leaderboards are script-owned:
   * clients never submit to them.
   */
  async submitScore(envelope, mode) {
    if (!this.available) return { ok: false, error: 'offline' };
    const path = mode === 'daily' ? '/api/v1/daily/submit' : '/api/v1/score/submit';
    const r = await tryFetch(path, {
      method: 'POST',
      headers: { ...this.auth(), 'content-type': 'application/json' },
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
    if (r.status === 404) return { ok: false, error: 'leaderboard service unavailable on this host', recoverable: true };
    return { ok: false, error: (r.body && r.body.error) || 'submit failed', recoverable: r.status >= 500 || r.status === 0 };
  }

  /**
   * Read-only boards. Hosted: the platform leaderboard (leaderboardId from
   * GET /api/v1/games/{slug}, entries resolved to account nicknames). Local
   * dev: the game's own server board. Offline: caller shows local records.
   */
  async leaderboard(scope = 'global', friends = []) {
    if (this.hosted && this.slug) {
      const meta = await tryFetch(`/api/v1/games/${encodeURIComponent(this.slug)}`, { headers: this.auth() });
      const leaderboardId = meta.status === 200 && meta.body ? meta.body.leaderboardId : null;
      if (!leaderboardId) return { ok: false, error: 'no platform leaderboard', entries: [] };
      const q = new URLSearchParams({ page: '1', pageSize: '10' });
      if (friends.length) q.set('friendsOnly', 'true');
      const r = await tryFetch(`/api/v1/leaderboards/${encodeURIComponent(leaderboardId)}/entries?${q}`, { headers: this.auth() });
      if (r.status !== 200 || !r.body) return { ok: false, error: 'unavailable', recoverable: r.status === 429, entries: [] };
      const raw = Array.isArray(r.body.entries) ? r.body.entries : [];
      const entries = [];
      for (const e of raw.slice(0, 10)) {
        entries.push({ name: await this.profileName(e.userId || e.playerId), score: e.score, rank: e.rank });
      }
      return { ok: true, entries, scope };
    }
    if (!this.available) return { ok: false, error: 'offline', entries: [] };
    const q = friends.length ? '&friends=' + friends.map(encodeURIComponent).join(',') : '';
    const r = await tryFetch(`/api/v1/leaderboard?scope=${encodeURIComponent(scope)}${q}`, { headers: this.auth() });
    if (r.status === 200 && r.body && !r.body.error) {
      return { ok: true, entries: r.body.entries, scope: r.body.scope };
    }
    if (r.status === 429) return { ok: false, error: 'rate-limited', recoverable: true, entries: [] };
    return { ok: false, error: (r.body && r.body.error) || 'unavailable', entries: [] };
  }

  /**
   * Achievements are local — part of the cloud-saved progress doc. A pure
   * browser game has no server-authoritative unlock path, so nothing is
   * posted (no fabricated /achievements route in hosted mode).
   */
  async unlockAchievement(key) {
    return { ok: true, local: true, key };
  }
}
