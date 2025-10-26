# Shopify Management Scripts

CLI tools for managing React Foundation Store content in Shopify.

## Prerequisites

Add your Shopify Admin API token to `.env`:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
SHOPIFY_ADMIN_TOKEN=your-admin-api-token
```

**Getting Admin API Token:**
1. Shopify Admin → Settings → Apps and sales channels
2. Develop apps → Create app (or select existing)
3. Configure Admin API scopes:
   - `read_products`
   - `write_products`
   - `read_collections`
   - `write_collections`
4. Install app → Copy Admin API access token

**Note:** These scripts use Node's `--env-file` flag (Node v20.6+). If you're on an older Node version, install dotenv or upgrade Node.

---

## Drop Management Commands

### Setup Metafields (One-time)

Before creating drops, run this once to create all metafield definitions:

```bash
npm run shopify:setup-metafields
```

**What it does:**
- Creates 12 product metafield definitions
- Creates 14 collection metafield definitions
- All under `react_foundation` namespace
- Skips any that already exist

---

### List All Drops

View all drop collections and their current statuses (auto-calculated from dates).

```bash
npm run drops:list
```

**Output:**
```
📋 All Drop Collections:

🟢 CURRENT DROPS:
   Drop 06 · Spring 2025
   Theme: Neon Pulse
   Handle: drop-06-spring-2025
   Products: 8
   Starts: 2025-03-01
   Ends: 2025-05-31

🟡 UPCOMING DROPS:
   Drop 07 · Summer 2025
   Theme: Ocean Breeze
   Handle: drop-07-summer-2025
   Starts: 2025-06-01
   Ends: 2025-08-31

⚫ PAST DROPS:
   Drop 05 · Winter 2025
   Theme: React Fiber
   Handle: drop-05-winter-2025
   Products: 12
```

**Note:** Status is calculated automatically based on `drop_start_date` and `drop_end_date`. No manual status updates needed!

---

### Create a New Drop

Create a new drop collection with all required metafields.

```bash
npm run drops:create <number> <season> <year> "<theme>"
```

**Example:**
```bash
npm run drops:create 7 Summer 2025 "Ocean Breeze"
```

**What it creates:**
- Collection handle: `drop-07-summer-2025`
- Title: "Drop 07 · Summer 2025"
- Metafields:
  - `is_drop: true`
  - `drop_number: 7`
  - `drop_season: Summer`
  - `drop_year: 2025`
  - `drop_theme: Ocean Breeze`

**Next steps after creation:**
1. In Shopify admin, edit the collection
2. Add products to the collection
3. Upload a collection image
4. **Set `drop_start_date` and `drop_end_date` metafields**
5. Status will automatically transition based on dates!

**💡 Tip:** Set `drop_start_date` to today to make it "current" immediately

---

## Product Seeding (Legacy)

### Seed Products from JSON

Upload products from `products.json` to Shopify.

```bash
npm run shopify:seed
```

**Options:**
- `--dry-run` - Preview what would be created without making changes
- `--skip-images` - Don't upload images (faster for testing)

**Example:**
```bash
npm run shopify:seed:dry-run
```

---

## Image Management

### Upload Images from URLs

Upload product images from external URLs (e.g., Vercel CDN).

```bash
npm run shopify:upload-images
```

### Check Product Media Status

Verify all products have images uploaded correctly.

```bash
npm run shopify:check-media
```

### Delete Failed Media

Clean up failed image uploads.

```bash
npm run shopify:delete-failed
```

---

## Other Utilities

### Get Shopify Location ID

Find your Shopify location ID (needed for inventory management).

```bash
npm run shopify:location
```

### Fix Product Prices

Batch update product prices.

```bash
npm run shopify:fix-prices
```

### Verify Products

Check that all products from `products.json` exist in Shopify.

```bash
npm run shopify:verify
```

### Test Storefront API

Test your Storefront API connection and permissions.

```bash
npm run shopify:test-storefront
```

---

## Typical Workflow

### Launching Drop 07

**Week 1: Create & Prepare**
```bash
npm run drops:create 7 Summer 2025 "Ocean Breeze"
```

**Week 2-3: Prepare Content**
1. In Shopify admin, edit `drop-07-summer-2025` collection
2. Add products to the collection
3. Upload collection image
4. **Set metafields:**
   - `drop_start_date: 2025-06-01` (when drop goes live)
   - `drop_end_date: 2025-08-31` (when drop ends)
5. Save

**Launch Day (June 1):**
- ✨ **Nothing to do!** Drop automatically becomes "current" at midnight
- Appears in "Limited Drops" section on home page

**After Drop Ends (August 31):**
- ✨ **Nothing to do!** Drop automatically becomes "past" at midnight
- Moves to "Past Drops Archive" section
- Still browsable at `/collections/drop-07-summer-2025`

**🎯 Benefit:** Completely automated - no manual intervention needed!

---

## Troubleshooting

### "Missing SHOPIFY_ADMIN_TOKEN"

- Create Admin API token in Shopify (see Prerequisites)
- Add to `.env` file
- Restart terminal

### "Collection not found"

- Check collection handle spelling
- Run `npm run drops:list` to see all handles
- Verify collection exists in Shopify admin

### "GraphQL errors"

- Check API token has correct scopes
- Verify metafield definitions exist in Shopify
- Check namespace is `react_foundation` (case-sensitive)

---

## Script Files

| Script | Purpose |
|--------|---------|
| `shopify-create-drop.mjs` | Create new drop collection |
| `shopify-activate-drop.mjs` | Activate upcoming drop |
| `shopify-archive-drop.mjs` | Archive current drop |
| `shopify-list-drops.mjs` | List all drops with status |
| `seed-shopify-v2.mjs` | Bulk product import |
| `verify-shopify-products.mjs` | Verify products exist |

---

*For content management documentation, see [../docs/CONTENT_TAXONOMY.md](../docs/CONTENT_TAXONOMY.md)*
