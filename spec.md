# Skybound Spring — specification

A vertical garden platformer. The sprout-hopper bounces on its own; the player steers it sideways across
pads rising through a garden in the clouds, chains landings on ever higher pads, grabs glow motes and
avoids thorns. One player; finished Journey, Daily and Challenge runs post to the StarHermit high-score
board.

## Implementation

A StarHermit engine **script game** (TypeScript on the host API), pinned to engine **1.20.1** with
`engine.minor=20` (three.js r185 parity). `starhermit.txt` names the entry `native/main.ts`, the
capabilities `platform, storage, clipboard`, the actions and their gamepad defaults, and
`server=score-script.js`. Browsers open `index.html`, the engine's web loader that `npm run package`
writes with `starhermit-files.json`; the same package plays natively in the StarHermit client.

- `src/rules.js` — the deterministic rules, unchanged: 120 ticks a second, gravity and bounce per tier
  (Sprout, Bloom, Storm), sideways steering with acceleration and the 480-unit wrapping world, the seeded
  platform generator (every row has a reachable landable pad; thorns never on the path), pad types leaf
  (bud), moving leaf (drift), brittle petal (crumb, one landing), spring blossom (×1.85 bounce), wisp (one
  landing) and thorn (ends the run), glow motes (100 points), chains (+min(chain, 25) per higher landing),
  goals (altitude, motes, time limit, steering budget) and the terminal reasons fell / hazard /
  goal-reached / move-limit / time-out. Score = altitude/10 + chain bonus + motes.
- `src/session.js` — the run session, unchanged: validated steer commands, periodic hashes, the replay
  envelope and the Practice undo stack (a snapshot at each landing).
- `src/content.js` — five themes, the colour-vision palettes, 40 Journey stages (a mastery gate every
  8th), two Challenges, four lessons, the Daily from the UTC date, five achievements.
- `src/progress.js` — the save model (below). `src/strings.js` — the string tables; `src/platform-i18n.js`
  — the account strings.
- `native/main.ts` — the state machine and input; `native/screens.ts` — the UI (`starhermit:ui`);
  `native/render.ts` — the garden (`starhermit:scene`); `native/audio.ts`; `native/platform.ts`;
  `native/quality.ts`; `native/style.ts` (styles from `tools/ui-style.css` → `assets/ui-style.json`);
  `native/i18n.ts`; `native/game.ts` (types over the JS modules).

### Time

The runtime's fixed steps run at 60 Hz. Each step reads the steering held then, applies it as a steer
command for the next tick, and runs two rules ticks, then the lesson checks. The countdown (3, 2, 1, Go!)
counts 39 steps a number (650 ms). Pauses, a hidden window and slow frames never cost time, and play
scripts replay exactly. The replay runs four ticks a step.

## Flow and screens

Title → a run (countdown → climbing ⇄ paused → results) → title. Screens sit over the playfield behind a
wash; the rails stay usable beside them.

- **Title**: ▶ Play (the first unfinished Journey stage), Journey, Daily (today's date), Learn, Practice,
  Challenges, Profile, Settings, Help, Sign in with StarHermit (guests) / Invite a friend (signed in), and
  the Journey count with the online state.
- **Journey**: the 40-stage grid (★ mastery gates, ✓ cleared, the next stage ringed, later ones locked
  until the one before is cleared); each tile's name and tooltip give the goal, par, theme, tier and best.
- **Learn**: four lessons (Find the Wind, Spring Blossoms, Drifting Leaves, Brittle Petals; ✓ when done).
  A lesson runs with a lesson bar (step n/total, the instruction, Skip lesson); steps check landings,
  spring landings or 120 steps steered one way. Finishing the steps records the lesson.
- **Practice**: Sprout / Bloom / Storm, a shareable seed (digits are the seed; other text is hashed), Start.
  Unranked, Restart and Undo to last landing (Z). Timing assistance lowers gravity 8 % here.
- **Challenges**: Steady Hands (900 m within 45 steer-seconds) and Sky Sprint (700 m in 50 s).
- **Daily**: one endless run per UTC day (the platform's clock when online, else the device's).
- **Profile**: account line or guest note, achievements, the high-score board's top 10 (signed in), local bests.
- **Pause**: ▶ Resume, Restart, Undo (Practice), Settings, Help, Leave run, mode and tick.
- **Results**: headline and reason, the breakdown (altitude, chain bonus, glow motes, total), par,
  best, unlocked achievements, the leaderboard line, Retry, Watch replay, the next recommendation
  (Next: the following stage after a cleared stage, More lessons, or Journey), Continue.
- **Watch replay**: the last run again at 4× from its recorded steering; at its end the state hash is
  compared with the run's ("Replay verified …" or "Replay mismatch") and the results show again
  (nothing is recorded or posted twice).
- **Welcome back**: after the window was hidden more than 5 s during a run (the run paused when hidden).
- **Help**: the rules cards with the player's current key bindings. **Settings**: the game's options (below)
  and Open Options for the runtime's.

## Layouts

Picked from the window's logical size: from 1024 px wide two 240 px rails beside the playfield (left:
Objective and Progress cards; right: Actions — the phase's buttons — and Status with the cloud-save state);
narrower windows keep the rails as drawers opened by the Objective / Actions chips at the playfield's top
corners (one at a time; ✕, Escape or the scrim closes); portrait phones up to 700 px wide have no rails.
During a run the HUD pill (altitude, score, chain, ⏸ Pause) sits at the playfield's top, the thumb tray
(◀ ▶; both at the start when left-handed) under it, the lesson bar above the tray, captions and toasts at
the bottom. Panels are at most 680 px wide and 90 % tall (94 % on short landscape), scrolling inside.

## Controls

| Action | Keys | Pad | Touch / pointer |
| --- | --- | --- | --- |
| Steer left / right | ← / A, → / D (held) | D-pad, left stick | hold ◀ / ▶, or drag sideways on the playfield (steers once moved 24 px) |
| Pause / resume, back | Esc / P | Start | ⏸ Pause, rail Pause (P) |
| Undo to last landing (Practice) | Z | West | Pause › Undo, rail Undo (Z) |

Keys and pads are rebound in the runtime's Options. With the "Hold-to-steer off" option a steer press
latches until the other direction is pressed. Menus work with Tab/arrows/Enter, the pad and taps.

## Settings

The game's options (engine `settings`, on the device and the account): Captions (text cues for sounds),
Left-handed layout, Hold-to-steer off, Color-vision palette (default, deuteranopia-safe, tritanopia-safe),
Timing assist, and Replay tutorials from the start. The runtime's Options own sound volumes and mute (and
mute when hidden), graphics level and frame rate, language, haptics, reduced motion, high contrast and
text size.

## Graphics

three.js r185 scene ported to `starhermit:scene`: punctual light intensities ÷ π, ACES at exposure 1.05,
`RoomEnvironment(renderer)` lowered 3.5 at environmentIntensity 0.35 (High, Ultra). The sky dome is WGSL
(gradient, haze, sun glow, stars for night themes); linear fog fades only the distant garden. Tiers follow
the old presets: Low (Lambert, no shadows, MSAA, static background, plain pads), Balanced (standard PBR,
512 shadows, bloom 0.6/0.4/threshold 1.4, the linear grade with vignette, FXAA, animated background, vein
and petal textures, pollen), High (clear-coat, 1024 shadows, SMAA, reflections), Ultra (2048 shadows, MSAA,
more clouds/pollen/sparkles). Pollen and sparkle counts scale within a tier by the level (≤ 2×). Reduced
motion stops shake, sway, drift and sparkles.

## Sound

The authored clips per event (bounce, spring, petal breaking, mote, chain bonus every 8, milestone, fall,
thorns, goal, click). The wind and the music (a calm and a climbing pentatonic stem, crossfaded by
altitude / 1500) are rendered once into looping clips on the music bus.

## Platform

- **Save**: the progress document (cleared stages with best scores, best per mode, achievements with
  unlock times, days played, finished lessons) is the engine save; two devices merge (higher scores,
  earliest unlocks, unions). The browser build's cloud slot (`game:<slug>`, `{ v, savedAt, progress }`)
  shows as foreign and is merged and replaced once. The old settings KV values for the five game options
  are adopted (unless set since) and every old KV key is removed.
- **Scores**: signed in, a finished Journey, Daily or Challenge run posts its total through
  `score-script.js` (range-checked, the `high-score` board) and the results show the rank.
- **Achievements**: First Ascent, Spring Master, Streak Tender, Storm Summit, Evergreen — kept in the save.
- Invite link and sign-in from the title; signing out keeps playing locally.

## Localization

en-US, en-GB, es-419, es-ES, de-DE, fr-FR, fr-CA, pt-BR, it-IT, following the runtime's interface language.

## Checks

- `npm run test:unit` — rules (legal actions, scoring, terminals, serialization, determinism, fuzzing,
  generator invariants, every Journey stage and challenge completable by the planning bot), progress
  (merge, results, achievements, foreign save, options), localization coverage.
- `npm run test:native` — web index current, `tsc`, `starhermit check` with no warnings, and render-check
  play scripts: Journey stage 1 won by keys then its replay verified (desktop), the first lesson on a
  DPR-3 phone, Steady Hands on a short landscape phone, Practice with the drawers, pause, settings, help,
  undo, a mouse drag to a fall and the title's screens, and today's Daily (written at test time).
  `tools/gen-plays.mjs` writes the timed scripts from the bot (`tools/bot.mjs`).
- `npm run test:browser` — `tools/browser-play.mjs` plays the package in Chrome on the GPU at desktop, a
  DPR-3 phone and phone landscape (keys, tray holds, drags, pause, drawer, replay).
- `npm run package` after every change; `npm run css` after editing `tools/ui-style.css`.

## Known limitations

- The browser build's guest display name and anonymous analytics buffer (local only) are gone; guests'
  old browser-local progress does not migrate (cloud saves do).
- Sheen on the hopper and spring blossoms is not drawn by the engine.
- Browser runs are real time, not frame-locked: exact runs are checked natively.
- Hosted play does not exist (solo game); signed-in score posting is not live-tested here.
