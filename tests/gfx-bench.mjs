// Graphics benchmark hook for tools/gfx-bench.mjs (dev-only): picks a preset in Settings → Graphics from the
// title, presses Play and keeps climbing with the real arrow keys (steering toward the nearest landable pad,
// like tests/e2e.mjs) so the camera scrolls the garden, clouds and pollen and every landing bursts sparkles.
// A finished run is retried from the results screen's Retry button.
export const presets = ['low', 'balanced', 'high', 'ultra'];
export const levels = { low: 0, balanced: 4, high: 10, ultra: 17 };

export async function setPreset(page, preset) {
  await page.waitForFunction(() => window.__game?.state === 'title', null, { timeout: 20000 });
  await page.locator('.title-panel button', { hasText: 'Settings' }).first().click();
  await page.waitForFunction(() => window.__game?.ui?.currentScreen === 'Settings');
  await page.locator('#gfx-preset').scrollIntoViewIfNeeded();
  await page.selectOption('#gfx-preset', preset);
  await page.waitForFunction((p) => document.body.dataset.gfxPreset === p, preset);
  await page.locator('.settings-panel button', { hasText: 'Back' }).first().click();
  await page.waitForFunction(() => window.__game?.ui?.currentScreen === 'Title');
}

// Read-only view of the run (the game's own window.__game hook), as in tests/e2e.mjs.
const readSim = (page) => page.evaluate(() => {
  const g = window.__game, s = g?.session?.state;
  if (!s) return { phase: g?.state, scr: g?.ui?.currentScreen };
  const t = s.tier;
  const reach = (t.bounceV * t.bounceV * (1.85 * 1.85)) / (2 * t.gravity);
  const next = s.platforms
    .filter((p) => p.alive && p.type !== 'thorn' && p.y > s.lastLandY + 5 && p.y - s.lastLandY <= reach + 20)
    .sort((a, b) => a.y - b.y || a.id - b.id)[0];
  return { phase: g.state, scr: g.ui?.currentScreen, terminal: !!s.terminal, px: s.player.x, tx: next ? next.x : null };
});

export async function start(page) {
  await page.locator('.title-panel .btn-huge, .btn-primary.btn-huge').first().click();
  await page.waitForFunction(() => window.__game?.state === 'active', null, { timeout: 20000 });
  let open = true;
  page.once('close', () => { open = false; });
  const held = new Set();
  const key = async (code, on) => {
    if (on && !held.has(code)) { await page.keyboard.down(code); held.add(code); }
    else if (!on && held.has(code)) { await page.keyboard.up(code); held.delete(code); }
  };
  (async () => {
    while (open) {
      try {
        const st = await readSim(page);
        if (st.scr === 'Results') {
          await key('ArrowLeft', false); await key('ArrowRight', false);
          await page.locator('.screens button', { hasText: 'Retry' }).first().click({ timeout: 3000 });
        } else if (st.phase === 'active' && st.tx != null) {
          let d = (st.tx - st.px) % 480;
          if (d < -240) d += 480;
          if (d > 240) d -= 480;
          await key('ArrowRight', d > 10);
          await key('ArrowLeft', d < -10);
        }
      } catch (e) { if (!open) return; if (process.env.BENCH_DEBUG) console.error(e.message); }
      await page.waitForTimeout(30).catch(() => {});
    }
  })();
  await page.waitForTimeout(1500);
}
