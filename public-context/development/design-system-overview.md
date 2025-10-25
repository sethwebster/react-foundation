# React Foundation Design System (RFDS)

> **For Chatbot:** This document provides an overview of the React Foundation Design System architecture and philosophy.

## Overview

The React Foundation Design System (RFDS) is a layered component architecture that powers all React Foundation websites and applications.

**Goals:**
- **Consistency** - Same look and feel across all Foundation properties
- **Quality** - Premium components with attention to detail
- **Accessibility** - WCAG AA compliant
- **Performance** - Optimized for speed
- **Developer experience** - Easy to use and extend

## Philosophy

### Core Principles

**1. Small & Composable**
- Each component does one thing well
- Combine primitives to build complex UIs
- No monolithic components

**2. Layered Architecture**
- Clear separation: primitives → components → layouts → features
- Each layer builds on the previous
- Easy to understand and maintain

**3. Consistent Namespace**
- All components accessible via `RFDS.*`
- Single import statement
- Discoverable via autocomplete

**4. TypeScript-First**
- Full type safety
- IntelliSense support
- Compile-time error catching

**5. Variants-Based Styling**
- Predefined variants (primary, secondary, ghost, etc.)
- Consistent styling across components
- Easy to theme and customize

## Architecture Layers

### Layer 1: Primitives

**Base building blocks** - Buttons, badges, inputs

**Examples:**
- `RFDS.Button` - Button with variants
- `RFDS.Pill` - Badge/tag component
- `RFDS.Rating` - Star rating display

**Characteristics:**
- No business logic
- Highly reusable
- Minimal dependencies
- Variant-based styling

### Layer 2: Components

**Composed primitives** - Product cards, forms, galleries

**Examples:**
- `RFDS.ProductCard` - Uses Button + Rating + Pill
- `RFDS.ProductGallery` - Image carousel

**Characteristics:**
- Built from primitives
- Domain-specific (products, users, etc.)
- Still reusable across pages
- No data fetching (accept props)

### Layer 3: Layouts

**Page structure** - Headers, footers, page templates

**Examples:**
- `RFDS.Header` - Global navigation
- `RFDS.Footer` - Site footer

**Characteristics:**
- Control page structure
- Appear across multiple pages
- Minimal configuration needed

### Layer 4: Features (Not in RFDS)

**Business logic** - Authentication, tracking, integrations

**Examples:**
- `MaintainerProgress` - GitHub contribution tracking
- `ImpactSection` - Foundation impact stats
- `SignInButton` - Auth flow

**Characteristics:**
- Feature-specific
- Include custom hooks
- Can fetch data
- Not generic/reusable

## Semantic Theming

### Color System

**Never use hardcoded colors!** Always use semantic tokens:

```tsx
// ❌ WRONG
<div className="bg-blue-500 text-white border-gray-200">

// ✅ CORRECT
<div className="bg-primary text-primary-foreground border-border">
```

### Available Semantic Colors

**Backgrounds:**
- `bg-background` - Page background
- `bg-card` - Card/panel background
- `bg-muted` - Subtle backgrounds

**Text:**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text

**Interactive:**
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-accent` / `text-accent-foreground` - Accent elements

**Status:**
- `bg-destructive` - Errors, deletions
- `bg-success` - Success states
- `bg-warning` - Warnings

**Borders:**
- `border-border` - Default borders
- `border-primary` - Primary element borders

### Why Semantic?

- **Theme support** - Light/dark mode automatic
- **Consistency** - Same colors everywhere
- **Maintainability** - Change theme in one place
- **Accessibility** - Proper contrast ratios

## Component Examples

### Buttons

```tsx
<RFDS.Button variant="primary">Primary Action</RFDS.Button>
<RFDS.Button variant="secondary">Secondary</RFDS.Button>
<RFDS.Button variant="ghost">Ghost</RFDS.Button>
<RFDS.Button variant="glass">Glass Effect</RFDS.Button>
<RFDS.Button variant="link">Link Style</RFDS.Button>
```

**Sizes:**
- `size="sm"` - Small button
- `size="md"` - Default
- `size="lg"` - Large button

### Product Card

```tsx
<RFDS.ProductCard
  product={{
    title: "React Logo T-Shirt",
    price: 29.99,
    image: "/products/tshirt.jpg",
    rating: 4.5,
    reviewCount: 128
  }}
  href="/store/products/react-tshirt"
/>
```

**Features:**
- Hover effects
- Rating display
- Price formatting
- Responsive image
- Accessibility labels

### Badges & Pills

```tsx
<RFDS.Pill>New</RFDS.Pill>
<RFDS.Pill variant="success">In Stock</RFDS.Pill>
<RFDS.Pill variant="warning">Low Stock</RFDS.Pill>
<RFDS.Pill variant="destructive">Sold Out</RFDS.Pill>
```

## Accessibility

### Built-In Features

- **Keyboard navigation** - Tab order and focus management
- **Screen reader support** - ARIA labels and landmarks
- **Color contrast** - WCAG AA minimum
- **Focus indicators** - Visible focus rings
- **Semantic HTML** - Proper heading hierarchy

### Testing

All components tested with:
- **aXe** - Automated accessibility testing
- **Keyboard only** - Can navigate without mouse
- **Screen reader** - VoiceOver/NVDA compatible

## Responsive Design

### Breakpoints

```
Mobile:  < 640px   (sm)
Tablet:  640-1024px (md)
Desktop: > 1024px   (lg)
Wide:    > 1280px   (xl)
```

### Mobile-First

All components designed mobile-first:
- Default styles for mobile
- Progressively enhance for larger screens
- Touch-friendly hit targets (min 44x44px)

## Performance

### Optimizations

- **Code splitting** - Components lazy-loaded
- **Tree shaking** - Unused components removed
- **Minimal dependencies** - Keep bundle small
- **CSS-in-JS avoided** - Tailwind for performance

### Bundle Size

- **RFDS core**: ~15KB gzipped
- **Full system**: ~45KB gzipped (including all components)
- **Individual components**: 2-5KB each

## Using RFDS

### Installation

```tsx
// Single import for all components
import { RFDS } from "@/components/rfds"
```

### Basic Example

```tsx
export function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <RFDS.Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-6">
          Fall 2025 Drop
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map(product => (
            <RFDS.ProductCard
              key={product.id}
              product={product}
              href={`/store/products/${product.slug}`}
            />
          ))}
        </div>

        <RFDS.Button variant="primary" className="mt-8">
          Load More
        </RFDS.Button>
      </main>

      <RFDS.Footer />
    </div>
  );
}
```

## Theming

### Light & Dark Mode

RFDS supports automatic theme switching:

- **System preference** - Follows OS setting
- **Manual toggle** - User can override
- **Persistent** - Choice saved in localStorage
- **Instant** - No flash of wrong theme

### Semantic Components

Special themeable components:

```tsx
<RFDS.SemanticButton variant="primary">
  Uses semantic colors - adapts to theme
</RFDS.SemanticButton>

<RFDS.SemanticCard>
  Card with semantic background and borders
</RFDS.SemanticCard>

<RFDS.SemanticBadge variant="success">
  Status badge
</RFDS.SemanticBadge>
```

## Design Tokens

### Spacing

- `space-1` to `space-12` - Consistent spacing scale
- Based on 4px grid
- `gap-4`, `p-6`, `m-8` etc.

### Typography

**Font Family:**
- Sans: System font stack (optimized for each OS)
- Mono: For code examples

**Sizes:**
- `text-xs` to `text-9xl` - Full scale
- `font-normal`, `font-medium`, `font-bold`

### Shadows

- `shadow-sm` - Subtle
- `shadow-md` - Medium
- `shadow-lg` - Large
- `shadow-xl` - Extra large

## Best Practices

### Do's

✅ **Use semantic colors** - Never hardcode colors
✅ **Start with primitives** - Check RFDS before creating custom
✅ **Compose components** - Build complex from simple
✅ **Follow layers** - Primitives → Components → Layouts
✅ **Type everything** - Full TypeScript usage
✅ **Test accessibility** - Keyboard + screen reader

### Don'ts

❌ **Don't hardcode colors** - Use semantic tokens
❌ **Don't create from scratch** - Reuse existing components
❌ **Don't mix styling methods** - Stick to Tailwind
❌ **Don't skip accessibility** - Required for all components
❌ **Don't use `any`** - Proper TypeScript types

## Component Checklist

When creating new components:

- [ ] Uses semantic colors (no hardcoded)
- [ ] Proper TypeScript types
- [ ] Keyboard accessible
- [ ] Screen reader labels (aria-label, aria-describedby)
- [ ] Responsive (mobile-first)
- [ ] Focus indicators
- [ ] Proper HTML semantics (button vs div, etc.)
- [ ] Documented with examples

## Contributing to RFDS

### Adding Components

1. **Check if it exists** - Search RFDS first
2. **Determine layer** - Primitive, component, or layout?
3. **Build with existing** - Compose from current primitives
4. **Follow patterns** - Use variant-based props
5. **Add to namespace** - Export from `src/components/rfds/index.ts`
6. **Document** - Add usage examples

### Design Review

New components go through:
- **Code review** - TypeScript, accessibility, performance
- **Design review** - Consistency with existing components
- **Testing** - Keyboard, screen reader, responsive

## Related Topics

- [Tech Stack](./tech-stack.md)
- [Foundation Overview](../foundation/foundation-overview.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*

*For implementation details, see `/docs/foundation/DESIGN_SYSTEM.md` (internal)*
