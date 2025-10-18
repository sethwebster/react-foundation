# Shopify Seeding Quick Start

## The Issue

You're getting "Access denied for productCreate field" errors. This means your API token needs the `write_products` scope.

## Quick Fix (5 minutes)

### Step 1: Update API Scopes

1. Open your Shopify admin: `https://admin.shopify.com/store/xnrqbs-qb`
2. Go to: **Settings** → **Apps and sales channels** → **Develop apps**
3. Click on your app (or create a new one if none exists)
4. Click **Configure Admin API scopes**
5. Check these boxes:
   - ✅ `write_products`
   - ✅ `read_products`
   - ✅ `write_inventory`
   - ✅ `read_inventory`
6. Click **Save**
7. Click **API credentials** tab
8. Click **Install app** (or **Reinstall app** if already installed)

### Step 2: Get New Token

1. In the **API credentials** tab
2. Click **Reveal token once**
3. Copy the token (starts with `shpat_...`)
4. Update `.env` file:

```env
SHOPIFY_ADMIN_TOKEN=shpat_your_new_token_here
```

### Step 3: Test & Seed

```bash
# Test connection
npm run shopify:location

# Test seeding (dry run - no changes)
npm run shopify:seed:dry-run

# Seed products (for real)
npm run shopify:seed:no-images

# Or with images (requires public image URLs)
npm run shopify:seed
```

## What Gets Created

- ✅ 8 Products with all details (title, description, price, inventory)
- ✅ Custom metafields (unlock_tier, features, highlights, specs, etc.)
- ✅ 2 Collections (current-drop, past-drop)
- ✅ Product images (if not using --skip-images flag)

## Expected Output

```
🚀 React Foundation Store - Shopify Seeding

📍 Using location: 100 Claremont Avenue, 22B
📊 Found 8 products to process

📂 Creating collections...
  ✅ current-drop
  ✅ past-drop

📦 Creating products...

📦 Processing: React Fiber Shell
  ✅ Created: React Fiber Shell
     Handle: fiber-shell
     Price: $248
     Inventory: 0

...

✨ Seeding Complete!
Products Created:   8
Products Skipped:   0
Products Failed:    0
Collections:        2 new
Images Uploaded:    0
```

## Next Steps

After seeding:

1. Check your Shopify admin → Products
2. Verify products were created correctly
3. Set up Shopify Storefront API token for your Next.js app
4. Deploy your storefront so product images have public URLs
5. Re-run seed with images: `npm run shopify:seed`

## Still Having Issues?

See the full setup guide: `scripts/SHOPIFY_SETUP.md`
