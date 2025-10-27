# Shopify Integration Setup Guide

This guide will help you set up the Shopify integration and seed your products.

## Prerequisites

1. A Shopify store (you can create a development store for free)
2. Admin access to your Shopify store
3. Node.js 18+ installed

## Step 1: Get Your Shopify Credentials

### Store Domain

Your store domain is in the format: `your-store.myshopify.com`

Find it in your Shopify admin panel URL or settings.

### Admin API Access Token

⚠️ **IMPORTANT**: The token must have the `write_products` scope to create products and collections!

1. Go to your Shopify admin panel
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Develop apps** (you may need to enable custom app development first)
   - If disabled, click **Allow custom app development**
4. Click **Create an app**
5. Name it something like "React Foundation Store Seeder"
6. Click **Configure Admin API scopes**
7. **Enable ONLY these required scopes** (minimum required):
   - ✅ `write_products` (REQUIRED - creates products and collections)
   - ✅ `read_products` (REQUIRED - checks for existing products)
   - ✅ `write_inventory` (REQUIRED - sets inventory levels)
   - ✅ `read_inventory` (REQUIRED - reads inventory items)
   - Optional: `write_files` and `read_files` (for image uploads)
8. Click **Save**
9. Go to the **API credentials** tab
10. Click **Install app**
11. Click **Reveal token once** and copy your Admin API access token
    - This starts with `shpat_`
    - **Save it immediately** - Shopify only shows it once!

⚠️ **Important**: Save this token securely. Shopify will only show it once!

## Step 2: Update Your .env File

Add your Shopify credentials to `.env`:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Verify Connection

Test your connection with the location helper:

```bash
node scripts/get-shopify-location.mjs
```

This should display your store locations. If you see an error, double-check your credentials.

## Step 4: Seed Your Products

### Dry Run (Recommended First)

Preview what will be created without making any changes:

```bash
node scripts/seed-shopify-v2.mjs --dry-run
```

### Full Seed

Once you're happy with the dry run, execute the full seeding:

```bash
node scripts/seed-shopify-v2.mjs
```

### Skip Images (Faster Testing)

If you want to test product creation without uploading images:

```bash
node scripts/seed-shopify-v2.mjs --skip-images
```

## Step 5: Configure Image Hosting

The seeding script needs publicly accessible URLs for product images.

### Option 1: Deploy to Vercel (Recommended)

1. Deploy your Next.js storefront to Vercel
2. Images in `/public` will be automatically hosted
3. The script will use your Vercel URL for images

### Option 2: Use a CDN

1. Upload images from `/public/assets/products/*` to your CDN
2. Update image URLs in `products.json` to point to your CDN

### Option 3: Manual Upload

1. Run the script with `--skip-images`
2. Manually upload images in Shopify admin panel for each product

## What Gets Created

### Products

Each product from `src/lib/products.json` will be created with:
- Title, description, and handle (slug)
- Price and inventory levels
- Product images (if not skipped)
- Tags and product type
- Status (Active/Draft/Archived based on availability)

### Metafields

Custom data is stored in metafields under the `react_foundation` namespace:
- `unlock_tier` - Membership tier requirement
- `tagline` - Product tagline
- `release_window` - Drop window info
- `accent_gradient` - Tailwind gradient classes
- `rating` & `rating_count` - Product ratings
- `features` - JSON array of features
- `highlights` - JSON array of highlights
- `specs` - JSON array of specifications

### Collections

Collections are automatically created based on the `collections` field:
- `current-drop` - Current drop products
- `past-drop` - Past drop/archive products

## Accessing Metafields in Your App

To use metafields in your Shopify storefront:

1. Install the Shopify Storefront API client
2. Query products with metafields:

```graphql
query {
  product(handle: "fiber-shell") {
    title
    metafields(identifiers: [
      { namespace: "react_foundation", key: "unlock_tier" }
      { namespace: "react_foundation", key: "features" }
    ]) {
      namespace
      key
      value
    }
  }
}
```

## Troubleshooting

### "Access denied for productCreate field" or "Required access: `write_products`"

This means your Admin API token doesn't have the required scopes. You need to:

1. Go to your Shopify admin → Settings → Apps and sales channels
2. Click on your custom app
3. Click **Configure** under Admin API scopes
4. Make sure `write_products` is checked
5. Click **Save**
6. Go to **API credentials** tab
7. If you see "Reinstall app", click it
8. Generate a new access token and update your `.env`

### "Invalid API key or access token"

- Verify your `SHOPIFY_ADMIN_TOKEN` is correct in `.env`
- Ensure the token hasn't expired
- Make sure you copied the full token (starts with `shpat_`)
- Check that your app has the required API scopes

### "No active locations found"

- Verify your store has at least one active location
- Go to **Settings** → **Locations** in Shopify admin

### Products created but no images

- Check that images are publicly accessible
- Verify the URLs in the script logs
- Consider using `--skip-images` and uploading manually

### Rate limiting errors

- The script includes built-in delays between requests
- If you still hit limits, increase the delay in the script

## Next Steps

After seeding:

1. Visit your Shopify admin panel to verify products were created
2. Check product details, images, and metafields
3. Test the Shopify Storefront API integration
4. Set up webhooks for inventory sync (if needed)

## Updating Products

To update products after initial seeding:

1. The script automatically skips products that already exist (by handle)
2. To force updates, delete products in Shopify admin first, or
3. Create a separate update script based on `seed-shopify-v2.mjs`

## Support

If you encounter issues:

1. Check the [Shopify Admin API docs](https://shopify.dev/docs/api/admin-graphql)
2. Review GraphQL errors in the console output
3. Verify your product data in `products.json` is valid
