# Shopify Management Scripts

CLI tools for managing React Foundation Store content in Shopify.

## Quick Start

### Prerequisites

1. **Shopify Store** - Free development store or production store
2. **Admin Access** - You'll need admin permissions
3. **Node.js 18+** - Required for running scripts

### Get Your Credentials

Add these to your `.env` file:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
SHOPIFY_ADMIN_TOKEN=shpat_your_admin_token
```

### Get Admin API Token

1. Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** (enable custom app development if needed)
3. Click **Create an app** (or select existing app)
4. Click **Configure Admin API scopes**
5. **Enable required scopes:**
   - ✅ `write_products` ← REQUIRED for creating products
   - ✅ `read_products` ← REQUIRED for checking products
   - ✅ `write_collections` ← REQUIRED for drops
   - ✅ `read_collections` ← REQUIRED for drops
   - ✅ `write_inventory` ← REQUIRED for stock levels
   - ✅ `read_inventory` ← REQUIRED for inventory
   - Optional: `write_files` and `read_files` (for images)
6. Click **Save**
7. Go to **API credentials** tab
8. Click **Install app** (or **Reinstall app**)
9. Click **Reveal token once** → Copy token (starts with `shpat_`)
10. Add to `.env` file

⚠️ **Save the token immediately** - Shopify only shows it once!

### Test Connection

```bash
npm run shopify:location
```

If successful, you'll see your store location details.

---

## Drop Management

### 1. Setup Metafields (One-time)

Before creating any drops, run this **once** to create metafield definitions:

```bash
npm run shopify:setup-metafields
```

**What it does:**
- Creates 12 product metafield definitions
- Creates 14 collection metafield definitions
- All under `react_foundation` namespace
- Skips any that already exist

### 2. Create a New Drop

Create a time-limited drop collection:

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
- Metafields set automatically

**Next steps:**
1. In Shopify admin, edit the collection
2. Add products to the drop
3. Upload collection image
4. **Set date metafields:**
   - `drop_start_date`: When drop goes live (e.g., 2025-06-01)
   - `drop_end_date`: When drop ends (e.g., 2025-08-31)
5. Status will automatically transition based on dates!

### 3. List All Drops

View all drops with auto-calculated statuses:

```bash
npm run drops:list
```

**Example output:**
```
📋 All Drop Collections:

🟢 CURRENT DROPS:
   Drop 06 · Spring 2025
   Theme: Neon Pulse
   Products: 8
   Dates: 2025-03-01 to 2025-05-31

🟡 UPCOMING DROPS:
   Drop 07 · Summer 2025
   Theme: Ocean Breeze
   Starts: 2025-06-01

⚫ PAST DROPS:
   Drop 05 · Winter 2025
   Theme: React Fiber
   Products: 12
```

**Status is automatic:**
- **Current** = Between `drop_start_date` and `drop_end_date`
- **Upcoming** = Before `drop_start_date`
- **Past** = After `drop_end_date`

### 4. Typical Drop Workflow

**Week 1: Create**
```bash
npm run drops:create 8 Fall 2025 "Autumn Leaves"
```

**Week 2-3: Prepare Content**
1. Edit collection in Shopify admin
2. Add products
3. Upload collection image
4. Set `drop_start_date` and `drop_end_date`

**Launch Day:**
- ✨ **Nothing to do!** Drop automatically becomes "current"
- Appears in "Limited Drops" on homepage

**After Drop Ends:**
- ✨ **Nothing to do!** Drop automatically becomes "past"
- Moves to "Past Drops Archive"
- Still browsable at `/collections/drop-XX-season-year`

---

## Product Seeding

### Seed Products from JSON

Upload products from `products.json` to Shopify:

```bash
# Preview first (recommended)
npm run shopify:seed:dry-run

# Seed without images (faster)
npm run shopify:seed:no-images

# Full seed with images
npm run shopify:seed
```

**Options:**
- `--dry-run` - Preview without making changes
- `--skip-images` - Skip image uploads

**What gets created:**
- ✅ Products with all details (title, description, price, inventory)
- ✅ Custom metafields (unlock_tier, features, highlights, specs)
- ✅ Collections (current-drop, past-drop)
- ✅ Product images (if not using --skip-images)

### Image Hosting Setup

The seeding script needs public URLs for images.

**Option 1: Deploy to Vercel (Recommended)**
1. Deploy to Vercel
2. Images in `/public` automatically hosted
3. Script uses Vercel URL

**Option 2: Use CDN**
1. Upload `/public/assets/products/*` to CDN
2. Update URLs in `products.json`

**Option 3: Manual Upload**
1. Run script with `--skip-images`
2. Upload images manually in Shopify admin

---

## Image Management

### Upload Images from URLs

```bash
npm run shopify:upload-images
```

### Check Product Media Status

```bash
npm run shopify:check-media
```

### Delete Failed Media

```bash
npm run shopify:delete-failed
```

---

## Other Utilities

### Get Shopify Location ID

```bash
npm run shopify:location
```

### Fix Product Prices

```bash
npm run shopify:fix-prices
```

### Verify Products

Check that products from `products.json` exist in Shopify:

```bash
npm run shopify:verify
```

### Test Storefront API

```bash
npm run shopify:test-storefront
```

---

## Troubleshooting

### "Access denied for productCreate field"

**Problem:** API token missing `write_products` scope

**Solution:**
1. Go to Shopify admin → Settings → Apps and sales channels
2. Click your custom app
3. Click **Configure** under Admin API scopes
4. Check `write_products` and `write_collections`
5. Click **Save**
6. Go to **API credentials** tab
7. Click **Reinstall app**
8. Generate new token and update `.env`

### "Invalid API key or access token"

- Verify `SHOPIFY_ADMIN_TOKEN` in `.env` is correct
- Ensure token hasn't expired
- Check you copied full token (starts with `shpat_`)
- Verify app has required API scopes

### "No active locations found"

- Check **Settings** → **Locations** in Shopify admin
- Ensure you have at least one active location

### "Collection not found"

- Check collection handle spelling
- Run `npm run drops:list` to see all handles
- Verify collection exists in Shopify admin

### Products created but no images

- Check images are publicly accessible
- Verify URLs in script logs
- Use `--skip-images` and upload manually if needed

### "GraphQL errors"

- Check API token has correct scopes
- Verify metafield definitions exist in Shopify
- Check namespace is `react_foundation` (case-sensitive)

### Rate limiting errors

- Script includes built-in delays
- If still hitting limits, increase delay in script code

---

## Script Files Reference

| Script | Purpose |
|--------|---------|
| `shopify-create-drop.mjs` | Create new drop collection |
| `shopify-activate-drop.mjs` | Activate upcoming drop |
| `shopify-archive-drop.mjs` | Archive current drop |
| `shopify-list-drops.mjs` | List all drops with status |
| `seed-shopify-v2.mjs` | Bulk product import |
| `verify-shopify-products.mjs` | Verify products exist |
| `get-shopify-location.mjs` | Get location ID |

---

## Metafields Reference

### Product Metafields (12)

Under `react_foundation` namespace:
- `unlock_tier` - Membership tier requirement
- `product_rating` - Product rating (1-5)
- `product_features` - JSON array of features
- `tagline` - Product tagline
- `release_window` - Drop window info
- `accent_gradient` - Tailwind gradient classes
- `rating_count` - Number of ratings
- `highlights` - JSON array of highlights
- `specs` - JSON array of specifications
- `size_chart` - Size guide data
- `care_instructions` - Care instructions
- `sustainability_score` - Sustainability rating

### Collection Metafields (14)

Under `react_foundation` namespace:
- `is_drop` - Boolean (true for drops)
- `drop_number` - Drop number (e.g., 7)
- `drop_season` - Season name
- `drop_year` - Year
- `drop_theme` - Theme name
- `drop_start_date` - Start date (YYYY-MM-DD)
- `drop_end_date` - End date (YYYY-MM-DD)
- `drop_status` - Auto-calculated (current/upcoming/past)
- `collection_type` - Collection category
- `collection_status` - Collection status
- `ai_generated_image` - AI image URL
- `ai_prompt` - AI generation prompt

**All metafields must have "Storefront access" enabled!**

---

## Accessing Metafields in Code

```graphql
query {
  product(handle: "fiber-shell") {
    title
    metafields(identifiers: [
      { namespace: "react_foundation", key: "unlock_tier" }
      { namespace: "react_foundation", key: "product_features" }
    ]) {
      namespace
      key
      value
    }
  }
}
```

---

## Next Steps

After seeding:
1. Check Shopify admin → Products
2. Verify products and metafields
3. Set up Shopify Storefront API token
4. Test your storefront integration
5. Set up webhooks for inventory sync (if needed)

## Support

For issues:
1. Check [Shopify Admin API docs](https://shopify.dev/docs/api/admin-graphql)
2. Review GraphQL errors in console
3. Verify data in `products.json` is valid
4. See [store management guide](./store-management.md) for more details

---

*For more information, see [Store Management Guide](./store-management.md) and [Metafields Reference](./metafields-reference.md)*
