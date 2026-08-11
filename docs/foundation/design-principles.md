# React Foundation — Design Principles

This document records the principles behind the public-site design pass. It
pairs the editorial direction seen in the reference frames with the structural
discipline of a developer-platform system (the "Vercel-inspired" DESIGN.md
guidance), expressed in React Foundation's own brand.

It complements `public-website-design-system.md` (the component/route map). This
file is the shorter "why", written as an audit checklist.

## The thesis

The site is a civic institution built by developers: calm, credible, open, and
human. We keep React's warmth (teal, photography, generous whitespace) and add
the restraint of an engineered system (one accent, one radius scale, one
elevation model, a mono technical voice). Restraint is the product.

## Ten principles

1. **One accent, ink-forward.** React teal (`--primary`, `#087ea4` light /
   `#58c4dc` dark) is the *only* action color. Everything else is ink and a
   deliberate gray scale. Status colors (`success`, `warning`, `destructive`)
   are for state, never decoration.

2. **A single radius system — four steps, no exceptions.**
   `field` 10px (inputs, chips, map legend) · `card` 16px (list + feature
   cards) · `panel` 24px (large editorial / map surfaces) · `control` pill
   (buttons). Raw Tailwind radii (`rounded-2xl`, `rounded-xl`, `rounded-lg`,
   arbitrary `rounded-[…]`) are banned on public surfaces.

3. **One elevation model: stacked, low-opacity, with an inset hairline ring.**
   Every raised surface uses `shadow-card` (resting), `shadow-raised` (hover),
   or `shadow-soft` (large panels / overlays). Each stacks an inset 1px ring
   with 1–2 soft offsets so surfaces *sit on* the page instead of floating on a
   single heavy drop shadow. Never a lone `shadow-lg`/`shadow-2xl`.

4. **Type is Geist; the technical voice is Geist Mono.** Display headings are
   Geist ≤ 600 weight, sentence case, with size-stepped negative tracking
   (`-0.02em` sections, `-0.03em` page titles). The hero headline keeps its
   terminal period. Section labels, numeric indices, dates, counts, and tier
   labels use the mono **eyebrow** (`.foundation-eyebrow` / the `<Eyebrow>`
   component): uppercase Geist Mono, 11px, `0.16em` tracking.

5. **One eyebrow, one heading rhythm.** Section intros are always
   `Eyebrow → heading → optional lead`. The two-column intro+list pattern uses a
   single ratio (`0.8fr / 1.2fr`). No more hand-written `text-sm font-semibold
   text-primary` labels scattered per page.

6. **Deliberate color, never opacity soup.** Text uses `foreground`,
   `muted-foreground`, and the `text-subtle`/`text-strong` roles — not ad-hoc
   `text-foreground/40…/82`. Surfaces use `surface` / `surface-subtle` /
   `surface-raised`, not `bg-muted/60`, `bg-background/[0.03]`, etc.

7. **One decorative gradient, hero scale only.** A quiet React-teal atmosphere
   (`.foundation-hero-glow`) sits behind hero bands. It is never miniaturized
   to a swatch and never repeated as section chrome. Whitespace — not
   gradients — separates sections.

8. **Borders do the grouping; cards are earned.** Thin `border` hairlines and
   `divide-y` lists carry most structure. A surface becomes a bordered card
   only when its content is a genuinely independent, grouped object (the
   executive letter, a news item, the map, the reporting-status panel).

9. **Consistent, generous vertical rhythm.** Large gaps between bands, tight
   stacks inside them. One shared content spine: header, page content, and
   footer all align to the `standard` measure; long-form prose narrows to the
   `reading` measure.

10. **Photography and the map are the visual anchors.** They carry warmth and
    proof; the chrome around them stays quiet. Media has fixed dimensions to
    avoid layout shift.

## Tokens added or corrected in this pass

- `--radius-field` (10px) added; `--radius-card` retuned 20px → 16px;
  `--radius-panel` retuned 28px → 24px.
- `--shadow-card` / `--shadow-raised` / `--shadow-soft` rewritten as stacked
  shadows with an inset hairline ring (light + dark recipes).
- `--warning` / `--warning-foreground` **added** (previously referenced by
  `pill.tsx` and the semantic components but undefined — a broken token).
- `--font-sans` / `--font-mono` mapped to Geist / Geist Mono so `font-mono`
  resolves to the brand mono face.
- CoIS tier colors promoted to tokens (`--map-tier-platinum` … `-default`) and
  shared by the map markers, the legend, and the directory tier badges — no
  more scattered hex.
- `.foundation-hero-glow` and `.foundation-eyebrow` utilities added.

## Audit checklist (use when adding public UI)

- [ ] Accent is teal only; status colors used only for state.
- [ ] Radius is one of `field` / `card` / `panel` / `control`.
- [ ] Elevation is `shadow-card` / `shadow-raised` / `shadow-soft` (+ border).
- [ ] Section label is an `<Eyebrow>` (mono), not a hand-rolled teal label.
- [ ] Text/surface colors are semantic tokens, not opacity variants.
- [ ] No second decorative gradient; hero glow only.
- [ ] New section aligns to the shared measure and vertical rhythm.
- [ ] `npx tsc --noEmit` clean; changed files lint clean.
