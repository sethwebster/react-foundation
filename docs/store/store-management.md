# React Foundation Store Management Guide

Complete guide for managing the React Foundation Shopify store, including metafields, drops, collections, and products.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Initial Setup](#initial-setup)
3. [Metafield Taxonomy](#metafield-taxonomy)
4. [Drop Management](#drop-management)
5. [Product Management](#product-management)
6. [Collection Types](#collection-types)
7. [Management Scripts](#management-scripts)
8. [Daily Workflows](#daily-workflows)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture

The React Foundation Store is built on:

- **Shopify CMS** for content and inventory management
- **Next.js 15** App Router for the frontend
- **Shopify Storefront API** for public product/collection data
- **Shopify Admin API** for management operations
- **Custom Metafields** for extended taxonomy

### Key Concepts

**Drop Collections**: Time-limited releases with automatic status transitions based on dates
- Each drop is a Shopify collection with metafields
- Status (`current`, `upcoming`, `past`) is calculated from dates - not stored
- Products belong to drop collections

**Perennial Collections**: Always-available collections (essentials, apparel, accessories, drinkware)

**Metafields**: Custom data fields in the `react_foundation` namespace that extend Shopify's default fields

---

## Initial Setup

### 1. Environment Configuration

Create a `.env` file with these variables:

```bash
# Shopify Storefront API (for frontend)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxx

# Shopify Admin API (for management scripts)
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx

# OpenAI (for collection image generation)
OPENAI_API_KEY=sk-xxxxx

# GitHub (for contributor tracking)
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GITHUB_TOKEN=ghp_xxxxx
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=http://localhost:3000  # Use production URL (e.g., https://yourdomain.com) when deployed
```

### 2. API Tokens

**Storefront API Token:**
1. Shopify Admin → Apps → Develop apps
2. Create app: "React Foundation Storefront"
3. Configure Storefront API scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory` (for quantity data)
4. Install app and copy Storefront access token

**Admin API Token:**
1. Same app or create "React Foundation Admin"
2. Configure Admin API scopes:
   - `read_products`
   - `write_products`
   - `read_collections`
   - `write_collections`
   - `read_files`
   - `write_files`
3. Install and copy Admin API access token

### 3. Create Metafield Definitions

Run this ONCE to create all metafield definitions:

```bash
npm run shopify:setup-metafields
```

This creates 12 product metafields + 14 collection metafields in the `react_foundation` namespace.

### 4. Enable Storefront Access

**Critical step:**

1. Go to Shopify Admin → Settings → Custom data
2. Click on each metafield definition
3. Scroll to "Storefront access"
4. Check "Expose via Storefront API"
5. Save

Repeat for ALL metafields. Without this, the frontend won't see metafield data.

---

## Metafield Taxonomy

All custom metafields use the `react_foundation` namespace.

### Collection Metafields (14 total)

| Metafield Key | Type | Description | Example |
|--------------|------|-------------|---------|
| `is_drop` | boolean | Marks collection as time-limited drop | `true` |
| `drop_number` | number_integer | Sequential drop number | `8` |
| `drop_start_date` | date | When drop goes live | `2025-10-01` |
| `drop_end_date` | date | When drop ends | `2025-11-30` |
| `drop_season` | single_line_text | Season identifier | `Fall`, `Winter`, `Spring`, `Summer` |
| `drop_year` | number_integer | Year of drop | `2025` |
| `drop_theme` | single_line_text | Theme name | `Ocean Breeze`, `Neon Pulse` |
| `limited_edition_size` | number_integer | Total units in drop | `500` |
| `is_perennial` | boolean | Always-available collection | `true` |
| `collection_type` | single_line_text | Category | `essentials`, `apparel`, `accessories`, `drinkware` |
| `home_featured` | boolean | Show in Signature Collections | `true` |
| `home_featured_order` | number_integer | Order in featured (1-3) | `1` |
| `accent_gradient` | single_line_text | Tailwind gradient classes | `from-sky-400 via-indigo-500 to-purple-500` |
| `time_limited` | boolean | Non-drop time-limited collection | `true` |

### Product Metafields (12 total)

| Metafield Key | Type | Description | Example |
|--------------|------|-------------|---------|
| `is_hero` | boolean | Mark as home page hero | `true` |
| `featured_look_order` | number_integer | Order in Featured Look (1-3) | `1` |
| `unlock_tier` | single_line_text | Required tier | `contributor`, `sustainer`, `core` |
| `tagline` | single_line_text | Short tagline | `Built for the ecosystem` |
| `release_window` | single_line_text | Release description | `Drop 08 · Fall 2025` |
| `accent_gradient` | single_line_text | Tailwind gradient | `from-emerald-400 to-cyan-500` |
| `rating` | number_decimal | Product rating (0-5) | `4.7` |
| `rating_count` | number_integer | Number of reviews | `142` |
| `features` | json | Product features array | `["Premium cotton", "Unisex fit"]` |
| `highlights` | json | Impact highlights array | `["Funds 3 maintainers"]` |
| `specs` | json | Spec objects array | `[{"label":"Fit","value":"Unisex"}]` |
| `is_perennial` | boolean | Always-available product | `true` |

---

## Drop Management

### Creating a New Drop

Use the CLI script to create a drop collection:

```bash
npm run drops:create 8 Fall 2025 "Neon Pulse"
```

This creates a collection with:
- Handle: `drop-08-fall-2025`
- Title: `Drop 08 · Fall 2025`
- Theme: `Neon Pulse`
- Metafields populated

### Configuring Drop Dates

**In Shopify Admin:**

1. Go to Products → Collections
2. Find your drop (e.g., "Drop 08 · Fall 2025")
3. Scroll to Metafields → react_foundation
4. Set `drop_start_date`: When drop goes live (e.g., `2025-10-01`)
5. Set `drop_end_date`: When drop ends (e.g., `2025-11-30`)
6. Save

**Status is automatic:**
- Before `drop_start_date` → `upcoming`
- Between dates → `current`
- After `drop_end_date` → `past`

No manual status changes needed!

### Listing All Drops

Check current drop statuses:

```bash
npm run drops:list
```

Shows:
- Current drops (live now)
- Upcoming drops (scheduled)
- Past drops (ended)

### Drop Lifecycle

```
CREATE → UPCOMING → CURRENT → PAST
         ↑          ↑          ↑
     start_date  (active)  end_date
```

**Example Timeline:**
- Created: Sep 15, 2025
- Start date: Oct 1, 2025 → becomes `current`
- End date: Nov 30, 2025 → becomes `past`
- Products remain available but drop is archived

---

## Product Management

### Adding Products to a Drop

**In Shopify Admin:**

1. Products → Add product
2. Fill basic info (title, description, price, images)
3. Add to drop collection:
   - Scroll to Product organization
   - Collections → Select your drop
4. Set metafields:
   - `tagline`: Short description for cards
   - `release_window`: "Drop 08 · Fall 2025"
   - `accent_gradient`: Tailwind classes
   - `rating`: 0-5 (or leave empty for "No reviews yet")
   - `rating_count`: Number of reviews
   - `features`: JSON array of features
   - `highlights`: JSON array of impact highlights
   - `specs`: JSON array like `[{"label":"Material","value":"100% cotton"}]`
5. Set variants and inventory

### Example Product Metafield Values

**Tagline:**
```
Built for React developers who ship fast
```

**Release Window:**
```
Drop 08 · Fall 2025
```

**Accent Gradient:**
```
from-cyan-400 via-blue-500 to-purple-600
```

**Features (JSON):**
```json
[
  "Premium heavyweight cotton blend",
  "Unisex relaxed fit",
  "Screen-printed React logo",
  "Reinforced double stitching"
]
```

**Highlights (JSON):**
```json
[
  "Supports 3 ecosystem maintainers",
  "Carbon-neutral production",
  "Limited to 500 units"
]
```

**Specs (JSON):**
```json
[
  {"label": "Fit", "value": "Unisex"},
  {"label": "Material", "value": "100% organic cotton"},
  {"label": "Weight", "value": "350gsm heavyweight"},
  {"label": "Care", "value": "Machine wash cold"}
]
```

### Inventory Management

**Print-on-demand products:**
- Set `quantityAvailable`: 9999 (or >= 999)
- Frontend shows: "In stock · Made to order"

**Limited stock:**
- Set actual quantity
- Frontend shows:
  - 0 units: "Sold out · Check back soon"
  - 1-5 units: "Low stock · Only X left"
  - 6+ units: "In stock · X available"

**Backordered:**
- Set `availability`: `backordered`
- Frontend shows: "Backordered · X on backorder" or "Accepting preorders"

---

## Collection Types

### Drop Collections

**Characteristics:**
- `is_drop`: `true`
- Has `drop_number`, `drop_season`, `drop_year`, `drop_theme`
- Has `drop_start_date` and `drop_end_date`
- Time-limited availability
- Status calculated from dates

**Handle format:**
```
drop-08-fall-2025
drop-09-winter-2026
```

### Perennial Collections

**Characteristics:**
- `is_perennial`: `true`
- `collection_type`: `essentials`, `apparel`, `accessories`, or `drinkware`
- No start/end dates
- Always available

**Examples:**
- React Foundation Essentials
- Core Apparel Collection
- Developer Accessories

### Featured Collections

**To feature on home page:**
1. Set `home_featured`: `true`
2. Set `home_featured_order`: `1`, `2`, or `3`
3. Add a collection image
4. Set `accent_gradient` for theming

---

## Management Scripts

### Setup & Cleanup

**Create metafield definitions:**
```bash
npm run shopify:setup-metafields
```
Run once per store.

**Clean up obsolete metafields:**
```bash
npm run shopify:cleanup-metafields
```
Removes deprecated fields.

### Drop Management

**Create new drop:**
```bash
npm run drops:create <number> <season> <year> <theme>

# Examples:
npm run drops:create 8 Fall 2025 "Neon Pulse"
npm run drops:create 9 Winter 2026 "Arctic Code"
```

**List all drops:**
```bash
npm run drops:list
```
Shows current, upcoming, and past drops with status.

### Collection Images

**Generate AI collection images:**
```bash
# Generate for collections missing images
npm run collections:generate-images

# Generate for specific collection
npm run collections:generate-images drop-08-fall-2025

# Force regenerate (replace existing)
npm run collections:generate-images --force

# Skip cache (fresh AI generation)
npm run collections:generate-images --skip-cache

# Add custom styling instructions
npm run collections:generate-images drop-08-fall-2025 --desc="Dark moody lighting, concrete background"

# Combine flags
npm run collections:generate-images --force --skip-cache
```

**How it works:**
1. Fetches collection metadata and products
2. Analyzes product images with GPT-5 Vision (cached)
3. Generates collection banner with gpt-image-1
4. Uploads to Shopify via staged upload

**Caching:**
- Vision analysis cached in `.cache/vision-{handle}.json`
- Generated images cached in `.cache/generated-image-{handle}.json`
- Use `--skip-cache` to regenerate from scratch

### Product Management

**Verify Shopify products:**
```bash
npm run shopify:verify
```

**Check product media:**
```bash
npm run shopify:check-media
```

**Fix product prices:**
```bash
npm run shopify:fix-prices
```

**Test Storefront API:**
```bash
npm run shopify:test-storefront
```

---

## Daily Workflows

### Creating a New Drop

1. **Plan the drop:**
   - Choose drop number (sequential)
   - Select season and year
   - Create theme name

2. **Create collection:**
   ```bash
   npm run drops:create 8 Fall 2025 "Neon Pulse"
   ```

3. **Configure in Shopify:**
   - Set `drop_start_date` and `drop_end_date`
   - Set `limited_edition_size` (optional)
   - Add description
   - Upload or generate collection image

4. **Add products:**
   - Create products in Shopify
   - Add to drop collection
   - Fill metafields (tagline, features, specs, etc.)
   - Upload product images

5. **Generate collection image** (if needed):
   ```bash
   npm run collections:generate-images drop-08-fall-2025
   ```

6. **Verify on frontend:**
   ```bash
   npm run dev
   ```
   - Check home page shows drop correctly
   - Visit `/collections/drop-08-fall-2025`
   - Test product detail pages

### Transitioning Drops

**No manual work needed!**

- Drops automatically transition based on dates
- `upcoming` → `current` at `drop_start_date`
- `current` → `past` at `drop_end_date`

Just make sure dates are set correctly.

### Adding Products to Existing Collection

1. Shopify Admin → Products → Add product
2. Basic info (title, description, price)
3. Add to collection
4. Fill metafields
5. Upload images
6. Set inventory

### Updating Product Inventory

1. Shopify Admin → Products → [Product name]
2. Scroll to Variants
3. Update quantity
4. Frontend updates automatically:
   - >= 999: "Made to order"
   - 6+: "X available"
   - 1-5: "Only X left"
   - 0: "Sold out"

### Featuring Collections on Home

1. Edit collection in Shopify Admin
2. Set `home_featured`: `true`
3. Set `home_featured_order`: `1`, `2`, or `3`
4. Ensure collection has image
5. Set `accent_gradient` for theming

---

## Troubleshooting

### Metafields Not Showing on Frontend

**Problem:** All metafields return `null` from GraphQL

**Solution:**
1. Go to Settings → Custom data
2. Click each metafield definition
3. Enable "Storefront access"
4. If already enabled, regenerate Storefront API token:
   - Apps → [Your app] → API credentials
   - Regenerate Storefront access token
   - Update `.env` with new token
   - Restart dev server

### Inventory Showing 0 Despite Setting Quantity

**Problem:** `quantityAvailable` returns 0 from Storefront API

**Solution:**
1. Verify Storefront API has `unauthenticated_read_product_inventory` scope
2. Regenerate Storefront token after enabling scope
3. Update `.env` with new token
4. Clear Next.js cache: `rm -rf .next && npm run dev`

### Drop Not Showing as Current

**Problem:** Drop has `drop_start_date` in past but showing as `upcoming`

**Check:**
1. Date format is `YYYY-MM-DD` (e.g., `2025-10-01`)
2. Metafield type is `date` (not `single_line_text_field`)
3. Timezone - status uses UTC comparison

**Debug:**
```bash
npm run drops:list
```
Shows calculated status for all drops.

### AI Image Generation Not Using Actual Products

**Problem:** Generated images show generic products, not collection items

**Cause:** GPT-5 Vision timeout downloading Shopify CDN images

**Workarounds:**
1. Use `--desc` flag with specific instructions:
   ```bash
   npm run collections:generate-images drop-08-fall-2025 --desc="Teal hoodie with black sleeves, React logo t-shirt"
   ```

2. Upload custom collection images manually:
   - Create composite of real product photos
   - Upload via Shopify Admin → Collections

3. Check image URLs are publicly accessible:
   ```bash
   curl -I https://cdn.shopify.com/s/files/1/...
   ```

### Boolean Metafields Not Parsing

**Problem:** `is_drop` or `is_perennial` coming through as `null`

**Cause:** Shopify returns capital `"True"` (not lowercase)

**Fix:** Already handled in code with `.toLowerCase() === 'true'`

If still broken, check:
1. Metafield type is `boolean` (not `single_line_text_field`)
2. Value is set to `true` in Shopify (checkbox checked)

### Product Images Not Loading

**Problem:** Images show broken on frontend

**Check:**
1. Images uploaded to Shopify product
2. Images published (not draft)
3. Image URLs accessible:
   ```bash
   curl -I [image-url]
   ```
   Should return `200 OK`

### Collection Status Wrong

**Problem:** Drop showing `past` but should be `current`

**Debug:**
1. Check dates in Shopify Admin
2. Verify date metafields are type `date` (not text)
3. Check server time vs UTC:
   ```bash
   node -e "console.log(new Date())"
   ```
4. List drops to see calculated status:
   ```bash
   npm run drops:list
   ```

---

## Additional Resources

### File Structure

```
storefront/
├── .cache/                    # AI generation cache (gitignored)
├── docs/                      # Documentation
│   └── STORE_MANAGEMENT.md
├── scripts/                   # Management scripts
│   ├── shopify-setup-metafields.mjs
│   ├── shopify-create-drop.mjs
│   ├── shopify-list-drops.mjs
│   ├── shopify-cleanup-metafields.mjs
│   └── generate-collection-images.mjs
├── src/
│   ├── lib/
│   │   ├── shopify.ts         # Shopify GraphQL client
│   │   ├── products-shopify.ts # Product data layer
│   │   └── products.ts        # Product types & utilities
│   └── app/
│       ├── page.tsx           # Home page
│       ├── collections/[handle]/page.tsx
│       └── products/[slug]/page.tsx
└── .env                       # Environment config
```

### Key Files

**`src/lib/shopify.ts`:**
- Shopify GraphQL queries
- Collection and product fetching
- `getDropStatus()` - calculates drop status from dates
- `getAllCollections()`, `getAllProducts()`

**`src/lib/products.ts`:**
- Product types and interfaces
- `getInventorySummary()` - inventory display logic
- Availability formatting

**`src/lib/products-shopify.ts`:**
- Maps Shopify data to Product type
- Integrates with frontend components

### GraphQL Queries

**Fetch collections with metafields:**
```graphql
query {
  collections(first: 50) {
    edges {
      node {
        id
        handle
        title
        description
        image { url }
        isDrop: metafield(namespace: "react_foundation", key: "is_drop") { value }
        dropNumber: metafield(namespace: "react_foundation", key: "drop_number") { value }
        dropStartDate: metafield(namespace: "react_foundation", key: "drop_start_date") { value }
        dropEndDate: metafield(namespace: "react_foundation", key: "drop_end_date") { value }
      }
    }
  }
}
```

**Fetch products with metafields:**
```graphql
query {
  products(first: 50) {
    edges {
      node {
        id
        handle
        title
        description
        tagline: metafield(namespace: "react_foundation", key: "tagline") { value }
        rating: metafield(namespace: "react_foundation", key: "rating") { value }
        features: metafield(namespace: "react_foundation", key: "features") { value }
      }
    }
  }
}
```

### Status Calculation Logic

From `src/lib/shopify.ts`:

```typescript
export function getDropStatus(collection: ShopifyCollection): "current" | "upcoming" | "past" | null {
  if (!collection.isDrop) return null;

  const now = new Date();
  const startDate = collection.dropStartDate ? new Date(collection.dropStartDate) : null;
  const endDate = collection.dropEndDate ? new Date(collection.dropEndDate) : null;

  if (!startDate && !endDate) return 'current';
  if (startDate && now < startDate) return 'upcoming';
  if (endDate && now > endDate) return 'past';
  return 'current';
}
```

**Key points:**
- No dates = `current` (assume live)
- Before `startDate` = `upcoming`
- After `endDate` = `past`
- Between dates = `current`

---

## Summary

### Quick Reference

**Create a drop:**
```bash
npm run drops:create 8 Fall 2025 "Theme Name"
```

**List drops:**
```bash
npm run drops:list
```

**Generate collection images:**
```bash
npm run collections:generate-images
npm run collections:generate-images drop-08-fall-2025 --force
```

**Setup metafields** (one-time):
```bash
npm run shopify:setup-metafields
```

### Important Reminders

1. **Enable Storefront access** for all metafields in Shopify Admin
2. **Drop status is automatic** - just set dates correctly
3. **Inventory >= 999** shows as "Made to order"
4. **Rating count = 0** shows "No reviews yet" (no stars)
5. **Cache is in `.cache/`** - add to `.gitignore`
6. **Boolean metafields** need `.toLowerCase() === 'true'`

### Support

For issues or questions:
- Check this guide first
- Review [Troubleshooting](#troubleshooting) section
- Check script output for error messages
- Verify API tokens and scopes
- Test with `npm run shopify:test-storefront`

---

**Last Updated:** October 2025
**Shopify API Version:** 2024-10
**Next.js Version:** 15.5+
