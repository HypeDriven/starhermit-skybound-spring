// The browser build's DOM shell (src/ui.js + styles.css) as starhermit:ui,
// built every frame over the garden: on windows 1024 px and wider the two
// rails (Objective and Progress cards; the Actions card with the state's
// buttons and the Status card with the phase and cloud-save state) with the
// 3D playfield between them; below 1024 px the rails are closed-by-default
// drawers opened from the Objective / Actions chips (one at a time, closed
// by ✕, Escape or a tap on the scrim), and portrait phones up to 700 px wide
// have no rails at all; the screens over the playfield behind their wash
// (title, Journey grid, Learn, Practice, Challenges, Profile, pause,
// results, Help, Settings, the countdown, the welcome back); and in a run
// the HUD pill (altitude, score, chain, ⏸ Pause), the thumb tray (◀ ▶, both
// at the start for the left-handed) under the playfield, the lesson bar, the
// sound captions and the toasts. The old media queries are layouts picked
// by the window's logical size.
import { frame, openMenu } from "starhermit:engine";
import { bindings } from "starhermit:input";
import * as draw from "starhermit:draw";
import * as ui from "starhermit:ui";
import { Content, Rules, type Palette } from "./game.ts";
import { N, S, T } from "./i18n.ts";
import * as platform from "./platform.ts";
import * as render from "./render.ts";
import {
  STATE_LABELS, app, click, copyInvite, goalText, later, leaderboardLine, leaveRun, open, openOverlay, openProfile, overlayBack,
  pauseRun, playChallenge, playDaily, playLesson, playPractice, playStage, practiceSeed, progress, quickPlay, replayRun, resetTutorials,
  restartRun, resumeRun, signIn, skipLesson, stageName, stageRect, toTitle, today, touchOnly, uiRects, undo,
} from "./main.ts";

// ------------------------------------------------------------------ layout
interface Layout {
  lw: number; lh: number; sc: number; ox: number; oy: number;
  /** Rails beside the playfield (≥ 1024 px). */
  wide: boolean;
  /** Portrait phones (≤ 700 px wide): no rails, no drawers. */
  phone: boolean;
  /** Landscape ≤ 500 px tall. */
  short: boolean;
  rail: number;
  /** The playfield (logical, from the safe area's corner). */
  sx: number; sy: number; sw: number; sh: number;
  trayH: number;
}
const lastSize = new Map<string, number>();
const inRun = (): boolean => !!app.sess && app.machine !== "title";
function layoutNow(): Layout {
  const f = frame();
  const sc = ui.preferences().scale;
  const sa = f.safeArea;
  const lw = Math.max(1, (f.width - sa.left - sa.right) / sc), lh = Math.max(1, (f.height - sa.top - sa.bottom) / sc);
  const wide = lw >= 1024;
  const phone = lw <= 700 && lh > lw;
  const short = lh <= 500 && lw > lh;
  const rail = 240;
  const trayH = inRun() ? (lastSize.get("tray") ?? (short ? 64 : 72)) : 0;
  const sx = wide ? rail : 0;
  return { lw, lh, sc, ox: sa.left, oy: sa.top, wide, phone, short, rail, sx, sy: 0, sw: lw - (wide ? 2 * rail : 0), sh: Math.max(1, lh - trayH), trayH };
}
const fresh = (): boolean => frame().frame !== app.openedFrame;
function textWidth(text: string, style: string, kind?: "button" | "heading"): number {
  return ui.measureText(text, { ...(kind ? { kind } : {}), style }).width / ui.preferences().scale;
}
function win(L: Layout, x: number, y: number, w: number, h: number): { x: number; y: number; width: number; height: number } {
  return { x: L.ox + x * L.sc, y: L.oy + y * L.sc, width: w * L.sc, height: h * L.sc };
}
interface Btn { id: string; text: string; style?: string; act: () => void; disabled?: boolean; name?: string; selected?: boolean }
/** A button `width` wide (null: its text's); a label too long for it wraps inside. */
function button(b: Btn, width: number | null = null): void {
  const style = b.style ?? "btn";
  const opts: ui.ButtonOptions = {};
  if (b.disabled) opts.disabled = true;
  if (b.selected !== undefined) opts.selected = b.selected;
  const inline: ui.Style = width != null ? { width } : {};
  if (width != null && textWidth(b.text, style, "button") > width) {
    const inner = Math.max(20, width - 40);
    opts.content = () => { ui.style({ text: { align: "center" } }).paragraph(b.text, inner); };
  } else if (b.name) opts.content = () => { ui.label(b.text); };
  if (ui.style(style, inline).id(b.id).button(b.name ?? b.text, opts) && fresh() && !b.disabled) later(b.act);
}
/** Text up to `width` wide: one label when it fits, else a paragraph. */
function para(text: string, width: number, cls = "muted", id?: string, align: "start" | "center" = "start"): void {
  if (!text) return;
  let u = ui.style(cls, { text: { align } });
  if (id) u = u.id(id);
  if (textWidth(text, cls) <= width) u.label(text);
  else u.paragraph(text, width);
}
function heading(cls: string, text: string, width: number): void {
  if (textWidth(text, cls, "heading") <= width) ui.style(cls).heading(text);
  else ui.style(cls).paragraph(text, width);
}
/** .row.gap with flex-wrap: buttons packed into rows `width` wide. */
function flow(key: string, width: number, list: Btn[], spacing = 12): void {
  const rows: Btn[][] = [[]];
  let used = 0;
  for (const b of list) {
    const w = textWidth(b.text, b.style ?? "btn", "button");
    if (rows[rows.length - 1]!.length && used + spacing + w > width) { rows.push([]); used = 0; }
    used += (rows[rows.length - 1]!.length ? spacing : 0) + w;
    rows[rows.length - 1]!.push(b);
  }
  ui.column(key, () => rows.forEach((r, i) => ui.row(`${key}-${i}`, () => { for (const b of r) button(b, textWidth(b.text, b.style ?? "btn", "button") > width ? width : null); }, { spacing })), { spacing: 10 });
}
/** A check box whose label wraps (the built-in one's does not): the whole row toggles. */
function check(id: string, text: string, checked: boolean, width: number, onChange: (v: boolean) => void): void {
  const sc = ui.preferences().scale;
  const size = 16 * ui.preferences().textScale;
  const lines = wrap(text, width - 34, size);
  const lineH = size * 1.3;
  const h = Math.max(30, lines.length * lineH + 6);
  const r = ui.id(id).widget(text, {
    role: "checkbox", checked, size: { width, height: h },
    draw: (rect, st) => {
      const bx = rect.x + 2 * sc, by = rect.y + 4 * sc, bs = 20 * sc;
      draw.roundRect(bx, by, bs, bs, 4 * sc, st.highContrast ? st.colors.border : "#3f8f6e");
      draw.roundRect(bx + 2 * sc, by + 2 * sc, bs - 4 * sc, bs - 4 * sc, 3 * sc, checked ? (st.highContrast ? st.colors.accent : "#3f8f6e") : "#ffffff");
      if (checked) {
        draw.line(bx + 5 * sc, by + 10.5 * sc, bx + 8.5 * sc, by + 14 * sc, "#ffffff", 2.5 * sc);
        draw.line(bx + 8.5 * sc, by + 14 * sc, bx + 15 * sc, by + 6 * sc, "#ffffff", 2.5 * sc);
      }
      lines.forEach((l, i) => draw.text(l, rect.x + 32 * sc, rect.y + (3 + i * lineH) * sc, { size: size * sc, color: st.highContrast ? st.colors.text : "#1d2433", font: "sans-serif" }));
    },
  });
  if (r.activated && fresh()) later(() => { onChange(!checked); click(); });
}
/** Words into lines at most `width` logical pixels wide (ui.measureText at `size`). */
function wrap(text: string, width: number, size: number): string[] {
  const sc = ui.preferences().scale;
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const tryLine = line ? line + " " + w : w;
    if (line && ui.measureText(tryLine, { size: size / ui.preferences().textScale }).width / sc > width) { out.push(line); line = w; }
    else line = tryLine;
  }
  if (line) out.push(line);
  return out;
}

// ------------------------------------------------------------------ the frame
export function drawScreens(): void {
  const L = layoutNow();
  const f = frame();
  const st = win(L, L.sx, L.sy, L.sw, L.sh);
  Object.assign(stageRect, st);
  render.setView(f.width, f.height, st.x, st.y, st.width, st.height);
  backdrop(L);
  if (L.wide) rails(L);
  if (inRun()) { hud(L); tray(L); }
  if (app.tutorial && inRun() && app.screen === null) lessonBar(L);
  if (app.screen !== null) screenPage(L);
  else if (!L.wide && !L.phone) drawers(L);
  captions(L);
  toastView(L);
  if (app.focusNext) {
    const age = f.frame - app.openedFrame;
    if (age >= 1 && !touchOnly()) ui.setFocus(app.focusNext);
    if (age >= 10) app.focusNext = null;
  }
}

/** body { background: #7fb7e8 }: the strips the playfield leaves (rails, tray). */
function backdrop(L: Layout): void {
  const f = frame();
  const parts: [number, number, number, number][] = [];
  if (L.wide) parts.push([0, 0, L.rail, L.lh], [L.lw - L.rail, 0, L.rail, L.lh]);
  if (L.trayH > 0) parts.push([L.sx, L.sh, L.sw, L.trayH]);
  if (!parts.length) return;
  ui.place("backdrop", { anchor: "top-start", x: 0, y: 0 }, () => {
    ui.widget("", {
      role: "none", size: { width: 0, height: 0 },
      draw: () => {
        for (const [x, y, w, h] of parts) {
          const r = win(L, x, y, w, h);
          draw.box(r.x, r.y, Math.min(r.width, f.width), r.height, "page-bg");
        }
      },
    });
  });
}

// ------------------------------------------------------------------ rails and drawers
const SYNC: Record<string, string> = { guest: N("offline (local save)"), saving: N("cloud: saving…"), synced: N("cloud: synced"), offline: N("cloud: sync error") };
function objectiveText(): string {
  if (app.run && app.sess && app.machine !== "title") return goalText(app.sess.cfg, app.run.label());
  return "—";
}
function progressText(): string {
  if (!app.sess || app.machine === "title") return "—";
  const s = app.sess.state;
  return T("Altitude {alt} · motes {motes} · chain ×{chain}", { alt: s.score.altitude, motes: s.score.tokens / Rules.TOKEN_SCORE, chain: s.chain });
}
interface Act { id: string; text: string; act: () => void; primary?: boolean }
/** main.js setActions per phase. */
function actions(): Act[] {
  if (app.machine === "title") {
    return [
      { id: "rail-play", text: T("Play"), act: () => { click(); quickPlay(); }, primary: true },
      { id: "rail-journey", text: T("Journey"), act: () => { click(); open("journey"); } },
      { id: "rail-settings", text: T("Settings"), act: () => openOverlay("settings") },
    ];
  }
  if (app.machine === "results") {
    return [
      { id: "rail-retry", text: T("Retry"), act: restartRun, primary: true },
      { id: "rail-title", text: T("Title"), act: () => { click(); toTitle(); } },
    ];
  }
  const list: Act[] = [{ id: "rail-pause", text: T("Pause (P)"), act: () => { ui.setFocus(null); pauseRun(); }, primary: true }];
  if (app.sess?.allowUndo) list.push({ id: "rail-undo", text: T("Undo (Z)"), act: () => { ui.setFocus(null); undo(); } });
  list.push({ id: "rail-restart", text: T("Restart"), act: restartRun }, { id: "rail-leave", text: T("Leave"), act: leaveRun });
  return list;
}
function card(key: string, w: number, title: string, body: () => void): void {
  ui.column(key, () => { heading("card-h2", title, w - 24); body(); }, { style: "card", width: w, spacing: 6 });
}
function railLeft(w: number): void {
  card("card-objective", w, T("Objective"), () => para(objectiveText(), w - 24, "text", "rail-objective"));
  card("card-progress", w, T("Progress"), () => para(progressText(), w - 24, "text", "rail-progress"));
}
function railRight(w: number): void {
  card("card-actions", w, T("Actions"), () => {
    for (const a of actions()) button({ id: a.id, text: a.text, style: a.primary ? "btn-primary" : "btn", act: a.act }, w - 32);
  });
  card("card-status", w, T("Status"), () => {
    para(T(STATE_LABELS[app.machine]!), w - 24, "text", "rail-status");
    para(T(SYNC[platform.syncState() ?? "guest"]!), w - 24, "small", "rail-sync");
  });
}
function rails(L: Layout): void {
  const w = L.rail - 24;
  uiRects.push(ui.place("rail-left", { anchor: "top-start", x: 12, y: 12 }, () => ui.column("rail-left-col", () => railLeft(w), { width: w, spacing: 8 })));
  uiRects.push(ui.place("rail-right", { anchor: "top-end", x: 12, y: 12 }, () => ui.column("rail-right-col", () => railRight(w), { width: w, spacing: 8 })));
}
function drawers(L: Layout): void {
  if (!app.drawer) {
    // .rail-toggles: the chips at the playfield's top corners
    const chip = (side: "left" | "right", text: string): void => {
      if (ui.style("btn-small").id(`toggle-${side}`).button(text) && fresh()) later(() => { click(); app.drawer = side; });
    };
    uiRects.push(ui.place("toggle-l", { anchor: "top-start", x: L.sx + 8, y: 8 }, () => chip("left", T("Objective"))));
    uiRects.push(ui.place("toggle-r", { anchor: "top-end", x: 8, y: 8 }, () => chip("right", T("Actions"))));
    return;
  }
  const side = app.drawer;
  const dw = Math.min(300, L.lw * 0.85);
  ui.place("scrim", { anchor: "top-start", x: 0, y: 0 }, () => {
    const r = ui.widget(T("Close panel"), { role: "button", size: { width: L.lw, height: L.lh }, style: "scrim" });
    if (r.activated && fresh()) later(() => { app.drawer = null; });
  });
  ui.place("drawer", { anchor: side === "left" ? "top-start" : "top-end", x: 0, y: 0 }, () => {
    ui.column("drawer-col", () => {
      ui.row("drawer-close-row", () => {
        ui.spacer();
        if (ui.style("btn-small").id("drawer-close").button(T("Close panel"), { content: () => ui.label("✕") }) && fresh()) later(() => { click(); app.drawer = null; });
      }, { width: dw - 24 });
      if (side === "left") railLeft(dw - 24); else railRight(dw - 24);
    }, { width: dw, height: L.lh, spacing: 8, style: "drawer" });
  });
}

// ------------------------------------------------------------------ run chrome
function hud(L: Layout): void {
  const s = app.sess!.state;
  const items = [`${s.score.altitude} m`, T("Score {n}", { n: Rules.totalScore(s) }), s.chain > 1 ? T("Chain ×{n}", { n: s.chain }) : ""];
  const live = app.machine === "active" && app.screen === null && !app.replay;
  const w = lastSize.get("hud") ?? 300;
  const r = ui.place("hud", { anchor: "top-start", x: L.sx + Math.max(4, (L.sw - w) / 2), y: 8 }, () => {
    const box = ui.row("hud-row", () => {
      items.forEach((t, i) => ui.style("hud-item", { minWidth: 56 }).id(`hud-${i}`).label(t));
      if (ui.style("btn-small").id("btn-pause-hud").button(T("⏸ Pause")) && fresh()) later(() => { ui.setFocus(null); if (live) pauseRun(); });
    }, { style: "hud", spacing: 12, align: "center" });
    lastSize.set("hud", box.width / L.sc);
  });
  uiRects.push(r);
  // the board's text mirror (ui.js boardMirror, a screen-reader-only live region)
  ui.place("mirror", { anchor: "top-start", x: L.sx, y: 0 }, () => { ui.widget(mirrorText(), { role: "image", size: { width: 1, height: 1 } }); });
}
const PAD_NAMES: Record<string, string> = {
  bud: N("leaf pad"), drift: N("moving leaf"), crumb: N("brittle petal"), spring: N("spring blossom"), wisp: N("wisp pad"), thorn: N("THORN hazard"),
};
/** GameRenderer.boardMirror. */
function mirrorText(): string {
  const s = app.sess?.state;
  if (!s) return "";
  if (s.terminal) return T("Run over: {reason}. Altitude {alt}.", { reason: s.terminal.reason, alt: s.score.altitude });
  const above = s.platforms.filter((p) => p.alive && p.y > s.player.y + 20 && p.y < s.player.y + 400).sort((a, b) => a.y - b.y).slice(0, 3).map((p) => {
    const side = p.x < s.player.x - 30 ? T("{what} left") : p.x > s.player.x + 30 ? T("{what} right") : T("{what} above");
    return side.replace("{what}", T(PAD_NAMES[p.type] ?? p.type));
  });
  return T("Altitude {alt}, chain {chain}. Next: {next}.", { alt: s.score.altitude, chain: s.chain, next: above.join(", ") || T("none in range") });
}
/** .thumb-tray: ◀ at the start, ▶ at the end (both at the start for the left-handed); held while pressed. */
function tray(L: Layout): void {
  const live = app.machine === "active" && app.screen === null && !app.replay;
  const tall = L.short ? 48 : 56;
  let dir = 0;
  const r = ui.place("tray", { anchor: "top-start", x: L.sx, y: L.sh }, () => {
    const row = ui.row("tray-row", () => {
      const b = (side: -1 | 1): void => {
        const label = side < 0 ? T("Steer left") : T("Steer right");
        const res = ui.id(side < 0 ? "steer-left" : "steer-right").widget(label, {
          role: "button", size: { width: 64, height: tall }, style: "thumb-btn",
          draw: (rect, st) => {
            if (st.pressed) draw.box(rect.x, rect.y, rect.width, rect.height, "thumb-btn-on");
            const sc = st.scale;
            const cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2, s = 9 * sc;
            const c = st.pressed ? "#ffffff" : st.highContrast ? st.colors.text : "#1d2433";
            // ◀ / ▶ as a filled triangle (font glyphs vary)
            for (let k = 0; k <= 2 * s; k += Math.max(1, sc * 0.75)) {
              const half = (k / (2 * s)) * s;
              const x = side < 0 ? cx - s + k : cx + s - k;
              draw.line(x, cy - half, x, cy + half, c, Math.max(1, sc));
            }
          },
        });
        if (res.pressed && live) dir += side;
      };
      b(-1);
      if (!platform.options.leftHanded) ui.spacer();
      b(1);
    }, { width: L.sw, spacing: 8, padding: { top: 8, bottom: 8, start: 12, end: 12 }, align: "center" });
    lastSize.set("tray", row.height / L.sc);
  });
  app.trayDir = Math.sign(dir);
  uiRects.push(r);
}
function lessonBar(L: Layout): void {
  const t = app.tutorial!;
  const step = T("Lesson {n}/{total}", { n: t.stepIdx + 1, total: t.def.steps.length });
  const text = T(t.def.steps[t.stepIdx]!.text);
  const maxW = Math.min(560, L.lw * 0.92);
  const inner = maxW - 36;
  const h = lastSize.get("lesson") ?? 60;
  const bottom = L.trayH + 4 + (L.short ? 0 : 4);
  const r = ui.place("lesson", { anchor: "top-start", x: (L.lw - maxW) / 2, y: L.lh - bottom - h - 4 }, () => {
    const box = ui.column("lesson-col", () => {
      const skipW = textWidth(T("Skip lesson"), "btn-small", "button");
      const stepW = textWidth(step, "tutorial-step");
      if (stepW + skipW + 220 <= inner) {
        ui.row("lesson-row", () => {
          ui.style("tutorial-step").id("lesson-step").label(step);
          para(text, inner - stepW - skipW - 24, "text", "lesson-text");
          ui.spacer();
          button({ id: "btn-skip-lesson", text: T("Skip lesson"), style: "btn-small", act: skipLesson });
        }, { width: inner, spacing: 12, align: "center" });
      } else {
        ui.row("lesson-row", () => {
          ui.style("tutorial-step").id("lesson-step").label(step);
          ui.spacer();
          button({ id: "btn-skip-lesson", text: T("Skip lesson"), style: "btn-small", act: skipLesson });
        }, { width: inner, spacing: 12, align: "center" });
        para(text, inner, "text", "lesson-text");
      }
    }, { style: "tutorial-bar", width: maxW, spacing: 6 });
    lastSize.set("lesson", box.height / L.sc);
  });
  uiRects.push(r);
}
function captions(L: Layout): void {
  const c = app.caption;
  if (!c) return;
  const text = T(c.text);
  const w = textWidth(text, "captions-text") + 20;
  ui.place("captions", { anchor: "top-start", x: (L.lw - w) / 2, y: L.lh - 8 - 24 }, () => {
    ui.column("captions-col", () => ui.style("captions-text").id("captions-text").label(text), { style: "captions" });
  });
}
function toastView(L: Layout): void {
  const t = app.toast;
  if (!t) return;
  const text = t.text();
  const tw = Math.min(L.lw * 0.92, 520, textWidth(text, "toast-text") + 34);
  const th = lastSize.get("toast") ?? 40;
  ui.place("toast", { anchor: "top-start", x: (L.lw - tw) / 2, y: L.lh - 16 - th - (inRun() && app.screen === null ? L.trayH : 0) }, () => {
    const r = ui.column("toast-col", () => para(text, tw - 34, "toast-text", "toast-text", "center"), { style: "toast", width: tw, align: "center" });
    lastSize.set("toast", r.height / L.sc);
  });
}

// ------------------------------------------------------------------ screens
function screenPage(L: Layout): void {
  const f = frame();
  // .screen: the wash over the playfield (the rails stay usable beside it)
  const r = win(L, L.sx, L.sy, L.sw, L.sh);
  ui.place("wash", { anchor: "top-start", x: L.sx, y: L.sy }, () => {
    ui.widget("", { role: "none", size: { width: L.sw, height: L.sh }, draw: () => draw.box(r.x, r.y, Math.min(r.width, f.width), r.height, "wash") });
  });
  switch (app.screen) {
    case "title": page("title", L, titleScreen); break;
    case "journey": page("journey", L, journeyScreen); break;
    case "learn": page("learn", L, learnScreen); break;
    case "practice": page("practice", L, practiceScreen); break;
    case "challenges": page("challenges", L, challengesScreen); break;
    case "profile": page("profile", L, profileScreen); break;
    case "pause": page("pause", L, pauseScreen); break;
    case "results": page("results", L, resultsScreen); break;
    case "help": page("help", L, helpScreen); break;
    case "settings": page("settings", L, settingsScreen); break;
    case "countdown": page("countdown", L, countdownScreen, 240); break;
    case "away": page("away", L, awayScreen); break;
    default: break;
  }
}
/** .panel centred over the playfield: at most 680 px (94 % of the window) wide and 90 % tall, scrolling inside when taller. */
function page(key: string, L: Layout, build: (w: number, L: Layout) => void, maxW = 680): void {
  const pad = L.phone ? 16 : 24;
  const outer = Math.min(maxW, L.lw * 0.94, L.sw - 24);
  const avail = Math.max(80, Math.min(L.lh * (L.short ? 0.94 : 0.9), L.sh - 24));
  const h = lastSize.get(key) ?? 0;
  const scroll = h > avail + 0.5;
  const inner = outer - 2 * pad - (scroll ? 14 : 0);
  const opening = frame().frame - app.openedFrame <= 6;
  const y = L.sy + (L.sh - Math.min(h, avail)) / 2;
  const x = L.sx + (L.sw - outer) / 2;
  ui.place(`page-${key}`, { anchor: "top-start", x, y }, () => {
    const body = (): void => {
      const r = ui.column(`${key}-col`, () => build(inner, L), {
        width: outer - (scroll ? 14 : 0), spacing: L.short ? 8 : 12, padding: { top: 20, bottom: 20, start: pad, end: pad }, style: scroll ? undefined : "panel",
      });
      lastSize.set(key, r.height / L.sc);
    };
    if (scroll) ui.column(`${key}-frame`, () => ui.scrollArea(`${key}-scroll`, { width: outer, height: avail }, body, opening ? { scrollTo: { top: 0 } } : undefined), { style: "panel", padding: 0 });
    else body();
  });
}
function backButton(act: () => void = () => { click(); toTitle(); }): void {
  button({ id: "btn-back", text: T("Back"), act });
}

function titleScreen(w: number): void {
  heading("game-title", "Skybound Spring", w);
  para(T("Bounce up the endless garden. Chain landings, dodge thorns, chase the sky."), w, "tagline", "tagline");
  button({ id: "btn-play", text: T("▶ Play"), style: "btn-huge", act: () => { click(); quickPlay(); } });
  const daily = Content.dailyConfig(today());
  flow("title-r1", w, [
    { id: "btn-journey", text: T("Journey"), act: () => { click(); open("journey"); } },
    { id: "btn-daily", text: T("Daily ({date})", { date: daily.date }), act: playDaily },
    { id: "btn-learn", text: T("Learn"), act: () => { click(); open("learn"); } },
  ]);
  flow("title-r2", w, [
    { id: "btn-practice", text: T("Practice"), act: () => { click(); app.practice.seed ||= String(Math.floor(Math.random() * 1e9)); open("practice"); } },
    { id: "btn-challenges", text: T("Challenges"), act: () => { click(); open("challenges"); } },
    { id: "btn-profile", text: T("Profile"), act: openProfile },
  ]);
  flow("title-r3", w, [
    { id: "btn-settings", text: T("Settings"), act: () => openOverlay("settings") },
    { id: "btn-help", text: T("Help"), act: () => openOverlay("help") },
  ]);
  const acct: Btn[] = [];
  if (!platform.signedIn()) acct.push({ id: "btn-signin", text: S("signIn"), act: signIn });
  if (platform.inviteLink()) acct.push({ id: "btn-invite", text: S("invite"), act: copyInvite });
  if (acct.length) flow("title-r4", w, acct);
  const done = Object.keys(progress().stagesCompleted).length;
  const online = platform.signedIn() ? T("Online as {name}", { name: platform.displayName() }) : T("Offline — practice & local daily");
  para(T("Journey: {done}/40 stages · {online}", { done, online }), w, "muted", "title-footer");
}

function journeyScreen(w: number): void {
  heading("h1", T("Journey"), w);
  const p = progress();
  const stages = Content.allStages();
  const track = Content.masteryTrack(p);
  para(T("Mastery gates: {done}/{total} cleared", { done: track.filter((t) => t.completed).length, total: track.length }), w, "muted", "journey-summary");
  const firstLocked = stages.findIndex((_s, i) => i > 0 && !p.stagesCompleted[stages[i - 1]!.id]);
  const cols = Math.max(3, Math.floor((w + 6) / 58));
  const cw = (w - (cols - 1) * 6) / cols;
  ui.grid("stage-grid", () => {
    stages.forEach((s, i) => {
      const unlocked = i === 0 || p.stagesCompleted[stages[i - 1]!.id] !== undefined;
      const best = p.stagesCompleted[s.id];
      const theme = Content.THEMES.find((t) => t.key === s.theme)!;
      const goal = s.goal.type === "tokens" ? T("collect {n} motes", { n: s.goal.target }) : T("reach {n}m", { n: s.goal.target });
      const desc = [stageName(s) + " — " + goal, T("par {n}s", { n: s.parSeconds }), T(theme.name), T(Rules.DIFFICULTY[s.difficulty]!.label)].join(" · ") +
        (best !== undefined ? " · " + T("best {n}", { n: best }) : "") + (unlocked ? "" : " " + T("(locked)"));
      const style = i === firstLocked ? "btn-cell-next" : s.mastery ? "btn-cell-mastery" : "btn-cell";
      const text = `${s.mastery ? "★" : ""}${i + 1}${best !== undefined ? "✓" : ""}`;
      if (ui.style(style, { width: cw }).id(`stage-${i + 1}`).tooltip(desc).button(desc, { disabled: !unlocked, content: () => ui.label(text) }) && fresh() && unlocked) later(() => playStage(s));
    });
  }, { columns: cols, gap: 6 });
  backButton();
}

function learnScreen(w: number): void {
  heading("h1", T("Learn"), w);
  para(T("Short interactive lessons. You must perform each move to advance."), w, "muted");
  const p = progress();
  Content.TUTORIALS.forEach((t, i) => {
    const text = `${T(t.name)}${p.tutorialsDone.includes(t.id) ? " ✓" : ""}`;
    const bw = textWidth(text, "btn", "button");
    const snippet = T(t.steps[0]!.text).slice(0, 60) + "…";
    if (bw + 8 + 120 <= w) {
      ui.row(`lesson-row-${i}`, () => {
        button({ id: `lesson-${i + 1}`, text, act: () => playLesson(t) });
        para(snippet, w - bw - 8, "small");
      }, { spacing: 8, align: "center", width: w });
    } else {
      button({ id: `lesson-${i + 1}`, text, act: () => playLesson(t) }, Math.min(w, bw));
      para(snippet, w, "small");
    }
  });
  backButton();
}

function practiceScreen(w: number): void {
  heading("h1", T("Practice"), w);
  para(T("Unranked. Free restart, undo-to-last-landing (Z), any difficulty. Expected session: 2–5 minutes."), w, "muted");
  const pr = app.practice;
  flow("tier-flow", w, Object.values(Rules.DIFFICULTY).map((d) => ({
    id: `tier-${d.key}`, text: T(d.label), selected: pr.tier === d.key, act: () => { click(); pr.tier = d.key; },
  })));
  const label = T("Seed (shareable):");
  const lw = textWidth(label, "text");
  const fieldW = Math.min(200, w - (lw + 8 <= w - 140 ? lw + 8 : 0));
  const field = (): void => { pr.seed = ui.textField("practice-seed", pr.seed, { maxChars: 12, width: fieldW, placeholder: T("Practice seed") }); };
  if (lw + 8 + 140 <= w) ui.row("seed-row", () => { ui.style("text").label(label); field(); }, { spacing: 8, align: "center" });
  else { ui.style("text").label(label); field(); }
  button({ id: "btn-practice-start", text: T("Start practice run"), style: "btn-primary", act: () => playPractice(pr.tier, practiceSeed(pr.seed)) });
  backButton();
}

function challengesScreen(w: number): void {
  heading("h1", T("Challenges"), w);
  Content.CHALLENGES.forEach((c, i) => {
    ui.column(`challenge-card-${i}`, () => {
      heading("h2", T(c.name), w - 24);
      para(T(c.description), w - 24, "text");
      para(T("Difficulty: {tier} · Ranked: no · Expected: under 2 minutes", { tier: T(Rules.DIFFICULTY[c.difficulty]!.label) }), w - 24, "small");
      button({ id: `challenge-${i + 1}`, text: T("Attempt"), style: "btn-primary", name: `${T("Attempt")} — ${T(c.name)}`, act: () => playChallenge(c) });
    }, { style: "help-card", width: w, spacing: 6 });
  });
  backButton();
}

function profileScreen(w: number): void {
  heading("h1", T("Profile"), w);
  const p = progress();
  if (platform.signedIn()) {
    para(T("Account: {name}", { name: platform.displayName() }), w, "text", "profile-account");
    para(T("Cloud save: {state}", { state: T(SYNC[platform.syncState() ?? "guest"]!) }), w, "small", "profile-sync");
  } else para(T("Guest — progress stays on this device."), w, "text", "profile-account");
  heading("h2", T("Achievements"), w);
  for (const a of Content.ACHIEVEMENTS) {
    const got = !!p.achievements[a.key];
    para(`${T(a.name)} — ${T(a.description)}`, w, "text");
    para(got ? T("✓ unlocked") : T("locked"), w, got ? "unlocked" : "muted");
  }
  heading("h2", T("Leaderboards"), w);
  if (platform.signedIn()) {
    ui.column("board-card", () => {
      heading("card-h3", T("Global"), w - 24);
      const b = app.board;
      if (b === "loading" || b === null) para(T("Loading boards…"), w - 24, "muted");
      else if (b === "none") para(T("No platform leaderboard for this game yet — local bests below."), w - 24, "muted");
      else if (!b.length) para(T("No entries yet — be the first!"), w - 24, "muted");
      else b.slice(0, 10).forEach((e, i) => para(`${i + 1}. ${e.name || T("Player")} — ${e.score}${e.rank ? ` (#${e.rank})` : ""}`, w - 24, e.mine ? "unlocked" : "text"));
    }, { style: "help-card", width: w, spacing: 4 });
  } else para(T("Offline — online leaderboards need a StarHermit sign-in."), w, "muted");
  para(T("Local bests — Practice: {practice} · Daily: {daily} · Journey stages: {stages}/40", { practice: p.bests.practice || 0, daily: p.bests.daily || 0, stages: Object.keys(p.stagesCompleted).length }), w, "muted", "local-bests");
  backButton();
}

function pauseScreen(w: number): void {
  heading("h1", T("Paused"), w);
  button({ id: "btn-resume", text: T("▶ Resume"), style: "btn-huge", act: () => { click(); resumeRun(); } });
  const list: Btn[] = [{ id: "btn-restart", text: T("Restart"), act: restartRun }];
  if (app.sess?.allowUndo) list.push({ id: "btn-undo", text: T("Undo to last landing (Z)"), act: () => { click(); resumeRun(); undo(); } });
  list.push({ id: "btn-pause-settings", text: T("Settings"), act: () => openOverlay("settings") }, { id: "btn-pause-help", text: T("Help"), act: () => openOverlay("help") });
  flow("pause-row", w, list);
  button({ id: "btn-leave", text: T("Leave run"), style: "btn-danger", act: leaveRun });
  para(T("Mode: {mode} · Ranked: {ranked} · Tick {tick}", { mode: app.run!.label(), ranked: T("no"), tick: app.sess!.state.tick }), w, "small", "pause-info");
}

const REASON_TEXT: Record<string, string> = {
  fell: N("You fell below the garden."), hazard: N("Thorns got you."), "goal-reached": N("Goal reached!"),
  "move-limit": N("Steering budget spent."), "time-out": N("Out of time."),
};
function resultsScreen(w: number): void {
  const R = app.results;
  if (!R) return;
  heading("h1", R.reason === "goal-reached" ? T("🌼 Goal reached!") : T("Run over"), w);
  para(T(REASON_TEXT[R.reason] ?? R.reason), w, "result-reason", "results-reason");
  const rows: [string, number, boolean][] = [
    [T("Altitude"), R.score.altitude, false], [T("Chain bonus"), R.score.chainBonus, false], [T("Glow motes"), R.score.tokens, false], [T("Total"), R.score.total, true],
  ];
  ui.column("score-breakdown", () => rows.forEach(([k, v, total], i) => {
    if (total) ui.widget("", { role: "none", size: { width: w, height: 2 }, style: "total-rule" });
    ui.row(`score-row-${i}`, () => {
      ui.style(total ? "score-total" : "score-key").label(k);
      ui.spacer();
      ui.style(total ? "score-total" : "score-value").id(`score-${i}`).label(String(v));
    }, { width: w, spacing: 24 });
  }), { spacing: 4, width: w });
  if (R.par) para(T("Par: {n}s", { n: R.par }), w, "muted");
  para(R.isBest ? (R.prevBest ? T("New best! (was {n})", { n: R.prevBest }) : T("New best!")) : T("Best: {n}", { n: R.best }), w, "muted", "results-best");
  if (R.achievements.length) {
    para(T("Achievement unlocked: {list}", { list: R.achievements.map((k) => T(Content.ACHIEVEMENTS.find((a) => a.key === k)?.name ?? k)).join(", ") }), w, "achv");
  }
  para(T("Score saved to your local bests."), w, "small");
  const lb = leaderboardLine();
  if (R.post && lb) para(lb, w, "muted", "results-lb");
  const list: Btn[] = [
    { id: "btn-retry", text: T("Retry"), style: "btn-primary", act: restartRun },
    { id: "btn-replay", text: T("Watch replay"), act: replayRun },
  ];
  if (R.next) list.push({ id: "btn-next", text: R.next.label(), act: R.next.act });
  flow("results-row", w, list);
  button({ id: "btn-continue", text: T("Continue"), act: () => { click(); toTitle(); } });
}

function countdownScreen(w: number): void {
  const n = app.countdown;
  ui.column("countdown-col", () => ui.style("countdown-num").id("countdown-num").label(n > 0 ? String(n) : T("Go!")), { width: w, align: "center" });
}
function awayScreen(w: number): void {
  const a = app.away;
  heading("h1", T("Welcome back"), w);
  para(T("You were away {n}s. The run was paused — nothing happened while you were gone.", { n: a?.seconds ?? 0 }), w, "text");
  para(T("Altitude reached: {n}m.", { n: a?.altitude ?? 0 }), w, "muted");
  button({ id: "btn-away-resume", text: T("Resume"), style: "btn-primary", act: () => { click(); resumeRun(); } });
}

// ------------------------------------------------------------------ help and settings
function keys(action: string): string {
  const NAMES: Record<string, string> = { "Arrow Left": "←", "Arrow Right": "→", "Arrow Up": "↑", "Arrow Down": "↓", Escape: "Esc" };
  const list: string[] = [];
  // every keyboard binding, as Platform.keyLabel listed them ("← / A")
  try {
    for (const b of bindings(action)) if (b.device === "keyboard") list.push(NAMES[b.label] ?? b.label);
  } catch { /* not yet */ }
  return [...new Set(list)].join(" / ") || "—";
}

function helpScreen(w: number): void {
  heading("h1", T("How to play"), w);
  const cards: [string, string][] = [
    [T("Auto-bounce"), T("Your sprout-hopper bounces on its own. Land on pads to keep climbing — each landing bounces you again.")],
    [T("Steering"), T("Hold {left} or {right} to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.", { left: keys("left"), right: keys("right") })],
    [T("Screen wrap"), T("Fly off the left edge and you reappear on the right (and vice versa). Classic garden physics!")],
    [T("Leaf pads (green)"), T("Safe, sturdy, unlimited bounces.")],
    [T("Moving leaves (blue)"), T("Slide sideways near their perch. Time your landing.")],
    [T("Brittle petals (brown)"), T("Break after one landing. Never plan to come back.")],
    [T("Spring blossoms (pink)"), T("Launch you nearly twice as high. Chain them for huge climbs.")],
    [T("Wisp pads (pale)"), T("Fragile: one landing and they fade.")],
    [T("Thorn clusters (red spikes)"), T("Never land on thorns — the run ends instantly.")],
    [T("Glow motes (gold)"), T("Worth 100 points each. Grab them mid-flight.")],
    [T("Chains"), T("Land on successively higher pads to grow your chain bonus. Dropping to a lower pad resets it.")],
    [T("Falling"), T("The camera only moves up. Fall below the bottom of the view and the run ends.")],
    [T("Undo (practice)"), T("Press {key} in practice to jump back to your last landing.", { key: keys("undo") })],
    [T("Pause"), T("Press {key} to pause or resume.", { key: keys("pause") })],
  ];
  const cols = Math.max(1, Math.floor((w + 8) / 208));
  const cw = (w - (cols - 1) * 8) / cols;
  ui.grid("help-grid", () => {
    cards.forEach(([t, d], i) => ui.column(`help-${i}`, () => { heading("card-h3", t, cw - 24); para(d, cw - 24, "text"); }, { style: "help-card", width: cw, spacing: 4 }));
  }, { columns: cols, gap: 8 });
  backButton(overlayBack);
}

const PALETTE_KEYS: Palette[] = ["default", "deuteranopia", "tritanopia"];
const PALETTE_NAMES = [N("Default"), N("Deuteranopia-safe"), N("Tritanopia-safe")];
function settingsScreen(w: number): void {
  heading("h1", T("Settings"), w);
  const o = platform.options;
  heading("h2", T("Audio"), w);
  check("set-captions", T("Captions (text cues for sounds)"), o.captions, w, (v) => platform.setOption("captions", v));
  heading("h2", T("Controls"), w);
  check("set-leftHanded", T("Left-handed layout"), o.leftHanded, w, (v) => platform.setOption("leftHanded", v));
  check("set-toggleSteer", T("Hold-to-steer off (toggle steering)"), o.toggleSteer, w, (v) => platform.setOption("toggleSteer", v));
  heading("h2", T("Accessibility"), w);
  const label = T("Color-vision palette");
  const idx = Math.max(0, PALETTE_KEYS.indexOf(o.cvdPalette));
  const sel = (): void => {
    const next = ui.id("set-palette").select(label, idx, PALETTE_NAMES.map((n) => T(n)));
    if (next !== idx && fresh()) later(() => { platform.setOption("cvdPalette", PALETTE_KEYS[next]!); click(); });
  };
  if (textWidth(label, "text") + 220 <= w) ui.row("palette-row", () => { ui.style("text").label(label); sel(); }, { spacing: 8, align: "center" });
  else { ui.style("text").label(label); sel(); }
  check("set-timingAssist", T("Timing assist (wider landing forgiveness in practice)"), o.timingAssist, w, (v) => platform.setOption("timingAssist", v));
  heading("h2", T("Data"), w);
  button({ id: "btn-reset-tutorials", text: T("Replay tutorials from the start"), act: resetTutorials }, textWidth(T("Replay tutorials from the start"), "btn", "button") > w ? w : null);
  para(T("Sound, graphics, language, haptics, reduced motion, high contrast and larger text are in the StarHermit Options."), w, "muted", "options-note");
  button({ id: "btn-options", text: T("Open Options"), act: () => { click(); openMenu(); } });
  backButton(overlayBack);
}
