// Skybound Spring — platform adapter tests: src/platform.js over the shipped
// StarHermit SDK with a stubbed fetch and launch fragment (token read/strip,
// profile nickname, cloud-save round-trip on game:<slug>, settings KV,
// bindings, read-only board, sign-out) and a standalone run with no fetch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sdkModule = { exports: {} };
new Function('module', readFileSync(new URL('../starhermit-sdk.js', import.meta.url), 'utf8'))(sdkModule);
const SDK = sdkModule.exports;

const USER = 'abcdef12-3456-7890-abcd-ef1234567890';
const SLUG = 'skybound-spring-test';
const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const TOKEN = b64u({ alg: 'none' }) + '.' + b64u({ sub: USER, game_scope: SLUG, exp: Math.floor(Date.now() / 1000) + 3600 }) + '.sig';

const mem = new Map();
globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };

function res(status, body) {
  const bytes = body instanceof Uint8Array ? body : null;
  const text = bytes || body == null ? '' : JSON.stringify(body);
  return {
    status, ok: status >= 200 && status < 300, statusText: String(status),
    text: async () => text, json: async () => JSON.parse(text),
    arrayBuffer: async () => (bytes || Buffer.from(text)).slice().buffer,
  };
}
function win(hash, hostname = 'localhost') {
  return {
    location: { hash, search: '', pathname: '/', hostname, href: 'http://' + hostname + '/' + hash },
    history: { state: null, replaceState(_s, _t, url) { this.last = url; } },
  };
}
const { Platform } = await import('../src/platform.js');

test('hosted: token, profile, cloud save, settings, controls, board, sign-out', async () => {
  const calls = [];
  let save = null;
  const kv = { muted: true };
  const fetch = async (url, init = {}) => {
    const method = init.method || 'GET', path = url.split('?')[0];
    calls.push({ url, method, auth: init.headers.Authorization, body: init.body, keepalive: init.keepalive });
    if (path === `/api/v1/users/${USER}/profile`) return res(200, { username: 'hop_u', nickname: 'Hopper' });
    if (path === '/api/v1/me/cloud-saves/' + encodeURIComponent('game:' + SLUG)) {
      if (method === 'PUT') { save = Buffer.from(JSON.parse(init.body).dataBase64, 'base64'); return res(200, { etag: '"v' + calls.length + '"' }); }
      return save ? res(200, new Uint8Array(save)) : res(404);
    }
    if (path === `/api/v1/games/${SLUG}/settings`) {
      if (method === 'PATCH') Object.assign(kv, JSON.parse(init.body).settings);
      return res(200, { settings: kv });
    }
    if (path === `/api/v1/games/${SLUG}/controls`) return res(200, { actions: [{ action: 'undo', codes: ['KeyU'] }] });
    if (path === `/api/v1/games/${SLUG}/leaderboards`) return res(200, [{ id: 'lb', key: 'height' }]);
    if (path === '/api/v1/leaderboards/lb/entries') return res(200, { items: [{ userId: USER, score: 4200, rank: 1 }] });
    return res(404);
  };
  const w = win('#game_token=' + TOKEN);
  globalThis.StarHermit = SDK.create({ window: w, fetch, setTimeout: () => 0, clearTimeout() {} });
  const p = new Platform();
  assert.equal(p.hosted, true);
  assert.equal(w.history.last, '/', 'token stripped');
  assert.equal(p.slug, SLUG);
  assert.equal(await p.fetchProfile(), 'Hopper');
  assert.equal(p.playerName, 'Hopper');

  assert.equal(await p.loadCloudSave(), null);
  p.queueCloudSave({ stagesCompleted: { s1: true } });
  await p.flushCloud();
  const put = calls.find((c) => c.method === 'PUT');
  assert.ok(put.url.endsWith('/cloud-saves/game%3A' + SLUG), 'slot game:<slug>');
  assert.equal(put.keepalive, true);
  assert.deepEqual(await p.loadCloudSave(), { stagesCompleted: { s1: true } }, 'cloud round-trip');
  assert.equal(p.syncState, 'synced');

  assert.deepEqual(await p.loadSettings(), { muted: true });
  p.pushSettings({ muted: false, largeText: true });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(kv.largeText, true, 'settings PATCH');

  await p.loadControls();
  assert.equal(p.actionFor('KeyU'), 'undo');
  assert.equal(p.actionFor('KeyZ'), null);
  assert.equal(p.actionFor('KeyA'), 'left');
  assert.equal(p.keyLabel('pause'), 'Esc / P');

  const board = await p.leaderboard();
  assert.deepEqual(board.entries, [{ name: 'Hopper', score: 4200, rank: 1 }]);
  assert.ok(calls.every((c) => c.auth === 'Bearer ' + TOKEN), 'Bearer on every call');
  assert.ok(!calls.some((c) => c.url === '/api/v1/me'));

  assert.ok(p.inviteLink().endsWith(`/game-invite/${USER}/${SLUG}`));
  assert.equal(p.canSignIn(), false);
  let out = 0;
  p.onSignedOut = () => out++;
  globalThis.StarHermit.signOut('expired');
  assert.equal(out, 1);
  assert.equal(p.hosted, false);
  assert.equal(p.inviteLink(), null);
});

test('standalone: no platform fetch', async () => {
  const calls = [];
  globalThis.StarHermit = SDK.create({ window: win(''), fetch: async (u) => { calls.push(u); return res(500); } });
  const p = new Platform();
  assert.equal(p.hosted, false);
  assert.equal(await p.loadCloudSave(), null);
  p.queueCloudSave({});
  await p.flushCloud();
  assert.deepEqual(await p.loadSettings(), {});
  p.pushSettings({ muted: true });
  await p.loadControls();
  assert.equal(p.actionFor('ArrowLeft'), 'left');
  assert.equal(p.canSignIn(), false);
  assert.equal(calls.length, 0);
});

test('on-platform without a token: sign-in offered', () => {
  // canSignIn() is only true on a game's UUID host (<uuid>.starhermit.com).
  globalThis.StarHermit = SDK.create({ window: win('', '0b9d6f2e-3c4a-4e5b-9a7c-1d2e3f405162.starhermit.com'), fetch: async () => res(500) });
  assert.equal(new Platform().canSignIn(), true);
});

test('save conflict: another device saved first → reload, merge, save the merge', async () => {
  const { mergeProgress } = await import('../src/session.js');
  const path = '/api/v1/me/cloud-saves/' + encodeURIComponent('game:' + SLUG);
  const zipOf = async (obj) => {
    // Let a throwaway SDK build the zip bytes the platform would store.
    let bytes = null;
    const sdk = SDK.create({ window: win('#game_token=' + TOKEN), fetch: async (url, init = {}) => {
      if (init.method === 'PUT') { bytes = Buffer.from(JSON.parse(init.body).dataBase64, 'base64'); return res(200, { etag: '"x"' }); }
      return res(404);
    }, setTimeout: () => 0, clearTimeout() {} });
    sdk.init();
    await sdk.writeSave(JSON.stringify(obj));
    return bytes;
  };
  let stored = await zipOf({ v: 1, progress: { stagesCompleted: { 'stage-01': 900 }, bests: { journey: 900 }, achievements: {}, daysPlayed: ['2026-10-01'], tutorialsDone: [] } });
  let etag = '"v1"';
  const puts = [];
  const fetch = async (url, init = {}) => {
    const method = init.method || 'GET', p = url.split('?')[0];
    if (p === path + '/info') return res(200, { exists: !!stored, etag });
    if (p === path && method === 'GET') return res(200, new Uint8Array(stored));
    if (p === path && method === 'PUT') {
      const match = init.headers['If-Match'];
      puts.push(match);
      if (match && match !== etag) return res(412, { error: 'precondition_failed', etag });
      stored = Buffer.from(JSON.parse(init.body).dataBase64, 'base64');
      etag = '"v' + (puts.length + 1) + '"';
      return res(200, { etag });
    }
    return res(404);
  };
  globalThis.StarHermit = SDK.create({ window: win('#game_token=' + TOKEN), fetch, setTimeout: () => 0, clearTimeout() {} });
  const p = new Platform();
  let progress = mergeProgress(await p.loadCloudSave(), { stagesCompleted: {}, bests: {}, achievements: {}, daysPlayed: [], tutorialsDone: [] });
  // Another device saves a better stage-02 in between.
  stored = await zipOf({ v: 1, progress: { stagesCompleted: { 'stage-01': 900, 'stage-02': 700 }, bests: { journey: 900 }, achievements: { evergreen: 5 }, daysPlayed: ['2026-10-01'], tutorialsDone: ['springs'] } });
  etag = '"other"';
  const merged = new Promise((resolve) => {
    p.onConflict = (remote) => { progress = mergeProgress(remote, progress); resolve(); };
  });
  progress.stagesCompleted['stage-01'] = 1200;
  progress.bests.journey = 1200;
  p.queueCloudSave(progress);
  await p.flushCloud();
  await merged;
  assert.equal(globalThis.StarHermit.saveConflicted(), false, 'reload cleared the conflict');
  assert.deepEqual(progress.stagesCompleted, { 'stage-01': 1200, 'stage-02': 700 }, 'both devices kept');
  assert.equal(progress.bests.journey, 1200);
  assert.deepEqual(progress.tutorialsDone, ['springs']);
  assert.equal(progress.achievements.evergreen, 5);
  p.queueCloudSave(progress);
  await p.flushCloud();
  assert.equal(puts.at(-1), '"other"', 'the merge is written on top of the version it was based on');
  assert.equal(p.syncState, 'synced');
});

test('mergeProgress keeps the better side of every field', async () => {
  const { mergeProgress } = await import('../src/session.js');
  const m = mergeProgress(
    { stagesCompleted: { a: 5, b: 9 }, bests: { daily: 3 }, achievements: { x: 20 }, daysPlayed: ['d2'], tutorialsDone: ['t1'] },
    { stagesCompleted: { a: 7 }, bests: { daily: 1, practice: 4 }, achievements: { x: 10, y: 30 }, daysPlayed: ['d1', 'd2'], tutorialsDone: ['t2'] });
  assert.deepEqual(m, { stagesCompleted: { a: 7, b: 9 }, bests: { daily: 3, practice: 4 }, achievements: { x: 10, y: 30 }, daysPlayed: ['d1', 'd2'], tutorialsDone: ['t1', 't2'] });
  assert.deepEqual(mergeProgress(null, null), { stagesCompleted: {}, bests: {}, achievements: {}, daysPlayed: [], tutorialsDone: [] });
});
