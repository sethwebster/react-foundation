# Checkpoints — React Foundation Storefront

## Auth & Maintainer Progress
- NextAuth GitHub OAuth flow is configured but `.env` currently has blank `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `NEXTAUTH_SECRET`. Re-populate with working values before restarting dev server.
- Maintainer Progress component fetches `/api/maintainer/progress` automatically after auth. API uses GitHub GraphQL — current `GITHUB_TOKEN` in `.env` is empty; must supply PAT with `read:user` and `public_repo` scopes.
- Maintainer repos tracked: `facebook/react`, `facebook/react-compiler`, `facebook/react-native`, `facebook/relay`, `facebook/jest`, `reactjs/react.dev`, `reactjs/rfcs`, `react-native-community/react-native-releases`.

## Catalog Assets & Metadata
- Each product now has five GPT image shots under `public/assets/products/<slug>/shot-1.png … shot-5.png`. `src/lib/products.json` references those with new `unlockTier` fields.
- Collection cards use GPT renders in `public/assets/collections/*.png`.
- Favicon files generated (`favicon.png`, `favicon.ico`, `favicon-16/32/192/256.png`, `favicon.svg`) and wired in `src/app/layout.tsx` icons array.

## Shopify Integration ✅
- Shopify credentials configured in `.env`:
  - `SHOPIFY_STORE_DOMAIN=xnrqbs-qb.myshopify.com`
  - `SHOPIFY_ADMIN_TOKEN` - for seeding products via Admin API
  - `SHOPIFY_STOREFRONT_TOKEN` - for fetching products in the app (needs to be set)
- **Seeding Script**: `scripts/seed-shopify-v2.mjs` created with features:
  - Automatic location detection
  - Product creation with images, variants, inventory
  - Metafield management for custom data (unlock_tier, features, highlights, specs, etc.)
  - Collection creation and product assignment
  - Dry-run mode for testing
  - Skip images option for faster testing
- **Helper Scripts**:
  - `scripts/get-shopify-location.mjs` - get location ID
  - `scripts/SHOPIFY_SETUP.md` - comprehensive setup guide
- **NPM Scripts**:
  - `npm run shopify:seed` - seed products to Shopify
  - `npm run shopify:seed:dry-run` - preview without changes
  - `npm run shopify:seed:no-images` - skip image uploads
  - `npm run shopify:location` - get location info
- **Storefront API Client**: `src/lib/shopify.ts` created for fetching products in the app
  - `getAllProducts()` - fetch all products with metafields
  - `getProductByHandle()` - fetch single product
  - `getProductsByCollection()` - fetch products from collection
- **Metafields**: Custom data stored under `react_foundation` namespace:
  - `unlock_tier`, `tagline`, `release_window`, `accent_gradient`
  - `rating`, `rating_count`, `features`, `highlights`, `specs`

## Shopify Integration - Status: ✅ COMPLETE

All 8 products successfully seeded to Shopify with:
- ✅ Product details (title, description, prices, inventory)
- ✅ Custom metafields (unlock_tier, features, highlights, specs, etc.)
- ✅ Product images (uploaded via staged uploads API)
- ✅ Collections (current-drop, past-drop)
- ✅ Proper status (ACTIVE/ARCHIVED based on availability)

**Available Commands:**
- `npm run shopify:verify` - Check products in Shopify
- `npm run shopify:upload-images` - Upload missing images
- `npm run shopify:fix-prices` - Fix product prices
- `npm run shopify:seed` - Re-seed all products

## Dynamic Shopify Integration - Status: ✅ LIVE & WORKING

**What's Live:**
- ✅ Website pulls products **exclusively from Shopify** in real-time
- ✅ Storefront API configured with public access token
- ✅ Shopify CDN images configured in Next.js
- ✅ Async server components for optimal performance
- ✅ No fallback data - Shopify is the single source of truth

**API Tokens Configured:**
- ✅ **Admin API**: `SHOPIFY_ADMIN_TOKEN` (for seeding/scripts)
- ✅ **Storefront API**: `SHOPIFY_STOREFRONT_TOKEN` (public token for website)

**Pages Using Shopify:**
- ✅ Homepage (`src/app/page.tsx`) - Products, collections, hero
- ✅ Collections page (`src/app/collections/page.tsx`) - All drop products
- ✅ Product detail pages (`src/app/products/[slug]/page.tsx`) - Individual products, related items

**Configuration:**
- ✅ `next.config.ts` - Shopify CDN hostname allowed
- ✅ `src/lib/products-shopify.ts` - Shopify-only product fetching (no fallback)
- ✅ `src/lib/shopify.ts` - Storefront API client
- ✅ All async server components for optimal performance

**Note on Inventory Warnings:**
- Warnings about `unauthenticated_read_product_inventory` scope are harmless
- Site works perfectly without it (shows inventory as 0)
- To show live inventory: Add that scope in Shopify admin → Storefront API

**Test Your Setup:**
```bash
npm run shopify:test-storefront  # Test API connection
```

## Outstanding Tasks
1. **Optional: Add inventory scope** - Enable `unauthenticated_read_product_inventory` in Shopify admin → Storefront API to show live stock levels (currently defaults to 0)
2. **Deploy storefront**: Deploy updated site to Vercel for production
3. Consider caching or persistence for maintainer progress stats (currently call GitHub on demand)
4. Fix lint errors from legacy `scripts/generate-placeholders.cjs` using `require`

## Notes
- Running scripts require Node 16+, `sharp`, and ImageMagick (already installed).
- Dev server was stopped earlier (port 3000). After restart, ensure `.next/cache/images` stays cleared for new assets.
- MaintainerProgress layout lives inside `MaintainerProgressProvider` in `src/app/page.tsx`.
