/**
 * Server tests: static serving, time/daily endpoints, replay-validated score
 * submission (accept genuine, reject tampered/impossible/stale), leaderboards,
 * achievements idempotency, rate limiting, payload limits.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const testData = await mkdtemp(join(tmpdir(), 'skybound-spring-'));
process.env.SKYBOUND_SPRING_DATA_DIR = testData;
const { startServer } = await import('../server.js');
import * as R from '../src/rules.js';
import { dailyConfig } from '../src/content.js';

let server;
let base;

test.before(async () => {
  server = await startServer(0); // ephemeral port
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(r => server.close(r)); }
  await rm(testData, {recursive:true,force:true});
});

async function api(path, opts) {
  const res = await fetch(base + path, opts);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

/** Record a genuine run: play headlessly with a simple legal steering script. */
function recordRun(seed, difficulty, goal = { type: 'none', target: 0 }) {
  const cfg = { seed, difficulty, goal };
  const state = R.createInitialState(cfg);
  const cmds = [];
  let n = 0;
  while (!state.terminal && state.tick < R.TICK_RATE * 20) {
    if (state.tick % 30 === 0) {
      const dir = [1, 0, -1][(n / 1) % 3 | 0];
      const c = { id: 'srv-test-' + (n++), tick: state.tick + 1, type: 'steer', dir };
      R.applyCommand(state, c);
      cmds.push(c);
    }
    R.step(state);
  }
  return {
    seed, version: R.CONTENT_VERSION,
    settings: { difficulty, goal, assists: [] },
    inputLog: cmds,
    scoreComponents: { ...state.score, total: R.totalScore(state) },
    checksum: R.stateHash(state),
    playerId: 'tester', playerName: 'Tester', mode: 'daily',
  };
}

test('GET / serves index.html', async () => {
  const res = await fetch(base + '/');
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('Skybound Spring'));
});

test('GET /api/v1/time returns epoch ms', async () => {
  const { status, body } = await api('/api/v1/time');
  assert.equal(status, 200);
  assert.ok(Math.abs(body.now - Date.now()) < 10_000);
});

test('GET /api/v1/daily returns seed + version matching content module', async () => {
  const { status, body } = await api('/api/v1/daily');
  assert.equal(status, 200);
  const cfg = dailyConfig();
  assert.equal(body.seed, cfg.seed);
  assert.equal(body.version, cfg.version);
});

test('POST /api/v1/daily/submit accepts a genuine replayed run', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  const { status, body } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
  });
  assert.equal(status, 200, JSON.stringify(body));
  assert.equal(body.accepted, true);
  assert.equal(body.score, run.scoreComponents.total);
});

test('browser envelope shape (commands, no inputLog) is accepted', async () => {
  // Regression: the client posts the replay envelope, whose ordered command
  // list is named `commands`. The validator must accept that shape, otherwise
  // every real ranked submission is rejected as "missing input log".
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  const envelope = {
    seed: run.seed, version: run.version, settings: run.settings,
    commands: run.inputLog, scoreComponents: run.scoreComponents,
    checksum: run.checksum, playerId: 'browser-tester', playerName: 'Browser Tester',
    mode: 'daily',
  };
  const { status, body } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(envelope),
  });
  assert.equal(status, 200, JSON.stringify(body));
  assert.equal(body.accepted, true);
});

test('tampered input log is rejected', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  run.inputLog[0] = { ...run.inputLog[0], dir: run.inputLog[0].dir === 1 ? -1 : 1 };
  const { status, body } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
  });
  assert.equal(status, 422);
  assert.ok(body.error);
});

test('inflated score claim is rejected', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  run.scoreComponents.altitude += 5000;
  run.scoreComponents.total += 5000;
  const { status } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
  });
  assert.equal(status, 422);
});

test('stale content version is rejected', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  run.version = R.CONTENT_VERSION - 1;
  const { status, body } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
  });
  assert.equal(status, 422);
  assert.match(body.error, /version/);
});

test('duplicate command ids in log are rejected', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  if (run.inputLog.length >= 2) run.inputLog[1].id = run.inputLog[0].id;
  const { status } = await api('/api/v1/daily/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
  });
  assert.equal(status, 422);
});

test('leaderboards: global, daily, weekly, friends filter', async () => {
  let r = await api('/api/v1/leaderboard?scope=global');
  assert.equal(r.status, 200);
  assert.ok(r.body.entries.length >= 1);
  r = await api('/api/v1/leaderboard?scope=daily');
  assert.equal(r.status, 200);
  assert.ok(r.body.entries.some(e => e.playerId === 'tester'));
  r = await api('/api/v1/leaderboard?scope=weekly');
  assert.equal(r.status, 200);
  assert.ok(r.body.entries.length >= 1);
  r = await api('/api/v1/leaderboard?scope=global&friends=someone-else');
  assert.equal(r.status, 200);
  assert.equal(r.body.entries.length, 0);
  r = await api('/api/v1/leaderboard?scope=global&friends=tester');
  assert.ok(r.body.entries.length >= 1);
});

const ACH_PLAYER = 'ach-' + Math.random().toString(36).slice(2, 8);
test('achievements: idempotent unlock + fetch', async () => {
  const a1 = await api('/api/v1/achievements', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ playerId: ACH_PLAYER, key: 'first-ascent' }),
  });
  assert.equal(a1.status, 200);
  assert.equal(a1.body.alreadyUnlocked, false);
  const a2 = await api('/api/v1/achievements', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ playerId: ACH_PLAYER, key: 'first-ascent' }),
  });
  assert.equal(a2.body.alreadyUnlocked, true);
  const bad = await api('/api/v1/achievements', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ playerId: 'tester', key: 'no-such-key' }),
  });
  assert.equal(bad.status, 400);
  const list = await api('/api/v1/achievements?playerId=' + ACH_PLAYER);
  assert.ok(list.body.achievements['first-ascent']);
});

test('malformed requests get structured errors', async () => {
  const bad = await api('/api/v1/daily/submit', { method: 'POST', body: 'not json{{{' });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error);
  const missing = await api('/api/v1/nope');
  assert.equal(missing.status, 404);
  assert.ok(missing.body.error);
});

test('oversized payload rejected with 413', async () => {
  const big = JSON.stringify({ seed: 1, blob: 'x'.repeat(300 * 1024) });
  const res = await fetch(base + '/api/v1/daily/submit', { method: 'POST', body: big });
  assert.equal(res.status, 413);
});

test('rate limiting kicks in on submit spam', async () => {
  const run = recordRun(dailyConfig().seed, dailyConfig().difficulty);
  let last = 0;
  for (let i = 0; i < 60; i++) {
    const res = await fetch(base + '/api/v1/daily/submit', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(run),
    });
    last = res.status;
    if (last === 429) break;
  }
  assert.equal(last, 429);
});
