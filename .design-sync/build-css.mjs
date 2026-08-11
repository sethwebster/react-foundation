// Compiles the app's Tailwind 4 entry (src/app/globals.css) into a static
// stylesheet for the design-sync bundle. Rendered designs only receive
// styles.css's @import closure — Tailwind cannot run in that browser — so the
// utilities have to be compiled ahead of time here.
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
// Wrapper entry: the app's globals.css plus a safelist. See css-entry.css.
const IN = resolve(ROOT, '.design-sync/css-entry.css');
const OUT = resolve(ROOT, '.design-sync/rfds.css');
const FONTS = resolve(ROOT, '.design-sync/fonts.css');

const result = await postcss([tailwind()]).process(readFileSync(IN, 'utf8'), { from: IN, to: OUT });

// The brand fonts are prepended, not appended: @font-face and the
// --font-geist-* definitions must be in place before the utility layer reads
// them. Hard failure rather than a warning — a missing font kit renders every
// design in a fallback face, and nothing downstream detects that (both sides
// of any comparison fall back the same way). See extract-fonts.mjs.
if (!existsSync(FONTS)) {
  console.error('[FONTS] .design-sync/fonts.css missing — run `node .design-sync/extract-fonts.mjs`.');
  process.exit(1);
}
const fonts = readFileSync(FONTS, 'utf8');
writeFileSync(OUT, `${fonts}\n${result.css}`);
console.error(`css: ${((fonts.length + result.css.length) / 1024).toFixed(0)} KB → .design-sync/rfds.css (incl. brand fonts)`);
