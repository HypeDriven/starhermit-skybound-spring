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

## RESOLVED — Ranked score submissions rejected by the server (field mismatch)

**Status:** RESOLVED

**Symptom:** Every real browser submission to `/api/v1/daily/submit` or
`/api/v1/score/submit` was rejected `422 missing input log`, so ranked daily
scores never reached the leaderboard. The unit tests passed because they
hand-built request bodies with `inputLog` and never exercised the client's
actual payload shape.

**Root cause:** `RunSession.buildEnvelope()` names the ordered command list
`commands`, and `Platform.submitScore()` posted the envelope verbatim, but
`validateSubmission()` in `server.js` only read `body.inputLog`.

**Fix:** `src/platform.js` now sends `inputLog: envelope.commands` explicitly,
and `server.js` accepts either `inputLog` or the envelope-native `commands`.
Regression test `browser envelope shape (commands, no inputLog) is accepted`
added to `tests/server.test.mjs`.

## RESOLVED — Restart crashed when timing assist was enabled

**Status:** RESOLVED

**Symptom:** With "Timing assist" on, clicking Restart after a practice run
threw `TypeError: Cannot read properties of undefined (reading 'gravity')` and
the run never restarted.

**Root cause:** `startRun()` replaces `cfg.difficulty` (a tier key string) with
an assisted tier *object*. `restartRun()` re-enters `startRun()` with that same
object, where `R.DIFFICULTY[cfg.difficulty]` is `undefined`.

**Fix:** `src/main.js` `startRun()` only applies the assist when
`cfg.difficulty` is a string key, which also prevents the gravity reduction
from being applied twice on restart.

## RESOLVED — Leaving to the title during the countdown force-started the run

**Status:** RESOLVED

**Symptom:** Starting a run and then navigating back to the title during the
3-2-1 countdown (rail Settings → Back) left the countdown interval running;
~2 seconds later the game force-closed the title screen and entered `active`
with a live session.

**Fix:** `toTitle()` now clears the countdown interval
(`clearInterval(this._cd)`).

## RESOLVED — Weekly leaderboard entries tagged with the wrong week scope

**Status:** RESOLVED

**Symptom:** `recordScore()` stored a daily entry under the week of its
`entry.date` but stamped the entry's `scope` field with the *current* week
(`isoWeekKey()` with no argument). A late submission near a week boundary was
mislabeled.

**Fix:** the week key is computed once from `entry.date` and used for both the
board bucket and the entry's `scope`.

**Verification (all four fixes):**
- `npm test` — 43/43 pass (incl. the new envelope-shape regression test).
- `node tests/e2e.mjs` — `E2E PASS — skybound-spring, desktop + mobile, no page
  errors` against the rebuilt `app.js` bundle.
- Targeted headless-Chrome checks: timing-assist practice restart stays active
  with stable assisted gravity and an advancing sim; leaving during the
  countdown keeps the game on `title` with no session created.
