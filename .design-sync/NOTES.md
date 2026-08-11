# design-sync notes — React Foundation Design System (RFDS)

Repo-specific gotchas for future syncs. Read this before touching anything.

## Shape: `package`, not `storybook`

Auto-detection finds `.storybook/main.ts` and says `storybook`. **`cfg.shape` pins
`package` deliberately** — do not "fix" this.

- In the storybook shape the component roster comes *only* from story titles
  (`source-storybook.mjs` → `components: csfComponents`). This repo has 6 story
  files, so that shape would sync 6 components and drop the other 61.
- The package shape derives the roster from config (below) and covers all 67.

## There is no `dist/` and no `.d.ts` tree

RFDS is a barrel *inside* a Next.js app (`src/components/rfds/`), not a published
package. Consequences:

- `cfg.componentSrcMap` **is** the roster — it is generated, not hand-written.
  `.design-sync/gen-roster.mjs` walks the RFDS barrels with ts-morph, resolves
  every re-export back to its declaring file, and writes both `roster.json`
  (merged into `cfg.componentSrcMap`) and `ds-entry.ts` (the bundle entry).
  Re-run it after adding/removing an RFDS export.
- `--entry .design-sync/ds-entry.ts` is required. Without an explicit entry the
  converter synthesizes one from *every* `.tsx` under `src/`, which drags in the
  whole Next app (pages, server components, API routes).
- The entry uses explicit named re-exports, not `export *`: `Table` is exported
  from two barrels and ambiguous star-exports are silently dropped.
- **Renamed re-exports must keep their alias.** `primitives.ts` does
  `export { ThemeToggle as ThemeSegmentedControl }`; the declaring file only
  knows `ThemeToggle`, so the generator emits `export { ThemeToggle as
  ThemeSegmentedControl }`. Getting this wrong shows up as
  `[BUNDLE_EXPORT] ThemeSegmentedControl`.
- `exported PascalCase symbols: 0` in the build log is expected here (no `.d.ts`
  to scan). It is not an error.

## `process is not defined` — the one global that broke all 67

Several RFDS components transitively import app modules that read server config
at module scope (`NEXTAUTH_*`, `SHOPIFY_*`, `VERCEL_*`, `NEXT_*`). The converter
targets the browser and defines only `process.env.NODE_ENV`, so module init threw
`ReferenceError: process is not defined`. That killed the IIFE **before it
assigned `window.RFDS`**, so the symptom was all 67 previews blank plus
`[BUNDLE_EXPORT] 67/67`, not a handful of auth-related failures.

Fix: `.design-sync/process-shim.ts`, imported **first** from `ds-entry.ts` (ES
modules evaluate imports in source order, so it lands before any component
initializer). Keep that import first.

> **Underlying issue, not fixed here:** presentational RFDS components reach
> server configuration through their import graph. That is an app-architecture
> problem and out of scope for a design-system sync — but it is why the shim
> exists, and it will keep biting other consumers (tests, Storybook, RSC
> boundaries).

## CSS: Tailwind 4 must be pre-compiled

Rendered designs only receive `styles.css`'s `@import` closure and Tailwind
cannot run there. `.design-sync/build-css.mjs` compiles `src/app/globals.css`
(the canonical theme contract — `:root` HSL triples → `.dark` overrides →
`@theme` mappings) through postcss and writes `.design-sync/rfds.css`, which
`cfg.cssEntry` points at.

- `[CSS_FROM_STORYBOOK]` (the storybook shape's universal CSS catch-all) does
  **not** apply in the package shape — it is gated on `src.sbStatic`. Compiling
  here is the only source of CSS.
- **Known limitation:** the compiled CSS contains only utilities the app
  currently uses. A utility the design agent invents that the app never used
  will not exist. If that shows up, add a safelist (`@source inline(...)`) —
  see "Re-sync risks".

## Fonts: Geist, and nothing detects its absence

The app loads Geist via `next/font/google`, which defines `--font-geist-sans` /
`--font-geist-mono` at runtime. The bundle has neither, so the compiled CSS
referenced `var(--font-geist-sans)` with nothing defining it and shipped **zero
`@font-face`** — every design would silently render in Arial. `[FONT_MISSING]`
did **not** fire (the reference is a CSS var, not a family literal), and no
screenshot comparison can see it either, because both sides fall back the same.

Fix: `.design-sync/extract-fonts.mjs` lifts the 11 subsetted woff2 out of
`.next/static/media/` plus their real `@font-face` rules, writes
`.design-sync/fonts/` + `fonts.css` (both **committed** — `.next/` does not
survive a clone), and `build-css.mjs` prepends that stylesheet to the compiled
CSS. `unicode-range` is preserved, so Cyrillic/Vietnamese/Greek-ext subsets
still work and browsers fetch only what a page needs.

`build-css.mjs` exits 1 if `fonts.css` is missing — deliberately fatal, because
a warning here is invisible in the output.

## Grouping: `source-kit.mjs` is forked

`cfg.libOverrides` declares the fork. Upstream derives a component's group from
its source directory; this repo's `src/` is organized by app feature (`home/`,
`ris/`, `features/impact/`) and by an internal barrel dir (`components/rfds/`),
none of which is a design-system taxonomy. Worse, the dir-derived value is
load-bearing: `package-build.mjs` only lets a docs `category:` override a group
that is falsy/`general`/`misc`, so `home` and `rfds` silently beat the curated
categories — producing group names like `rfds` (meaningless; the whole DS is
RFDS) and `auth`.

The fork leaves `group = 'general'` and lets `category:` frontmatter decide.
Curated groups live in `GROUPS` in `.design-sync/gen-docs.mjs`:
Primitives, Forms, Semantic, Data Display, Commerce, Layout, Page Sections,
Identity. It warns on any roster component it does not assign.

## Docs

- `cfg.docsDir` points at generated `.design-sync/docs/` stubs, **not** the
  repo's `docs/`. Pointed at `docs/`, discovery bound developer documentation as
  component prompts (`ecosystem-libraries.md`, truncated 12921 → 8051 bytes).
  The repo's real design guidelines still ship via `guidelines/` (8 files).
- A doc file sitting next to a component source outranks `docsDir` discovery and
  takes the category down with it. `gen-docs.mjs` inlines such prose under our
  frontmatter and writes a `cfg.docsMap` pin (currently only `Timeline`, from
  `src/components/rfds/timeline.md`). This is automatic — do not hand-maintain
  `docsMap`.

## Broken thing found in the repo (not fixed)

`.storybook/main.ts` sets a hardcoded vite alias
`'@': '/Users/sethwebster/Development/react-foundation-store/src'` — a path that
**does not exist** on this machine (the repo lives at
`react/react-foundation/website`). Any `@/…` import in a story cannot resolve, so
Storybook is broken for everyone but whoever had that directory. Left alone
because the package shape does not use Storybook, but it should be fixed
independently (resolve from `import.meta.dirname`, not an absolute path).

## Reproducing a build

```sh
node .design-sync/gen-roster.mjs      # roster.json + ds-entry.ts
node .design-sync/gen-docs.mjs        # docs/ stubs + docsMap pins
node .design-sync/build-css.mjs       # rfds.css (needs fonts.css)
node .ds-sync/package-build.mjs --config .design-sync/config.json \
  --node-modules ./node_modules --entry .design-sync/ds-entry.ts --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```

The first three are `cfg.buildCmd`. A fresh clone also needs
`ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` (the forked
`source-kit.mjs` imports `ts-morph` by bare name) and the `.ds-sync` dep install.

## Known render warns

_(to be filled in as the preview pass triages them)_

## Re-sync risks

_(to be written at the end of the run)_
