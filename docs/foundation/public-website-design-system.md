# React Foundation Website Design System

This document translates the five Figma prototype frames into a reusable visual
language for the public website. Frame `19:627` is the responsive Home reference;
the remaining frames are desktop route references.

## Prototype map

| Frame | Node | Route responsibility |
| --- | --- | --- |
| Mobile Home | `19:627` | Responsive behavior for `/` |
| Home | `6:908` | `/` |
| About | `17:349` | `/about` |
| News | `40:42` | `/updates` |
| Communities | `40:895` | `/communities` |

## Visual thesis

The site should feel like a civic institution built by developers: calm,
credible, open, and human. It uses editorial whitespace and near-black type for
authority, React teal for action, and community photography for warmth.

The system is intentionally restrained:

- one primary accent;
- one sans-serif family;
- white and cool-gray surfaces;
- thin borders instead of decorative chrome;
- rounded containers only when content is meaningfully grouped;
- generous vertical rhythm;
- photography and maps as the dominant visual moments.

## Design language

### Composition

- Public pages use a shared 64–72rem content frame.
- Reading-heavy content is constrained to roughly 40.5rem.
- Hero content is centered on About and Communities, and may be centered or
  left-aligned on Home depending on viewport.
- Sections are separated primarily with whitespace, not background gradients.
- Full-width visual moments such as the Home photo rail may escape the standard
  content measure.
- The mobile frame is a responsive expression of Home, not a separate route or
  component tree.

### Typography

- Geist remains the product typeface.
- Display headings use tight tracking, balanced wrapping, and a maximum of
  three lines.
- Body copy is neutral and direct. It explains mission, scope, or action rather
  than adding marketing flourish.
- Teal labels identify section purpose; they are not decorative eyebrow pills.
- Reading copy should use a comfortable line height and stay within the reading
  measure.

### Color

The canonical web token contract lives in `src/app/globals.css`.
`src/lib/theme-config.ts` mirrors literal values only for email rendering, where
CSS custom properties are unavailable.

| Role | Light reference | Dark reference | Token |
| --- | --- | --- | --- |
| Page canvas | `#ffffff` | `#16181d` | `background` |
| Strong text | `#23272f` | `#f5f6f7` | `foreground`, `text-strong` |
| Secondary text | `#525866` | `#b6bdc7` | `muted-foreground`, `text-subtle` |
| React action | `#087ea4` | `#58c4dc` | `primary` |
| Quiet surface | `#f8f9fa` family | `#1d2026` family | `surface-subtle` |
| Raised surface | `#ffffff` | `#20232a` | `surface-raised` |
| Standard border | `#dfe2e6` | `#383d46` | `border` |
| Strong border | cool gray | cool gray | `border-strong` |
| Teal wash | pale teal | deep teal | `brand-soft` |
| Map water | pale cyan | muted blue | `map-water` |

Status colors remain semantic and should not become page-decoration colors.

### Shape and elevation

- Controls use a full pill radius.
- Repeating list cards use a 20px radius.
- Large editorial or map panels use a 28px radius.
- Shadows are soft and low-contrast. Borders should do most of the grouping.
- Avoid nested rounded cards unless the inner object is independently
  interactive.

### Motion

- Keep the existing page entrance and scroll-reveal utilities, but use them
  selectively.
- Home may use a gentle horizontal photo-rail drift.
- Interactive surfaces may translate by 1–2px or strengthen their border on
  hover.
- Respect `prefers-reduced-motion`; content must never depend on animation to be
  understood.

## Existing components to reuse

These already cover the required behavior and should be restyled rather than
replaced:

| Existing component | Design-system responsibility |
| --- | --- |
| `Header` | Shared desktop navigation, theme control, authentication |
| `MobileMenu` | Responsive navigation drawer |
| `Footer` | Shared legal and secondary navigation |
| `Button` / `ButtonLink` | Primary, secondary, quiet, and text actions |
| `ThemeToggleWrapper` | Light/dark/system control |
| `ScrollReveal` | Restrained section entrances |
| `FoundationHero` | Home hero content source |
| `FoundingMembers` | Member-logo strip |
| `ExecutiveMessage` | About editorial letter |
| `BecomeContributor` | Contributor pathways |
| `CommunityStats` | Communities summary metrics |
| `CommunityMap` | Geographic visual anchor |
| `CommunityFilters` | Directory filtering |
| `CommunityList` | Community directory results |
| `CommunitySortDropdown` | Directory ordering |

## Components still needed

Build these only as pages are migrated. They are composition components, not a
new primitive library.

### Shared page composition

1. `PublicPageShell`
   - applies the header offset, page canvas, and shared footer;
   - owns the standard page gutter and content widths;
   - replaces route-local gradient blobs and repeated `pt-24` wrappers.

2. `PageIntro`
   - supports `center` and `start` alignment;
   - accepts title, description, optional label, and optional actions;
   - provides the Home, About, News, and Communities heading rhythm.

3. `Section`
   - standardizes vertical spacing and optional reading/wide measures;
   - should stay structurally simple rather than becoming a visual card.

4. `Surface`
   - variants: `plain`, `subtle`, `raised`;
   - sizes: card radius and panel radius;
   - used by the executive letter, news rows, and map container.

5. `StatRow`
   - compact number-and-label items;
   - used by Communities and future impact summaries.

### Route-specific compositions

6. `MemberPhotoRail`
   - responsive, overflow-safe photo strip;
   - preserves source image dimensions and reserves layout space;
   - Home only.

7. `NewsListItem`
   - date, title, summary, author, and full-row link target;
   - replaces route-local update card markup.

8. `CommunityMapPanel`
   - composes `CommunityStats`, `CommunityMap`, and the tier legend;
   - does not duplicate map behavior.

No new button, navigation, form, modal, animation, or card primitive is needed.

## Migration order

1. Apply the shared token contract.
2. Restyle `Header`, `MobileMenu`, `Button`, and `Footer`.
3. Add `PublicPageShell`, `PageIntro`, `Section`, and `Surface`.
4. Migrate Home and validate desktop/mobile parity.
5. Migrate About and News.
6. Migrate Communities without replacing its data or map behavior.
7. Remove obsolete route-local gradients and duplicated visual values only
   after every public route uses the new compositions.

## Guardrails

- Do not create a second responsive Home implementation.
- Do not turn every section into a card.
- Do not add another theme provider or token source.
- Do not introduce a new dependency for layout, color, or animation.
- Do not lazy-load the Home hero’s visible images.
- Give all media explicit dimensions or aspect ratios to avoid layout shift.
- Preserve keyboard order and accessible labels while changing visual layout.
