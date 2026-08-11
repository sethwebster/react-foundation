## How to build with RFDS

RFDS is the React Foundation Design System — the real components from the
foundation's website, bundled as `window.RFDS`. Compose screens from these
components and style your own surrounding layout with Tailwind utilities bound to
the semantic tokens below.

### Setup

**No provider or theme wrapper is required.** Tokens are plain CSS custom
properties on `:root`, so any component renders correctly as soon as
`styles.css` is linked. Do not invent a `ThemeProvider` — RFDS does not export
one.

**Dark mode is a class, not a prop.** The dark variant is declared as
`@custom-variant dark (&:where(.dark, .dark *))`, so put `class="dark"` on a
wrapping element (or `<html>`) and every token flips. Never hand-write two colour
schemes — one `bg-card` is already correct in both themes.

```jsx
<div className="dark bg-background text-foreground">
  {/* everything here renders in dark mode */}
</div>
```

### Styling idiom: Tailwind utilities over semantic tokens

RFDS is a **utility-class** system. Components take `className`, and your own
layout glue is Tailwind. The rule that matters: **use the semantic token
utilities, never raw palette colours.** `bg-card` adapts to light and dark;
`bg-white` and `bg-blue-500` do not. Raw palette utilities exist in the compiled
CSS because the site still uses some — treat them as legacy, not as an example to
follow.

| Purpose | Utilities |
|---|---|
| Page / surface backgrounds | `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-surface`, `bg-surface-subtle`, `bg-surface-raised`, `bg-brand-soft` |
| Text | `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-text-strong`, `text-text-subtle` |
| Actions / accents | `bg-primary` + `text-primary-foreground`, `bg-secondary` + `text-secondary-foreground`, `bg-accent` + `text-accent-foreground` |
| Status | `bg-destructive` / `text-destructive`, `bg-success` / `text-success` (there is **no** `warning` colour token — do not use `bg-warning`) |
| Borders & focus | `border-border`, `border-border-strong`, `border-input`, `ring-ring`, `focus-visible:ring-2` |
| Radius | `rounded-control` (inputs/buttons), `rounded-card`, `rounded-panel`, plus `rounded-md…rounded-3xl`, `rounded-full` |
| Type scale | `text-xs…text-7xl`, plus the semantic `text-lead` and `text-title` |
| Fonts | `font-sans` (Geist), `font-mono` (Geist Mono) — both ship with the bundle |
| Weight | `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`, `font-black` |

Every `*-foreground` token is the paired text colour for its surface — use them
together (`bg-primary text-primary-foreground`), never a hand-picked contrast.

### Read the source of truth before styling

- `styles.css` and the `_ds_bundle.css` it imports — the actual compiled tokens
  and component styles. Grep here to confirm a utility exists before relying on
  it.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage and props.
- `components/<group>/<Name>/<Name>.d.ts` — the typed contract. Props listed
  above the "Standard element props" comment are the component's own API; the
  rest are standard HTML attributes passed through.
- `guidelines/` — the foundation's own written design guidance.

Components are grouped as **Primitives**, **Forms**, **Semantic**,
**Data Display**, **Commerce**, **Layout**, **Identity**, and **Page Sections**.
Prefer the **Semantic** components (`SemanticButton`, `SemanticCard`,
`SemanticBadge`, `SemanticAlert`, …) for themeable UI, and **Primitives**
(`Button`, `Pill`, `Input`, …) for finer control. **Page Sections** are
full-width composed blocks from the foundation's homepage — use them whole rather
than rebuilding their internals.

### An idiomatic example

```jsx
const { SemanticCard, Button, Pill, Separator } = window.RFDS;

<section className="bg-background text-foreground p-8">
  <div className="mx-auto flex max-w-3xl flex-col gap-6">
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-title font-semibold">Supported libraries</h2>
      <Pill>54 tracked</Pill>
    </div>

    <Separator />

    <SemanticCard className="flex flex-col gap-3 p-6">
      <h3 className="text-lg font-semibold">TanStack Query</h3>
      <p className="text-sm text-muted-foreground">
        Asynchronous state management for React, maintained with foundation support.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="sm">Sponsor</Button>
        <Button variant="ghost" size="sm">View methodology</Button>
      </div>
    </SemanticCard>
  </div>
</section>
```

`Button` accepts `variant` of `primary | secondary | tertiary | glass | ghost |
link` and `size` of `xs | sm | md | lg`. Check each component's `.d.ts` for its
own axis rather than assuming this one generalises.
