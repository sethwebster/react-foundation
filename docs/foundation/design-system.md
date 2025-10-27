# React Foundation Store Design System (RFDS)

The React Foundation Store Design System is a layered component architecture designed for composability, maintainability, and scalability.

## Philosophy

**Core Principles:**
1. **Small & Composable** - Components do one thing well
2. **Layered Architecture** - Clear separation between primitives, components, and features
3. **Consistent Namespace** - All components accessible via `RFDS.*`
4. **TypeScript-first** - Full type safety
5. **Variants-based** - Flexible styling through variant props

---

## Architecture Layers

### Layer 1: Primitives

**Location:** `src/components/ui/*`

Base-level, highly reusable building blocks. No business logic, minimal composition.

**Components:**
- `Button` / `ButtonLink` - Buttons with variants (primary, secondary, ghost, glass, link)
- `Pill` - Badge/tag component
- `Rating` - Star rating display
- `Collapsible` - Expandable/collapsible content wrapper
- `ScrollReveal` - Scroll-triggered animation wrapper

**Usage:**
```tsx
import { RFDS } from "@/components/rfds"

<RFDS.Button variant="primary" size="lg">
  Click me
</RFDS.Button>

<RFDS.Pill>New</RFDS.Pill>

<RFDS.Rating value={4.5} count={312} />
```

**Characteristics:**
- No data fetching
- No business logic
- Highly reusable
- Variant-based styling
- Minimal dependencies

---

### Layer 2: Components

**Location:** `src/components/ui/*` (composed components)

Composed from primitives, still reusable but more specific to domain.

**Components:**
- `ProductCard` - Product preview card (uses Button, Rating, Pill internally)
- `ProductGallery` - Image carousel with lightbox

**Usage:**
```tsx
import { RFDS } from "@/components/rfds"

<RFDS.ProductCard
  product={product}
  href="/products/fiber-shell"
/>

<RFDS.ProductGallery images={images} />
```

**Characteristics:**
- Composed from multiple primitives
- Domain-specific (products, collections)
- Still reusable across pages
- No data fetching (accepts props)

---

### Layer 3: Layouts

**Location:** `src/components/layout/*`

Page structure components.

**Components:**
- `Header` - Global navigation header (fixed, frosted glass)
- `Footer` - Site footer with links

**Usage:**
```tsx
import { RFDS } from "@/components/rfds"

<RFDS.Header />
<main>...</main>
<RFDS.Footer />
```

**Characteristics:**
- Control page structure
- Appear across multiple pages
- Minimal props (mostly self-contained)

---

### Layer 4: Features (Not in RFDS namespace)

**Location:** `src/features/*`

Complex, feature-specific components with business logic.

**Examples:**
- `MaintainerProgress` - GitHub contribution tracking
- `ImpactSection` - Foundation impact stats
- `SignInButton` - Authentication UI

**Usage:**
```tsx
// Import directly, not via RFDS
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress"

<MaintainerProgress />
```

**Characteristics:**
- Contains business logic
- May include custom hooks
- Feature-specific (not generic)
- Can fetch data

---

## Using the Design System

### Method 1: RFDS Namespace (Recommended)

```tsx
import { RFDS } from "@/components/rfds"

export function MyPage() {
  return (
    <div>
      <RFDS.Button variant="primary">
        Primary Action
      </RFDS.Button>

      <RFDS.Pill>New</RFDS.Pill>

      <RFDS.ProductCard product={product} href="/products/item" />
    </div>
  )
}
```

**Benefits:**
- Clear component origin
- Autocomplete-friendly
- Easy to discover available components
- Consistent import style

### Method 2: Direct Imports

```tsx
import { Button, Pill } from "@/components/rfds"

export function MyPage() {
  return (
    <div>
      <Button variant="primary">Primary Action</Button>
      <Pill>New</Pill>
    </div>
  )
}
```

**Benefits:**
- Shorter syntax
- Tree-shaking friendly
- Backwards compatible

### Method 3: Layer-specific Imports

```tsx
import { RFDS } from "@/components/rfds"

<RFDS.Primitives.Button variant="primary" />
<RFDS.Components.ProductCard product={product} />
<RFDS.Layouts.Header />
```

**Use case:** When you want to be explicit about component layers

---

## Component Reference

### Primitives

#### Button / ButtonLink

**Variants:** `primary`, `secondary`, `ghost`, `glass`, `link`
**Sizes:** `xs`, `sm`, `md`, `lg`

```tsx
<RFDS.Button variant="primary" size="lg">
  Primary Button
</RFDS.Button>

<RFDS.ButtonLink href="/collections" variant="secondary" size="md">
  Link Button
</RFDS.ButtonLink>
```

**Props:**
```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  // ... standard button props
}
```

---

#### Pill

Badge/tag component for labels.

```tsx
<RFDS.Pill>New</RFDS.Pill>
<RFDS.Pill tone="sky">Limited Edition</RFDS.Pill>
```

**Props:**
```typescript
type PillProps = {
  tone?: "sky" | "emerald" | "rose";
  className?: string;
  children: ReactNode;
}
```

---

#### Rating

Star rating display with React logo as stars.

```tsx
<RFDS.Rating value={4.8} count={312} size="md" />
```

**Props:**
```typescript
type RatingProps = {
  value: number; // 0-5
  count?: number; // Review count
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

---

#### Collapsible

Expandable/collapsible content with smooth animation.

```tsx
<RFDS.Collapsible trigger={<p>Click to expand</p>}>
  <p>Hidden content here</p>
</RFDS.Collapsible>
```

**Props:**
```typescript
type CollapsibleProps = {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}
```

---

#### ScrollReveal

Scroll-triggered animations (Apple-style).

```tsx
<RFDS.ScrollReveal animation="fade-up" delay={100}>
  <div>Content reveals on scroll</div>
</RFDS.ScrollReveal>
```

**Animations:** `fade`, `fade-up`, `fade-down`, `scale`, `slide-left`, `slide-right`

**Props:**
```typescript
type ScrollRevealProps = {
  children: ReactNode;
  animation?: "fade" | "fade-up" | "fade-down" | "scale" | "slide-left" | "slide-right";
  delay?: number; // milliseconds
  threshold?: number; // 0-1
  triggerOnce?: boolean;
}
```

---

### Components

#### ProductCard

Product preview card with image, name, price, rating.

```tsx
<RFDS.ProductCard
  product={product}
  href="/products/fiber-shell"
  ctaLabel="View product"
/>
```

**Props:**
```typescript
type ProductCardProps = {
  product: Product;
  href: string;
  ctaLabel?: string;
}
```

---

#### ProductGallery

Image carousel/lightbox for product detail pages.

```tsx
<RFDS.ProductGallery images={product.images} />
```

**Props:**
```typescript
type ProductGalleryProps = {
  images: ProductImage[];
}
```

---

### Layouts

#### Header

Global navigation header (fixed position, frosted glass).

```tsx
<RFDS.Header />
```

**Features:**
- Fixed position with blur effect
- React Foundation logo (links to home)
- Navigation links (Collections, Limited Drops, Impact)
- Sign in button
- Cart icon with count badge

---

#### Footer

Site footer with copyright and links.

```tsx
<RFDS.Footer />
```

**Features:**
- Copyright notice (auto-updates year)
- Legal links (Privacy, Terms, Accessibility)

---

## Styling System

### Design Tokens

All components use consistent design tokens:

**Colors:**
- Primary: Sky/Indigo/Purple gradients
- Secondary: Slate with glass effects
- Accent: Emerald (success), Rose (error), Amber (warning)

**Typography:**
- Font: Geist Sans (primary), Geist Mono (code)
- Scale: text-xs → text-5xl
- Tracking: 0.25em (labels), 0.3em (caps), 0.6em (hero)

**Spacing:**
- Scale: 0.5rem → 20rem (Tailwind default)
- Gap: 4-20 (between sections)

**Borders:**
- Radius: rounded-xl (cards), rounded-full (pills/buttons)
- Color: white/10 (default), white/20 (hover)

**Effects:**
- Blur: backdrop-blur-xl (glass)
- Shadow: shadow-lg shadow-black/20
- Transitions: duration-300 ease-in-out

---

## Variant System

### Button Variants

**Primary:**
```tsx
<RFDS.Button variant="primary">
  // Gradient background, bold, high-contrast
</RFDS.Button>
```

**Secondary:**
```tsx
<RFDS.Button variant="secondary">
  // Border, transparent background, glass effect
</RFDS.Button>
```

**Ghost:**
```tsx
<RFDS.Button variant="ghost">
  // Minimal, text-focused, subtle hover
</RFDS.Button>
```

**Glass:**
```tsx
<RFDS.Button variant="glass">
  // Frosted glass effect, blur
</RFDS.Button>
```

**Link:**
```tsx
<RFDS.Button variant="link">
  // Text-only, underline on hover
</RFDS.Button>
```

---

## Best Practices

### 1. Use RFDS Namespace

✅ **Good:**
```tsx
import { RFDS } from "@/components/rfds"
<RFDS.Button variant="primary">Click</RFDS.Button>
```

❌ **Avoid:**
```tsx
import { Button } from "@/components/ui/button"
<Button variant="primary">Click</Button>
```

### 2. Keep Components Small

When creating new components:
- Single responsibility
- Accept props, don't fetch data
- Compose from existing primitives
- Add to appropriate layer

### 3. Use Variants, Not Custom Styles

✅ **Good:**
```tsx
<RFDS.Button variant="ghost" size="sm">
  Small Action
</RFDS.Button>
```

❌ **Avoid:**
```tsx
<RFDS.Button className="px-2 py-1 text-xs bg-transparent">
  Small Action
</RFDS.Button>
```

### 4. Compose, Don't Duplicate

Build new components from existing ones:

```tsx
// Good - composes from primitives
export function DropCard({ drop }) {
  return (
    <div>
      <RFDS.Pill>{drop.season}</RFDS.Pill>
      <h3>{drop.title}</h3>
      <RFDS.ButtonLink href={`/collections/${drop.handle}`} variant="ghost">
        View drop
      </RFDS.ButtonLink>
    </div>
  )
}
```

---

## Adding New Components

### Step 1: Determine Layer

**Is it a primitive?**
- Single purpose
- No composition
- Highly reusable
→ Add to `src/components/ui/`

**Is it a component?**
- Composed from primitives
- Domain-specific
- Still reusable
→ Add to `src/components/ui/` or create new category

**Is it a feature?**
- Complex business logic
- Feature-specific
- Not generic
→ Add to `src/features/`

### Step 2: Create Component

Example: Adding a new `Badge` primitive

**Create file:** `src/components/ui/badge.tsx`
```tsx
interface BadgeProps {
  variant?: "default" | "success" | "error";
  children: ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  // Implementation
}
```

### Step 3: Add to RFDS

**Update:** `src/components/rfds/primitives.ts`
```tsx
export { Badge } from "@/components/ui/badge";

import { Badge } from "@/components/ui/badge";

export const Primitives = {
  // ... existing
  Badge,
};
```

**Update:** `src/components/rfds/index.ts`
```tsx
import { Badge } from "./primitives";

export const RFDS = {
  // ... existing primitives
  Badge,
};

export { Badge };
```

### Step 4: Document

Add to this file with usage examples and props.

---

## Current Components Inventory

### Primitives (6)
- ✅ Button / ButtonLink
- ✅ Pill
- ✅ Rating
- ✅ Collapsible
- ✅ ScrollReveal
- ⬜ Typography (planned)
- ⬜ Input (planned)
- ⬜ Select (planned)

### Components (2)
- ✅ ProductCard
- ✅ ProductGallery
- ⬜ CollectionCard (planned)
- ⬜ DropCard (planned)

### Layouts (2)
- ✅ Header
- ✅ Footer

---

## Roadmap

### v1.1 (Planned)
- [ ] Typography primitives (Heading, Text, Label)
- [ ] Form primitives (Input, Select, Checkbox, Radio)
- [ ] Card primitive (generic card component)
- [ ] CollectionCard component
- [ ] DropCard component

### v1.2 (Planned)
- [ ] Modal/Dialog primitive
- [ ] Tooltip primitive
- [ ] Dropdown menu primitive
- [ ] Tabs component
- [ ] Breadcrumbs component

### v2.0 (Future)
- [ ] Theme tokens (CSS variables)
- [ ] Dark/light mode toggle
- [ ] Accessibility audit
- [ ] Storybook integration
- [ ] Component unit tests

---

## Migration Guide

### Migrating Existing Code to RFDS

**Before:**
```tsx
import { Button, ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Rating } from "@/components/ui/rating";

export function MyComponent() {
  return (
    <div>
      <Button variant="primary">Click</Button>
      <ProductCard product={p} href="/products/x" />
      <Rating value={4.5} />
    </div>
  );
}
```

**After:**
```tsx
import { RFDS } from "@/components/rfds";

export function MyComponent() {
  return (
    <div>
      <RFDS.Button variant="primary">Click</RFDS.Button>
      <RFDS.ProductCard product={p} href="/products/x" />
      <RFDS.Rating value={4.5} />
    </div>
  );
}
```

**Steps:**
1. Replace individual imports with `import { RFDS } from "@/components/rfds"`
2. Prefix all component usage with `RFDS.`
3. Test that everything still works

---

## Examples

### Example 1: 404 Page (Primitives Only)

```tsx
import { RFDS } from "@/components/rfds";

export default function NotFound() {
  return (
    <main>
      <h1>Page Not Found</h1>

      <div>
        <RFDS.ButtonLink href="/" size="lg">
          Return to storefront
        </RFDS.ButtonLink>

        <RFDS.ButtonLink href="/collections" size="lg" variant="secondary">
          Explore collections
        </RFDS.ButtonLink>

        <RFDS.ButtonLink href="/#drops" size="lg" variant="ghost">
          View drops
        </RFDS.ButtonLink>
      </div>
    </main>
  );
}
```

### Example 2: Product List (Primitives + Components)

```tsx
import { RFDS } from "@/components/rfds";

export function ProductList({ products }) {
  return (
    <div>
      <RFDS.Pill>Featured</RFDS.Pill>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <RFDS.ProductCard
            key={product.slug}
            product={product}
            href={`/products/${product.slug}`}
          />
        ))}
      </div>

      <RFDS.ButtonLink href="/collections" variant="ghost">
        View all →
      </RFDS.ButtonLink>
    </div>
  );
}
```

### Example 3: Animated Section (Primitives + Scroll Effects)

```tsx
import { RFDS } from "@/components/rfds";

export function CollectionGrid({ collections }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {collections.map((collection, index) => (
        <RFDS.ScrollReveal key={collection.id} animation="fade-up" delay={index * 100}>
          <div className="rounded-2xl border border-white/10 p-6">
            <h3>{collection.title}</h3>
            <p>{collection.description}</p>
            <RFDS.ButtonLink href={`/collections/${collection.handle}`} variant="ghost">
              Shop the edit →
            </RFDS.ButtonLink>
          </div>
        </RFDS.ScrollReveal>
      ))}
    </div>
  );
}
```

---

## Naming Conventions

### Component Names
- PascalCase: `ProductCard`, `ButtonLink`
- Descriptive: `LimitedDrops` not `Drops`
- Noun-based: `Button` not `Clickable`

### Variants
- lowercase: `primary`, `secondary`
- Single word when possible: `ghost` not `ghost-button`
- Descriptive: `glass` (describes effect)

### Props
- camelCase: `homeFeatured`, `dropNumber`
- Boolean prefix: `is`, `has`, `should` (e.g., `isDrop`, `hasImage`)
- Event handlers: `on` prefix (e.g., `onClick`, `onChange`)

---

## File Structure

```
src/components/
├── rfds/
│   ├── index.ts          # Main RFDS export
│   ├── primitives.ts     # Primitive layer exports
│   ├── components.ts     # Component layer exports
│   └── layouts.ts        # Layout layer exports
│
├── ui/                   # Primitive components
│   ├── button.tsx
│   ├── pill.tsx
│   ├── rating.tsx
│   ├── collapsible.tsx
│   ├── scroll-reveal.tsx
│   ├── product-card.tsx  # Composed component
│   └── product-gallery.tsx
│
├── layout/               # Layout components
│   ├── header.tsx
│   └── footer.tsx
│
└── home/                 # Page-specific components
    ├── hero.tsx
    ├── featured-look.tsx
    └── ...

src/features/             # Feature modules (not in RFDS)
├── auth/
├── maintainer-progress/
└── impact/
```

---

## TypeScript Support

RFDS is fully typed. TypeScript will autocomplete all available components and their props:

```tsx
import { RFDS } from "@/components/rfds";

// TypeScript knows about all variants
<RFDS.Button variant="primary" | "secondary" | "ghost" | "glass" | "link" />

// Autocomplete for sizes
<RFDS.Button size="xs" | "sm" | "md" | "lg" />

// Type-safe props
<RFDS.ProductCard product={product} href={string} />
```

---

## Testing

Test components through the RFDS namespace:

```tsx
import { RFDS } from "@/components/rfds";
import { render, screen } from "@testing-library/react";

it("renders primary button", () => {
  render(<RFDS.Button variant="primary">Click</RFDS.Button>);
  expect(screen.getByText("Click")).toBeInTheDocument();
});
```

---

## Contributing

When adding new components to RFDS:

1. **Create component** in appropriate directory
2. **Add to layer file** (`primitives.ts`, `components.ts`, etc.)
3. **Add to main index** (`rfds/index.ts`)
4. **Document** in this file with examples
5. **Test** via RFDS namespace
6. **Update version** in header comment

---

## FAQ

**Q: Should I use RFDS namespace or direct imports?**
A: RFDS namespace is recommended for consistency, but direct imports work too.

**Q: Where do page-specific components go?**
A: Keep them in `src/components/home/`, `src/components/collections/`, etc. Only add to RFDS if reusable across multiple pages.

**Q: Can I add custom styles to RFDS components?**
A: Yes, via `className` prop. But prefer using variants when possible.

**Q: How do I add a new variant?**
A: Edit the component file (e.g., `button.tsx`), add to variants object, update TypeScript types.

---

*Last updated: October 2025*
*Design System Version: 1.0.0*
