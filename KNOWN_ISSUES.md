# Known Issues

## RESOLVED — Menu overlay buttons swallowed pointer clicks (pointer capture)

**Status:** RESOLVED

**Symptom:** The screen overlays (title panel, journey grid, settings, pause,
results) are rendered *inside* `#scene-host`. A pointer/touch press that began
on a menu button was captured by `#scene-host`'s `pointerdown` handler via
`setPointerCapture()`, so the button's `click` never fired. Menu buttons were
only reachable through the keyboard path (focus + Enter/Space, Esc); real
pointer/touch clicks only worked on controls outside `#scene-host` (the
right-rail action buttons, HUD pause, thumb-tray steer).

**Root cause:** `Game.bindInput()` attached a `pointerdown` listener to
`#scene-host` that unconditionally called `setPointerCapture(e.pointerId)` for
every press, regardless of whether it landed on the game canvas or on an
overlay button rendered inside the same host.

**Fix:** `src/main.js` `bindInput()` now captures the pointer (and begins
drag-steering) **only** when the press lands directly on the game canvas —
`e.target === renderer.domElement`. Presses that begin on an overlay button
propagate normally, so every menu button is tappable while canvas drag-steering
is unaffected.

**Verification:**
- `npm test` — 42/42 pass.
- `node tests/e2e.mjs` — `E2E PASS — skybound-spring, desktop + mobile, no page
  errors`. The e2e now drives menu overlay buttons (settings Back on desktop,
  title Play on mobile) with **real pointer clicks** to prove the fix.
