/**
 * Skybound Spring — end-to-end playthrough test (dev only, not shipped).
 *
 * Drives the real visible UI in headless Chrome via playwright-core:
 *   title → Settings (open/close) → Play (Journey "Ascent 1") → countdown →
 *   active → pause/resume (Esc) → Restart → a REAL keyboard-steered climb to
 *   the altitude goal ("goal-reached") → results ("🌼 Goal reached!") with
 *   score breakdown → persisted journey progress → back to Title.
 * A second pass runs the load → start → short climb + real touch taps flow on
 * a mobile touch viewport.
 *
 * Observation: the game exposes `window.__game` (main.js bootstrap hook, used
 * by its own smoke tests) with no gameplay effect. The test reads
 * `window.__game.session.state` ONLY to observe run state and to choose which
 * way to steer next (the same reachability knowledge a player gets from the
 * visible pads). It never calls the game's move API — every action is a real
 * keyboard key-down/key-up or a pointer/touch on a visible control. No game
 * code is modified.
 *
 * NOTE on input (bug fixed): `main.js` bindInput() attaches a `pointerdown`
 * listener to #scene-host that calls `setPointerCapture(id)`. The screen
 * overlays are rendered INSIDE #scene-host, so a press that began on a menu
 * button used to be captured by the canvas host and the button's `click` never
 * fired. fixed now: bindInput only calls setPointerCapture when the press
 * lands directly on the game canvas (renderer.domElement), so presses that
 * begin on an overlay button propagate normally and every menu button accepts
 * a real pointer click/touch. This test drives the menu overlay buttons with
 * real pointer clicks (settings Back, mobile title Play) and still exercises
 * the rail action buttons + thumb-tray steer + Esc pause via real input.
 *
 * Serving: the game is fully playable offline (platform.detect sets
 * `available=false` when /api/* is absent/blank and every screen works
 * locally). Per sibling convention this test embeds a minimal node:http static
 * server on an ephemeral port and answers /api/* with `200 {}` so the client
 * degrades to its documented offline path with zero console noise. The
 * authoritative `server.js` is not required for a solo offline playthrough.
 *
 * Run: npm run test:e2e  (or: node tests/e2e.mjs)
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOT = (stage, vp) => `/tmp/skybound-spring-e2e-${stage}-${vp}.png`;

// benign GPU/swiftshader noise (mirrors tools/production_game_audit.mjs)
const browserNoise = /GL Driver Message|GPU stall due to ReadPixels|Automatic fallback to software WebGL|EnableWebGLDeveloperExtensions/i;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    if (p.startsWith('/api/')) {
      // No StarHermit backend here: answer API probes with empty JSON (200) so
      // the platform adapter detects 'offline' without console noise.
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
      return;
    }
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let failures = 0;
const ok = (name) => console.log(`ok - ${name}`);

// ---------- read-only observation of the run state ----------

// window.__game is the game's own bootstrap hook (main.js). Read only: run
// phase, mode/goal, and the player/platform geometry used to pick a steer
// direction — the same legibility a player gets from the visible pads.
const readSim = (page) => page.evaluate(() => {
  const g = window.__game;
  const s = g?.session?.state;
  if (!s) return null;
  const tier = s.tier;
  const reach = (tier.bounceV * tier.bounceV * (1.85 * 1.85)) / (2 * tier.gravity); // spring-apex reach
  const plats = s.platforms
    .filter((p) => p.alive && p.type !== 'thorn' && p.y > s.lastLandY + 5 && p.y - s.lastLandY <= reach + 20)
    .sort((a, b) => a.y - b.y || a.id - b.id);
  return {
    phase: g.state, mode: g.session?.mode, scr: g.ui?.currentScreen,
    tick: s.tick, alt: s.score.altitude, score: s.score.altitude + s.score.chainBonus + s.score.tokens,
    px: s.player.x, py: s.player.y, lastLandY: s.lastLandY,
    goalType: s.goal.type, goalTarget: s.goal.target,
    terminal: s.terminal ? s.terminal.reason : null,
    target: plats[0] ? { x: plats[0].x, y: plats[0].y, id: plats[0].id } : null,
  };
});

const waitActive = (page) =>
  page.waitForFunction(() => {
    const g = window.__game;
    return !!g && g.state === 'active' && !!g.session;
  }, null, { timeout: 15000 });

// Signed circular horizontal delta within the wrapping world (WORLD_WIDTH=480).
const signedDelta = (px, tx) => {
  let d = (tx - px) % 480;
  if (d < -240) d += 480;
  if (d > 240) d -= 480;
  return d;
};

// Drive the run using REAL keyboard steering only. The aim rule is the same a
// player uses: point toward the nearest landable pad above the last landing
// (authoring guarantees that pad is reachable in one bounce). `stopWhen` may end
// the loop early for the short mobile pass; otherwise it runs until terminal.
// Always releases the steering keys before returning.
async function aimSteer(page, { stopWhen, maxMs }) {
  const held = new Set();
  const setKey = async (code, on) => {
    if (on && !held.has(code)) { await page.keyboard.down(code); held.add(code); }
    else if (!on && held.has(code)) { await page.keyboard.up(code); held.delete(code); }
  };
  const release = async () => { await setKey('ArrowRight', false); await setKey('ArrowLeft', false); };
  const started = Date.now();
  let logAt = 0;
  try {
    while (true) {
      const st = await readSim(page);
      if (!st) throw new Error('run state handle gone mid-climb');
      if (st.terminal) return st;
      if (stopWhen && stopWhen(st)) return st;
      let dir = 0;
      if (st.target) {
        const d = signedDelta(st.px, st.target.x);
        if (d > 10) dir = 1;
        else if (d < -10) dir = -1;
      }
      await setKey('ArrowRight', dir === 1);
      await setKey('ArrowLeft', dir === -1);
      if (Date.now() - logAt > 6000) {
        logAt = Date.now();
        console.log(`  ...climbing tick ${st.tick}, altitude ${st.alt} m, player y ${Math.round(st.py)}`);
      }
      if (Date.now() - started > maxMs) throw new Error(`steering did not finish within ${maxMs}ms`);
      await page.waitForTimeout(20);
    }
  } finally {
    await release();
  }
}

// Full-desktop climb: run until a terminal state and return it.
async function climbToGoal(page) {
  return aimSteer(page, { stopWhen: null, maxMs: 90_000 });
}

// ---------- one full pass ----------
async function runPass(browser, name, ctxOpts, { full }) {
  const errors = [];
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error' || browserNoise.test(m.text())) return;
    const url = m.location()?.url || '';
    if (/Failed to load resource/.test(m.text()) && /\/api\/|\/favicon/.test(url)) return;
    errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    const p = r.url();
    if (r.status() >= 400 && !/\/api\/|\/favicon/.test(p)) errors.push(`http ${r.status()}: ${p}`);
  });

  try {
    // load + title
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('.title-panel, .game-title', { timeout: 15000 });
    await page.waitForFunction(() => !!window.__game && window.__game.state === 'title');
    await page.screenshot({ path: SHOT('title', name) });
    ok(`${name}: title screen visible (state "title", WebGL ok)`);

    if (full) {
      // ---- Settings open via the real rail button (pointer) then the Back
      //      button with a REAL pointer click (it lives inside the captured
      //      host; the pointer-capture fix keeps this click firing).
      await page.locator('.actions-card button', { hasText: 'Settings' }).first().click();
      await page.waitForFunction(() => window.__game?.ui?.currentScreen === 'Settings');
      const qSel = await page.locator('.settings-panel select').count();
      const qTog = await page.locator('.settings-panel input[type="checkbox"]').count();
      await page.screenshot({ path: SHOT('settings', name) });
      await page.locator('.settings-panel button', { hasText: 'Back' }).first().click();
      await page.waitForFunction(() => window.__game?.ui?.currentScreen === 'Title');
      ok(`${name}: settings open (${qTog} toggles, ${qSel} quality tiers) and close via real pointer click on overlay Back`);

      // ---- Start Journey via the real rail Play (pointer).
      await page.locator('.actions-card button', { hasText: 'Play' }).first().click();
      await waitActive(page);
      const st0 = await readSim(page);
      if (!st0 || st0.mode !== 'journey') throw new Error(`expected journey mode, got ${JSON.stringify(st0?.mode)}`);
      if (st0.goalType !== 'altitude' || st0.goalTarget !== 300) {
        throw new Error(`expected altitude goal 300, got ${st0.goalType}=${st0.goalTarget}`);
      }
      await page.screenshot({ path: SHOT('play', name) });
      ok(`${name}: Journey "Ascent 1" active (altitude goal ${st0.goalTarget}m, mode ${st0.mode})`);

      // ---- pause / resume via the keyboard (Esc toggles pause).
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.__game?.state === 'paused');
      await page.screenshot({ path: SHOT('pause', name) });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.__game?.state === 'active');
      ok(`${name}: pause (Esc) and resume work`);

      // ---- Restart via the real rail button (pointer); exercises a fresh run.
      await page.locator('.actions-card button', { hasText: 'Restart' }).first().click();
      await waitActive(page);
      ok(`${name}: Restart via the Actions rail starts a fresh climb`);

      // ---- Play it to the real goal with real keyboard steering.
      const done = await climbToGoal(page);
      if (done.terminal !== 'goal-reached') {
        throw new Error(`run did not complete cleanly: terminal=${done.terminal} altitude=${done.alt}`);
      }
      if (done.alt < 300) throw new Error(`goal-reached but altitude < 300: ${done.alt}`);
      ok(`${name}: real keyboard-steered climb reached the goal (altitude ${done.alt}m over ${done.tick} ticks)`);

      // ---- Results screen.
      await page.waitForFunction(() => window.__game?.ui?.currentScreen === 'Results', null, { timeout: 8000 });
      const headline = (await page.textContent('.screens h1')) || '';
      if (!/Goal reached/i.test(headline)) throw new Error(`unexpected results headline: "${headline}"`);
      const rows = await page.locator('.score-breakdown [role="row"]').count();
      if (rows < 4) throw new Error(`score breakdown incomplete (${rows} rows)`);
      const total = (await page.textContent('.score-breakdown .total strong')) || '';
      await page.screenshot({ path: SHOT('results', name) });
      ok(`${name}: climb resolved — results shown ("${headline.trim()}", ${rows} score rows, total ${total})`);

      // ---- Persistence: journey stage 1 recorded as completed.
      const saved = await page.evaluate(() => {
        const raw = localStorage.getItem('skybound-spring:progress');
        if (!raw) return null;
        const outer = JSON.parse(raw);
        return JSON.parse(outer.payload).data;
      });
      if (!saved || !(saved.stagesCompleted && saved.stagesCompleted['stage-01'] > 0)) {
        throw new Error('journey stage-01 completion not persisted: ' + JSON.stringify(saved));
      }
      ok(`${name}: progress persisted (stage-01 best ${saved.stagesCompleted['stage-01']})`);

      // ---- Back to title via the real rail Title button (pointer).
      await page.locator('.actions-card button', { hasText: 'Title' }).first().click();
      await page.waitForFunction(() => window.__game?.state === 'title');
      ok(`${name}: back to title from results`);
    } else {
      // ---- MOBILE: start a run, make real moves, verify progress -------------
      // Real pointer/touch tap on the overlay title Play button (inside the
      // captured host) — the pointer-capture fix lets this click fire.
      const playBtn = page.locator('.title-panel .btn-huge, .btn-primary.btn-huge').first();
      await playBtn.click();
      await waitActive(page);
      const st0 = await readSim(page);
      if (!st0) throw new Error('mobile run did not start');
      await page.screenshot({ path: SHOT('play', name) });

      // Short real keyboard-steered climb to prove live simulation progress.
      const climbed = await aimSteer(page, { stopWhen: (st) => st.alt >= 25, maxMs: 10_000 });
      if (climbed.alt < 1) throw new Error(`mobile climb had no progress: altitude ${climbed.alt}`);
      if (climbed.tick <= st0.tick) throw new Error('simulation did not advance on mobile');

      // Freeze the sim immediately (pause) so it cannot fall away, then make a
      // couple of real touch moves on the visible thumb-tray steer buttons.
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.__game?.state === 'paused');
      const thumb = page.locator('.thumb-tray button[aria-label="Steer right"]').first();
      if (await thumb.count()) {
        const bb = await thumb.boundingBox();
        if (bb) {
          await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
          await page.waitForTimeout(250);
          await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.__game?.state === 'active');
      await page.screenshot({ path: SHOT('mobile-play', name) });
      ok(`${name}: started a run and climbed to ${climbed.alt}m (tick ${st0.tick}→${climbed.tick}) with real + touch input; pause/resume ok`);
    }
  } finally {
    await context.close();
  }

  if (errors.length) throw new Error(`${name} pass had page errors:\n  ${errors.join('\n  ')}`);
  console.log(`ok - ${name}: no page errors`);
}

// ---------- main ----------
let browser = null;
try {
  browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--mute-audio'],
  });
  console.log(`serving ${ROOT} at ${BASE}`);
  await runPass(browser, 'desktop', { viewport: { width: 1280, height: 800 } }, { full: true });
  await runPass(browser, 'mobile',
    { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, { full: false });
  console.log('\nE2E PASS — skybound-spring, desktop + mobile, no page errors');
} catch (e) {
  failures++;
  console.error('\nE2E FAIL:', e.message || e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.close();
}
if (failures) process.exit(1);
