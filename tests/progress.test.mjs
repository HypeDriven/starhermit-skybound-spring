// The save model (src/progress.js): normalizing old and broken documents, the
// two-device merge (as the browser build's cloud conflicts merged), results and
// achievements, the browser build's cloud slot read as a foreign save, and the
// old settings KV keys carried over or removed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../src/progress.js';

test('normalize keeps the old progress fields and drops junk', () => {
  const p = P.normalize({ stagesCompleted: { 'stage-01': 320, bad: 'x' }, bests: { daily: '410' }, achievements: { 'first-ascent': 1700000000000 }, daysPlayed: ['2026-10-02', '2026-10-01', '2026-10-01', 4], tutorialsDone: ['steer-basics'], extra: 1 });
  assert.deepEqual(p, { stagesCompleted: { 'stage-01': 320 }, bests: { daily: 410 }, achievements: { 'first-ascent': 1700000000000 }, daysPlayed: ['2026-10-01', '2026-10-02'], tutorialsDone: ['steer-basics'] });
  assert.deepEqual(P.normalize(null), P.blank());
  assert.deepEqual(P.normalize([1, 2]), P.blank());
});

test('two devices merge: higher scores, earliest unlocks, union of days and lessons', () => {
  const a = { stagesCompleted: { 'stage-01': 300, 'stage-02': 500 }, bests: { journey: 500, daily: 100 }, achievements: { 'first-ascent': 200 }, daysPlayed: ['2026-10-01'], tutorialsDone: ['springs'] };
  const b = { stagesCompleted: { 'stage-01': 350 }, bests: { daily: 900, practice: 40 }, achievements: { 'first-ascent': 100, evergreen: 300 }, daysPlayed: ['2026-10-02'], tutorialsDone: ['springs', 'drifters'] };
  const m = P.merge(a, b);
  assert.deepEqual(m.stagesCompleted, { 'stage-01': 350, 'stage-02': 500 });
  assert.deepEqual(m.bests, { journey: 500, daily: 900, practice: 40 });
  assert.deepEqual(m.achievements, { 'first-ascent': 100, evergreen: 300 });
  assert.deepEqual(m.daysPlayed, ['2026-10-01', '2026-10-02']);
  assert.deepEqual(m.tutorialsDone.sort(), ['drifters', 'springs']);
  assert.ok(P.same(P.merge(m, a), m), 'merging again changes nothing');
  assert.ok(P.same({ bests: { a: 1, b: 2 } }, { bests: { b: 2, a: 1 } }), 'key order ignored');
});

test('recordResult and evaluateAchievements follow session.js', () => {
  const p = P.blank();
  let r = P.recordResult(p, 'journey', 'stage-01', 320, { reason: 'goal-reached', tick: 9 }, '2026-10-28');
  assert.deepEqual(r, { completed: true, isBest: true, prevBest: 0, best: 320 });
  assert.equal(p.stagesCompleted['stage-01'], 320);
  r = P.recordResult(p, 'journey', 'stage-02', 100, { reason: 'fell', tick: 9 }, '2026-10-28');
  assert.equal(p.stagesCompleted['stage-02'], undefined);
  assert.deepEqual(r, { completed: false, isBest: false, prevBest: 320, best: 320 });
  assert.deepEqual(p.daysPlayed, ['2026-10-28']);
  const fresh = P.evaluateAchievements(p, { completed: true, altitude: 50, springs: 25, maxChain: 30, difficulty: 'storm' }, 1234);
  assert.deepEqual(fresh.sort(), ['first-ascent', 'spring-master', 'storm-summit', 'streak-tender']);
  assert.equal(p.achievements['spring-master'], 1234);
  assert.deepEqual(P.evaluateAchievements(p, { completed: true, altitude: 900, springs: 30, maxChain: 40, difficulty: 'storm' }, 5), []);
  for (let d = 1; d <= 7; d++) P.recordResult(p, 'daily', 'daily', 1, null, `2026-11-0${d}`);
  assert.deepEqual(P.evaluateAchievements(p, { completed: false, altitude: 0, springs: 0, maxChain: 0, difficulty: 'sprout' }, 9), ['evergreen']);
});

test("the browser build's cloud slot reads as progress", () => {
  const text = JSON.stringify({ v: 1, savedAt: 1700000000000, progress: { stagesCompleted: { 'stage-03': 700 }, bests: { journey: 700 }, achievements: {}, daysPlayed: ['2026-09-30'], tutorialsDone: [] } });
  assert.deepEqual(P.readForeign(text), { stagesCompleted: { 'stage-03': 700 }, bests: { journey: 700 }, achievements: {}, daysPlayed: ['2026-09-30'], tutorialsDone: [] });
  assert.equal(P.readForeign('not json'), null);
  assert.equal(P.readForeign(''), null);
  assert.equal(P.readForeign(null), null);
});

test('options: only well-typed values; the old settings keys are legacy', () => {
  assert.deepEqual(P.pickOptions({ leftHanded: true, toggleSteer: 'yes', cvdPalette: 'tritanopia', timingAssist: false, captions: true, muted: true }),
    { leftHanded: true, cvdPalette: 'tritanopia', timingAssist: false, captions: true });
  assert.deepEqual(P.pickOptions({ cvdPalette: 'sepia' }), {});
  for (const k of ['music', 'graphics', 'leftHanded', 'analyticsConsent', 'ui.language', 'audio.options', 'graphics.gpu.x']) assert.ok(P.isLegacyKey(k), k);
  assert.ok(!P.isLegacyKey('something-else'));
});
