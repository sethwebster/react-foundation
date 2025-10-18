# React Foundation Storefront — Working Session Notes

## Overview
- **Repository path:** `react-foundation-store/storefront`
- **Stack:** Next.js 15 (App Router, React 19), TypeScript, Tailwind v4 (inline tokens), Turbopack dev server
- **Goal:** Build a premium, revenue-driving storefront for the React Foundation with headless commerce capabilities (Shopify + Stripe planned)
- **Session status:** Hero-level wireframe implemented with placeholder assets, global styles tuned, image generation pipeline stubbed

## Current Implementation Snapshot
- `src/app/page.tsx`
  - Hero section with gradient backdrops, CTA buttons, feature badges
  - Navigation shell (logo, collection links, cart CTA)
  - “Signature Collections” grid populated via `collectionCards` array
  - “Limited Drops” section with featured drop + four tee tiles
  - Impact section highlighting Foundation outcomes
  - Footer with basic link placeholders
  - Uses `next/image` with PNG placeholders located in `public/placeholders`
- `src/app/globals.css`
  - Tailwind import
  - CSS variables for color/font tokens
  - Body/anchor baseline reset, box-sizing
- `scripts/generate-placeholders.cjs`
  - Uses `sharp` to rasterize SVG-based compositions into PNGs
  - Produces collection and drop placeholder images embedding the React logo (`public/react-logo.svg`)
- `public/placeholders/`
  - Generated PNGs (`collection-*.png`, `drop-fiber.png`, `drop-tee-0*.png`)
  - Intended to be replaced with higher-fidelity stock/GPT renders

## Local Setup & Commands
- Install dependencies: `npm install`
- Run dev server: `npm run dev` (Turbopack)
- Lint: `npm run lint`
- Generate placeholders (recreates PNGs): `node scripts/generate-placeholders.cjs`

## Outstanding Tasks & Ideas
1. **Asset Upgrades**
   - Replace generated PNG placeholders with GPT/stock renders showing actual apparel (e.g., React-logo tees, fiber jacket concept)
   - Maintain filenames or adjust `page.tsx` mappings if naming changes
2. **Component Architecture**
   - Break `page.tsx` into composable components (`Hero`, `CollectionsGrid`, `DropsHighlight`, `ImpactSection`, `Footer`)
   - Introduce shared UI primitives (button, tag, stat card) under `src/components/ui`
3. **Shopify Integration Prep**
   - Configure `.env` scaffolding and environment loader (e.g., `lib/config.ts`)
   - Create typed Storefront API clients, data fetch hooks for featured products and collections
4. **Checkout Flow**
   - Evaluate Shopify Checkout vs Stripe Payment Element for minimal-step flow
   - Prototype cart drawer state + summary panel
5. **Design Enhancements**
   - Add motion (Framer Motion or tailwind-based transitions) for hero CTAs and card entrances
   - Define responsive breakpoints and test small-screen layouts
6. **Content & CMS**
   - Plan CMS integration (Sanity/Contentful) for editorial blurb management
   - Wire hero narrative, stats, and testimonial copy to structured data
7. **Testing & Tooling**
   - Set up Playwright/Cypress scaffolding for cart + checkout flows
   - Add Vitest for component/unit coverage when components are extracted
8. **Deployment Considerations**
   - Configure Next.js image domains and caching strategy
   - Plan for Vercel deployment (edge caching, ISR settings)
9. **Accessibility & Performance**
   - Audit color contrast, focus states, skip links
   - Optimize background gradient implementation to reduce paint cost if needed

## Sandbox & Environment Notes
- Current CLI sandbox mode: `workspace-write` (limited network/filesystem). External asset generation via GPT requires switching to `danger-full-access` when relaunching the Codex CLI.
- If the session restarts, restate context and ensure `storefront` directory persists; run `npm install` to restore modules if needed.

## Suggested Next Steps After Relaunch
1. Decide on sandbox mode (default vs `danger-full-access`) depending on whether GPT image downloads are needed directly.
2. Generate/upload refined placeholder imagery into `public/placeholders/`.
3. Refactor `page.tsx` into components and begin wiring mock data providers to prepare for Shopify integration.
4. Draft checkout/cart architecture outline before implementing logic.
