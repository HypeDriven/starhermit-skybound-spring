// The look of the rails, screens, HUD, tray, lesson bar and toasts: the
// browser build's styles.css, rewritten class-based in tools/ui-style.css and
// converted once with `starhermit css` into assets/ui-style.json (`npm run
// css`), registered at start with the light theme the runtime's own widgets
// (check boxes, selects, scroll bars) take. The old html.high-contrast palette
// is a token set applied while the runtime's high-contrast option is on.
import { files } from "starhermit:engine";
import * as ui from "starhermit:ui";

type Tokens = Record<string, string | number>;
let base: Tokens = {};
/** styles.css html.high-contrast. */
const HIGH_CONTRAST: Tokens = { ink: "#000000", inksoft: "#111111", panel: "#fffffffa", accent: "#00573f", focus: "#0000ff" };

export function initStyles(): void {
  const css = files.readJson("assets/ui-style.json") as unknown as ui.CssStyles;
  base = { ...(css.tokens as Tokens) };
  ui.setFont({ family: "sans-serif" });
  ui.setTheme({
    fontSize: 16, smallSize: 13.6, headingSize: 24, padding: 8, spacing: 8, radius: 12,
    text: "#1d2433", muted: "#48516a", panel: "#ffffff", control: "#ffffff", hovered: "#eef7f0",
    pressed: "#dcefe3", field: "#ffffff", accent: "#3f8f6e", focus: "#ffb020", outline: "#3f8f6e",
  });
  ui.setTokens(css.tokens);
  ui.setAnimations(css.animations);
  ui.setStyles({
    ...css.styles,
    label: { text: { color: "$ink" } },
    paragraph: { text: { color: "$ink" } },
    heading: { text: { color: "$ink" } },
    widget: { focusRing: { color: "#ffb020", width: 3, offset: 2 } },
    scrollArea: { parts: { bar: { background: "#48516a", radius: 4 } } },
    tooltip: { background: "#ffffff", text: { color: "$ink" }, radius: 6, padding: 6 },
  });
}

let hcKey: boolean | null = null;
/** The high-contrast tokens over the sheet's while the runtime's option is on. */
export function applyContrast(highContrast: boolean): void {
  if (hcKey === highContrast) return;
  hcKey = highContrast;
  ui.setTokens(highContrast ? { ...base, ...HIGH_CONTRAST } : base);
}
