/**
 * Skybound Spring — authoritative server (dependency-free, Node built-ins only).
 * Serves the static distribution, validates submitted runs by re-simulating
 * them with the shared rules module, and keeps JSON-file-persisted
 * leaderboards and achievements under data/.
 *
 * Run: node server.js   (PORT env, default 8080)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rules = await import(path.join(__dirname, 'src', 'rules.js'));
const content = await import(path.join(__dirname, 'src', 'content.js'));

const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = path.join(__dirname, 'data');
const MAX_BODY = 256 * 1024;          // 256 KB request cap
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;                  // requests per IP per minute
const SUBMIT_RATE_MAX = 40;            // score submissions per IP per minute

/* ---------------- persistence ---------------- */

const store = { boards: { global: [], daily: {}, weekly: {} }, achievements: {}, sessions: {} };

function loadStore() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const f = path.join(DATA_DIR, 'store.json');
    if (fs.existsSync(f)) {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (data && data.boards) Object.assign(store, data);
    }
  } catch (e) {
    console.error('store load failed, starting empty:', e.message);
  }
}
let saveTimer = null;
function saveStore() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = path.join(DATA_DIR, 'store.json.tmp');
      fs.writeFileSync(tmp, JSON.stringify(store));
      fs.renameSync(tmp, path.join(DATA_DIR, 'store.json'));
    } catch (e) {
      console.error('store save failed:', e.message);
    }
  }, 250);
}

/* ---------------- helpers ---------------- */

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(body);
}
function err(res, code, msg) { json(res, code, { error: msg }); }

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        req.removeAllListeners('data');
        req.pause();
        reject(new Error('payload too large'));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const rateBuckets = new Map();
function rateLimit(ip, max) {
  const now = Date.now();
  let b = rateBuckets.get(ip);
  if (!b || now - b.start > RATE_WINDOW_MS) { b = { start: now, count: 0 }; rateBuckets.set(ip, b); }
  b.count++;
  return b.count <= max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of rateBuckets) if (now - b.start > RATE_WINDOW_MS * 2) rateBuckets.delete(k);
}, 60_000).unref();

function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/* ---------------- replay validation ---------------- */

/**
 * Re-simulate a submitted run. Returns { ok, score, hash, terminal, reason? }.
 * body: { seed, version, settings, inputLog, scoreComponents, checksum, playerId, mode }
 */
export function validateSubmission(body) {
  if (!body || typeof body !== 'object') return { ok: false, reason: 'bad request body' };
  const { seed, version, settings, inputLog, scoreComponents, checksum } = body;
  if (!Number.isInteger(seed) || seed < 0) return { ok: false, reason: 'invalid seed' };
  if (version !== rules.CONTENT_VERSION) return { ok: false, reason: 'stale content version' };
  if (!settings || typeof settings !== 'object') return { ok: false, reason: 'missing settings' };
  if (!Array.isArray(inputLog)) return { ok: false, reason: 'missing input log' };
  if (inputLog.length > 200000) return { ok: false, reason: 'input log too large' };
  const difficulty = typeof settings.difficulty === 'string' ? settings.difficulty : null;
  if (!difficulty || !rules.DIFFICULTY[difficulty]) return { ok: false, reason: 'unknown difficulty' };
  if (settings.assists && settings.assists.length > 0 && body.mode === 'daily') {
    return { ok: false, reason: 'assisted runs are not ranked' };
  }

  // Duplicate command rejection by command id (idempotent).
  const seen = new Set();
  for (const c of inputLog) {
    if (!c || typeof c.id !== 'string') return { ok: false, reason: 'malformed command in log' };
    if (seen.has(c.id)) return { ok: false, reason: 'duplicate command id: ' + c.id };
    seen.add(c.id);
  }

  const goal = settings.goal && typeof settings.goal === 'object'
    ? settings.goal : { type: 'none', target: 0 };
  const cfg = {
    seed, difficulty, goal,
    moveLimitTicks: Number.isInteger(settings.moveLimitTicks) ? settings.moveLimitTicks : 0,
    mechanics: Array.isArray(settings.mechanics) ? settings.mechanics : undefined,
    maxTicks: rules.TICK_RATE * 600,
  };
  let result;
  try {
    result = rules.simulateRun(cfg, inputLog);
  } catch (e) {
    return { ok: false, reason: 'simulation failed: ' + e.message };
  }

  const claimedTotal = scoreComponents && Number.isInteger(scoreComponents.total)
    ? scoreComponents.total : null;
  if (claimedTotal === null) return { ok: false, reason: 'missing score components' };
  if (result.score.altitude !== scoreComponents.altitude ||
      result.score.chainBonus !== scoreComponents.chainBonus ||
      result.score.tokens !== scoreComponents.tokens ||
      result.score.total !== claimedTotal) {
    return { ok: false, reason: 'score mismatch: replay produced ' + result.score.total };
  }
  if (typeof checksum !== 'string' || checksum !== result.hash) {
    return { ok: false, reason: 'checksum mismatch' };
  }
  // Plausibility: score bounded by elapsed ticks (max ~1.4 altitude units/tick + chain + tokens).
  const ticks = result.terminal.tick;
  if (claimedTotal > ticks * 30 + 1000) return { ok: false, reason: 'implausible score for duration' };
  return { ok: true, score: result.score, hash: result.hash, terminal: result.terminal, ticks };
}

/* ---------------- leaderboards ---------------- */

function recordScore(entry) {
  const boards = [];
  const push = (board, scopeKey) => {
    const e = { ...entry };
    if (scopeKey) e.scope = scopeKey;
    board.push(e);
    board.sort((a, b) => b.score - a.score || a.ticks - b.ticks || String(a.playerId).localeCompare(String(b.playerId)));
    if (board.length > 200) board.length = 200;
  };
  push(store.boards.global);
  boards.push('global');
  if (entry.mode === 'daily' && entry.date) {
    (store.boards.daily[entry.date] ||= []);
    push(store.boards.daily[entry.date], entry.date);
    boards.push('daily');
    (store.boards.weekly[isoWeekKey(new Date(entry.date + 'T00:00:00Z'))] ||= []);
    push(store.boards.weekly[isoWeekKey(new Date(entry.date + 'T00:00:00Z'))], isoWeekKey());
    boards.push('weekly');
  }
  saveStore();
  return boards;
}

/* ---------------- static files ---------------- */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.opus': 'audio/ogg',
};

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const filePath = path.normalize(path.join(__dirname, rel));
  if (!filePath.startsWith(__dirname) || filePath.includes(`${path.sep}data${path.sep}`)) {
    return err(res, 403, 'forbidden');
  }
  fs.stat(filePath, (e, st) => {
    if (e || !st.isFile()) return err(res, 404, 'not found');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'content-length': st.size,
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------------- router ---------------- */

export function createServer() {
  return http.createServer(async (req, res) => {
    const ip = req.socket.remoteAddress || 'unknown';
    const u = new URL(req.url, 'http://localhost');
    const p = u.pathname;

    try {
      if (p.startsWith('/api/')) {
        if (!rateLimit(ip, p.endsWith('/submit') ? SUBMIT_RATE_MAX : RATE_MAX)) {
          return err(res, 429, 'rate limited');
        }

        if (req.method === 'GET' && p === '/api/v1/time') {
          return json(res, 200, { now: Date.now() });
        }

        if (req.method === 'GET' && p === '/api/v1/daily') {
          const cfg = content.dailyConfig();
          return json(res, 200, {
            date: cfg.date, seed: cfg.seed, version: cfg.version,
            difficulty: cfg.difficulty, theme: cfg.theme,
          });
        }

        if (req.method === 'POST' && p === '/api/v1/daily/submit') {
          const body = JSON.parse(await readBody(req));
          const result = validateSubmission(body);
          if (!result.ok) return err(res, 422, result.reason);
          const playerId = typeof body.playerId === 'string' && body.playerId.length <= 48
            ? body.playerId : 'guest';
          const playerName = typeof body.playerName === 'string' && body.playerName.length <= 32
            ? body.playerName : 'Guest';
          const boards = recordScore({
            playerId, playerName, score: result.score.total,
            components: result.score, ticks: result.ticks,
            mode: 'daily', date: content.utcDateString(),
            ruleset: rules.CONTENT_VERSION, seed: body.seed,
            assists: body.settings.assists || [],
          });
          return json(res, 200, { accepted: true, score: result.score.total, boards });
        }

        if (req.method === 'POST' && p === '/api/v1/score/submit') {
          // Unranked practice/score-chase submissions still get validated.
          const body = JSON.parse(await readBody(req));
          const result = validateSubmission(body);
          if (!result.ok) return err(res, 422, result.reason);
          const playerId = typeof body.playerId === 'string' && body.playerId.length <= 48 ? body.playerId : 'guest';
          const playerName = typeof body.playerName === 'string' && body.playerName.length <= 32 ? body.playerName : 'Guest';
          const boards = recordScore({
            playerId, playerName, score: result.score.total,
            components: result.score, ticks: result.ticks,
            mode: body.mode === 'journey' ? 'journey' : 'practice',
            ruleset: rules.CONTENT_VERSION, seed: body.seed,
            assists: body.settings.assists || [],
          });
          return json(res, 200, { accepted: true, score: result.score.total, boards });
        }

        if (req.method === 'GET' && p === '/api/v1/leaderboard') {
          const scope = u.searchParams.get('scope') || 'global';
          const friends = (u.searchParams.get('friends') || '').split(',').filter(Boolean);
          let list;
          if (scope === 'daily') list = store.boards.daily[content.utcDateString()] || [];
          else if (scope === 'weekly') list = store.boards.weekly[isoWeekKey()] || [];
          else list = store.boards.global;
          if (friends.length) {
            const set = new Set(friends);
            list = list.filter(e => set.has(e.playerId));
          }
          return json(res, 200, { scope, entries: list.slice(0, 50) });
        }

        if (req.method === 'POST' && p === '/api/v1/achievements') {
          const body = JSON.parse(await readBody(req));
          const playerId = typeof body.playerId === 'string' && body.playerId.length <= 48 ? body.playerId : null;
          const key = typeof body.key === 'string' ? body.key : null;
          if (!playerId) return err(res, 400, 'missing playerId');
          if (!key || !content.ACHIEVEMENTS.some(a => a.key === key)) {
            return err(res, 400, 'unknown achievement key');
          }
          (store.achievements[playerId] ||= {});
          const already = !!store.achievements[playerId][key];
          if (!already) {
            store.achievements[playerId][key] = { unlockedAt: Date.now() };
            saveStore();
          }
          return json(res, 200, { key, unlocked: true, alreadyUnlocked: already });
        }

        if (req.method === 'GET' && p === '/api/v1/achievements') {
          const playerId = u.searchParams.get('playerId') || 'guest';
          return json(res, 200, { achievements: store.achievements[playerId] || {} });
        }

        return err(res, 404, 'unknown api route');
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') return err(res, 405, 'method not allowed');
      serveStatic(req, res, p);
    } catch (e) {
      if (e && e.message === 'payload too large') return err(res, 413, 'payload too large');
      if (e instanceof SyntaxError) return err(res, 400, 'invalid json');
      console.error('request error:', e);
      err(res, 500, 'internal error');
    }
  });
}

export function startServer(port = PORT) {
  loadStore();
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, () => {
      const addr = server.address();
      console.log(`Skybound Spring server on http://localhost:${addr.port}`);
      resolve(server);
    });
  });
}

// Start when run directly (not when imported by tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer();
}
