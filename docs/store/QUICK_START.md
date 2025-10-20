# Quick Start Guide

Fast reference for common React Foundation Store tasks.

---

## Setup (First Time Only)

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxx
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
OPENAI_API_KEY=sk-xxxxx
```

### 2. Create Metafield Definitions

```bash
npm run shopify:setup-metafields
```

### 3. Enable Storefront Access

In Shopify Admin:
1. Settings → Custom data
2. For EACH metafield → Enable "Storefront access"

---

## Daily Tasks

### Create a New Drop

```bash
# Syntax: drops:create <number> <season> <year> <theme>
npm run drops:create 8 Fall 2025 "Neon Pulse"
```

Then in Shopify Admin:
1. Go to collection "Drop 08 · Fall 2025"
2. Set `drop_start_date`: `2025-10-01`
3. Set `drop_end_date`: `2025-11-30`
4. Save

**Status transitions automatically:**
- Before start date → `upcoming`
- Between dates → `current`
- After end date → `past`

### Add Product to Drop

In Shopify Admin:
1. Products → Add product
2. Fill title, description, price
3. Add to drop collection
4. Set metafields:
   - `tagline`: "Built for React developers"
   - `release_window`: "Drop 08 · Fall 2025"
   - `features`: `["Premium cotton", "Unisex fit"]`
   - `specs`: `[{"label":"Fit","value":"Unisex"}]`
5. Upload images
6. Set inventory

### Generate Collection Image

```bash
# For specific collection
npm run collections:generate-images drop-08-fall-2025

# For all collections missing images
npm run collections:generate-images

# Force replace existing
npm run collections:generate-images --force

# With custom styling
npm run collections:generate-images drop-08-fall-2025 --desc="Dark moody lighting"
```

### Check Drop Status

```bash
npm run drops:list
```

Shows all drops grouped by status:
- 🟢 Current
- 🟡 Upcoming
- ⚫ Past

---

## Common Metafield Values

### Collection (Drop)

```
is_drop: true
drop_number: 8
drop_start_date: 2025-10-01
drop_end_date: 2025-11-30
drop_season: Fall
drop_year: 2025
drop_theme: Neon Pulse
accent_gradient: from-cyan-400 via-blue-500 to-purple-600
```

### Product

```
tagline: Built for the React ecosystem
release_window: Drop 08 · Fall 2025
rating: 4.7
rating_count: 142
accent_gradient: from-emerald-400 to-cyan-500

features: ["Premium heavyweight cotton", "Unisex relaxed fit", "Screen-printed logo"]

highlights: ["Supports 3 maintainers", "Carbon-neutral production", "Limited to 500 units"]

specs: [
  {"label": "Fit", "value": "Unisex"},
  {"label": "Material", "value": "100% organic cotton"},
  {"label": "Weight", "value": "350gsm"}
]
```

---

## Inventory Display Rules

The frontend automatically shows inventory status:

| Quantity | Display |
|----------|---------|
| >= 999 | "In stock · Made to order" |
| 6-998 | "In stock · X available" |
| 1-5 | "Low stock · Only X left" |
| 0 | "Sold out · Check back soon" |

**For print-on-demand:** Set quantity to 9999

---

## Troubleshooting

### Metafields showing null

1. Settings → Custom data
2. Each metafield → Enable "Storefront access"
3. Regenerate Storefront API token
4. Update `.env`
5. Restart: `rm -rf .next && npm run dev`

### Inventory showing 0

1. Verify Storefront API scope includes `unauthenticated_read_product_inventory`
2. Regenerate token
3. Update `.env`
4. Restart

### Drop status wrong

```bash
npm run drops:list
```

Check:
- Dates in YYYY-MM-DD format
- Metafield type is `date` (not text)
- Server time/timezone

### Image generation not working

Add custom description:
```bash
npm run collections:generate-images drop-08-fall-2025 --desc="Teal hoodie, black t-shirt"
```

Or upload manually in Shopify Admin.

---

## Scripts Reference

```bash
# Setup
npm run shopify:setup-metafields    # Create metafield definitions (once)
npm run shopify:cleanup-metafields  # Remove obsolete metafields

# Drops
npm run drops:create 8 Fall 2025 "Theme"  # Create new drop
npm run drops:list                        # List all drops with status

# Collections
npm run collections:generate-images              # Generate all missing
npm run collections:generate-images <handle>     # Specific collection
npm run collections:generate-images --force      # Replace existing
npm run collections:generate-images --skip-cache # Fresh generation

# Products
npm run shopify:verify          # Verify products
npm run shopify:check-media     # Check product media
npm run shopify:test-storefront # Test API connection

# Development
npm run dev   # Start dev server
npm run build # Build for production
```

---

## File Locations

```
docs/
├── STORE_MANAGEMENT.md      # Complete guide
├── METAFIELDS_REFERENCE.md  # Metafield reference
└── QUICK_START.md           # This file

scripts/
├── shopify-setup-metafields.mjs  # Create metafields
├── shopify-create-drop.mjs       # Create drops
├── shopify-list-drops.mjs        # List drops
└── generate-collection-images.mjs # AI images

src/lib/
├── shopify.ts           # Shopify API client
├── products-shopify.ts  # Product data layer
└── products.ts          # Types & utilities
```

---

## Need More Help?

- **Full guide:** `docs/STORE_MANAGEMENT.md`
- **Metafields:** `docs/METAFIELDS_REFERENCE.md`
- **API issues:** Run `npm run shopify:test-storefront`

---

**Last Updated:** October 2025
