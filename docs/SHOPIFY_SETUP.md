# Shopify Setup Quick Start

This guide walks you through setting up Shopify CMS for the React Foundation Store from scratch.

## Prerequisites

- Shopify store account
- Admin access to Shopify
- Basic understanding of products, collections, and tags

---

## Step 1: Create Storefront API Access Token

1. **In Shopify Admin:**
   - Navigate to: **Settings → Apps and sales channels**
   - Click: **Develop apps**
   - Click: **Create an app**
   - Name: "React Foundation Storefront"

2. **Configure API Access:**
   - Click: **Configure Storefront API scopes**
   - Enable these scopes:
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory` (optional, for stock counts)
     - ✅ `unauthenticated_read_collection_listings`
   - Click: **Save**

3. **Get Access Token:**
   - Click: **API credentials** tab
   - Under "Storefront API access token"
   - Click: **Install app**
   - Copy the access token

4. **Add to Environment Variables:**
   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
   ```

---

## Step 2: Define Custom Metafields

### Product Metafields

Navigate to: **Settings → Custom Data → Products**

Click **Add definition** for each:

| Name | Namespace & Key | Type | Required |
|------|-----------------|------|----------|
| Unlock Tier | `react_foundation.unlock_tier` | Single line text | No |
| Tagline | `react_foundation.tagline` | Single line text | Yes |
| Release Window | `react_foundation.release_window` | Single line text | Yes |
| Accent Gradient | `react_foundation.accent_gradient` | Single line text | Yes |
| Rating | `react_foundation.rating` | Decimal | No |
| Rating Count | `react_foundation.rating_count` | Integer | No |
| Features | `react_foundation.features` | JSON | No |
| Highlights | `react_foundation.highlights` | JSON | No |
| Specs | `react_foundation.specs` | JSON | No |

### Collection Metafields

Navigate to: **Settings → Custom Data → Collections**

Click **Add definition** for each:

| Name | Namespace & Key | Type | Required |
|------|-----------------|------|----------|
| Home Featured | `react_foundation.home_featured` | Boolean | No |
| Home Featured Order | `react_foundation.home_featured_order` | Integer | No |
| Accent Gradient | `react_foundation.accent_gradient` | Single line text | No |

---

## Step 3: Create Core Collections

### Automated Collections (Tag-Based)

**1. Current Drop Collection**
- Click: **Products → Collections → Create collection**
- Title: "Current Drop"
- Description: "Currently available limited edition products"
- Collection type: **Automated**
- Conditions: Product tag equals `current-drop`
- Save

**2. Past Drop Collection**
- Title: "Past Drop"
- Description: "Archive of previous releases"
- Collection type: **Automated**
- Conditions: Product tag equals `past-drop`
- Save

### Manual Collections (For Home Page Featured)

**3. Core Maintainer Essentials**
- Title: "Core Maintainer Essentials"
- Description: "Minimalist silhouettes in midnight hues with subtle React energy."
- Collection type: **Manual**
- Upload image from `/public/assets/collections/core-maintainer-essentials.png`
- Metafields:
  - `home_featured`: `true`
  - `home_featured_order`: `1`
- Save

**4. Conference Spotlight Capsule**
- Title: "Conference Spotlight Capsule"
- Description: "Stage-ready tailoring with chromatic accents and crisp typography."
- Collection type: **Manual**
- Upload image from `/public/assets/collections/conference-spotlight.png`
- Metafields:
  - `home_featured`: `true`
  - `home_featured_order`: `2`
- Save

**5. OSS Community Atelier**
- Title: "OSS Community Atelier"
- Description: "Collaborations with community artists celebrating open-source culture."
- Collection type: **Manual**
- Upload image from `/public/assets/collections/oss-community-atelier.png`
- Metafields:
  - `home_featured`: `true`
  - `home_featured_order`: `3`
- Save

---

## Step 4: Add Your First Product

**Example: React Fiber Shell Jacket**

1. **Create Product:**
   - Navigate to: **Products → Add product**
   - Title: "React Fiber Shell"
   - Description: Full product description (SEO-friendly)
   - Price: `$248`

2. **Upload Images:**
   - Add 5+ product images
   - First image = primary/hero image

3. **Set Tags:**
   - Add tags: `current-drop`, `clothing`, `outerwear`

4. **Fill Metafields:**
   - Scroll to "Metafields" section
   - Tagline: "Signal Reactive Innovation"
   - Release Window: "Drop 05 · Winter 2025"
   - Accent Gradient: "from-sky-400 via-indigo-500 to-purple-500"
   - Unlock Tier: "core" (or leave empty for public)
   - Rating: 4.8
   - Rating Count: 312
   - Features (JSON):
     ```json
     [
       "3-layer breathable membrane with DWR treatment",
       "Laser-cut cuff detailing featuring the React atom lattice",
       "Packable hood with magnetic stow strap"
     ]
     ```
   - Highlights (JSON):
     ```json
     [
       "10% of proceeds fund the React Maintainer Fellowship",
       "Produced in limited batches of 300 with carbon-neutral logistics"
     ]
     ```
   - Specs (JSON):
     ```json
     [
       {"label": "Fabrication", "value": "60% recycled nylon, 30% polyester, 10% elastane"},
       {"label": "Fit", "value": "Unisex modern athletic cut"},
       {"label": "Care", "value": "Machine wash cold, line dry"}
     ]
     ```

5. **Publish Product**

6. **Verify on Storefront:**
   - Visit your storefront
   - Product should appear in "Limited Drops" section
   - Product detail page should show all metafield data

---

## Step 5: Add Products to Featured Collections

1. **Edit Collection:**
   - Go to: **Products → Collections**
   - Select: "Core Maintainer Essentials"

2. **Add Products:**
   - Click: **Add products**
   - Search and select relevant products
   - Save

3. **Reorder Products:**
   - Drag products to desired order
   - First products show first on collection pages

---

## Step 6: Test Everything

### Verify Home Page

- [ ] Hero product displays (fiber-shell or first current-drop product)
- [ ] Featured Look shows 3 product images
- [ ] Signature Collections shows 3 featured collections
- [ ] Limited Drops shows current-drop products
- [ ] Past Drops shows past-drop products

### Verify Collections Page

- [ ] All collections display
- [ ] Collection images load
- [ ] Collection links work

### Verify Product Pages

- [ ] Product images load
- [ ] All metafields display correctly
- [ ] Rating shows properly
- [ ] Features, highlights, specs render

---

## Common Issues

### "No collections found" on /collections page

**Cause:** Shopify credentials not configured or no collections created

**Fix:**
1. Check `.env` has `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN`
2. Create at least one collection in Shopify
3. Verify Storefront API scopes include collection access

### Products not showing on home page

**Cause:** Products not tagged correctly or not in collections

**Fix:**
1. Verify products have `current-drop` tag
2. Check "Current Drop" automated collection is set up
3. Ensure products are published (not draft)

### Metafields not appearing

**Cause:** Metafield definitions not created or wrong namespace

**Fix:**
1. Verify metafield definitions exist in Settings → Custom Data
2. Check namespace is exactly `react_foundation` (case-sensitive)
3. Ensure keys match documentation exactly

### Images not loading

**Cause:** Next.js image domain not configured

**Fix:**
1. Check `next.config.ts` has:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'cdn.shopify.com',
       },
     ],
   }
   ```

---

## Development Workflow

### Local Development with Shopify

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Make changes in Shopify:**
   - Add/edit products
   - Update metafields
   - Change collection order

3. **See changes:**
   - Refresh browser (data caches for 5 minutes)
   - Or clear Next.js cache: `rm -rf .next`

### Content Updates (No Code Deploy)

When content team wants to:
- Launch new drop → Tag products with `current-drop` in Shopify
- Archive old drop → Remove `current-drop`, add `past-drop` tag
- Change featured collections → Update metafields in Shopify
- Update product info → Edit metafields in Shopify

**No code changes or deployments needed!**

---

## Next Steps

After basic setup:

1. **Bulk import products** - Use Shopify CSV import for multiple products
2. **Set up webhooks** (optional) - Auto-invalidate cache on product updates
3. **Configure checkout** - Set up Shopify Checkout or custom cart
4. **Add more collections** - Organize by season, category, etc.
5. **Create collection pages** - Build `/collections/[handle]` detail pages

---

## Related Docs

- [Full Shopify CMS Guide](./SHOPIFY_CMS_GUIDE.md) - Complete metafield reference
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront) - Official API docs

---

*Need help? Check the troubleshooting section or review the full CMS guide.*
