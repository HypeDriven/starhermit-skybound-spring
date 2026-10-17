// Skybound Spring — collects the English i18n keys the code and content show to players.
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
export const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const unq = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

/** Keys passed to T()/t(), status/action/screen labels and the caption/sync/state maps. */
export function codeKeys() {
  const keys = new Set();
  for (const f of ['src/ui.js', 'src/main.js', 'src/platform.js', 'src/render.js']) {
    const src = read(f);
    for (const re of [/\b[Tt]\('((?:[^'\\]|\\.)*)'/g, /setStatus\('((?:[^'\\]|\\.)*)'/g, /showScreen\('((?:[^'\\]|\\.)*)'/g, /\[\s*'((?:[^'\\]|\\.)*)',\s*\(\)\s*=>/g]) {
      for (const m of src.matchAll(re)) keys.add(unq(m[1]));
    }
    for (const name of ['STATE_LABELS', 'CAPTIONS', 'SYNC_LABELS', 'names']) {
      const block = src.match(new RegExp('const ' + name + ' = \\{([\\s\\S]*?)\\};'));
      if (block) for (const m of block[1].matchAll(/:\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(unq(m[1]));
    }
  }
  return keys;
}

export async function contentKeys() {
  const C = await import('../src/content.js');
  const R = await import('../src/rules.js');
  const keys = new Set();
  C.THEMES.forEach((t) => keys.add(t.name));
  C.CHALLENGES.forEach((c) => { keys.add(c.name); keys.add(c.description); });
  C.TUTORIALS.forEach((t) => { keys.add(t.name); t.steps.forEach((s) => keys.add(s.text)); });
  C.ACHIEVEMENTS.forEach((a) => { keys.add(a.name); keys.add(a.description); });
  Object.values(R.DIFFICULTY).forEach((d) => keys.add(d.label));
  return keys;
}


export async function usedKeys() { return new Set([...codeKeys(), ...(await contentKeys())]); }
