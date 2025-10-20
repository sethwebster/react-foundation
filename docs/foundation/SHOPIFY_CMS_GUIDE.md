# Shopify CMS Guide for React Foundation Store

This guide explains how to manage all storefront content through Shopify, replacing hardcoded data with a flexible CMS-driven approach.

## Overview

The React Foundation Store uses Shopify as its content management system. All products, collections, and display rules are managed through Shopify metafields and tags, providing a sustainable, non-technical workflow for content updates.

---

## Content Taxonomy

### Collections

Collections are the primary organizational unit in Shopify. We use them to group products and control how they appear on the storefront.

#### Collection Types

| Collection Handle | Purpose | Home Page Display |
|-------------------|---------|-------------------|
| `current-drop` | Currently available products | Limited Drops section + Hero |
| `past-drop` | Archived previous drops | Past Drops Archive section |
| `core-maintainer-essentials` | Tier-locked essentials | Signature Collections card #1 |
| `conference-spotlight` | Conference-ready apparel | Signature Collections card #2 |
| `oss-community-atelier` | Community collaborations | Signature Collections card #3 |

**Custom Collections:**
You can create additional collections for seasonal drops, special collaborations, etc.

---

## Metafield Definitions

### Product Metafields

**Namespace:** `react_foundation`

| Key | Type | Purpose | Example |
|-----|------|---------|---------|
| `unlock_tier` | Single line text | Tier required to purchase | `contributor`, `sustainer`, `core` |
| `tagline` | Single line text | Short product tagline | "Signal Reactive Innovation" |
| `release_window` | Single line text | When product releases | "Drop 05 · Winter 2025" |
| `accent_gradient` | Single line text | Tailwind gradient classes | "from-sky-400 via-indigo-500 to-purple-500" |
| `rating` | Number (decimal) | Average rating (0-5) | `4.8` |
| `rating_count` | Number (integer) | Number of reviews | `312` |
| `features` | JSON | Array of product features | `["Feature 1", "Feature 2"]` |
| `highlights` | JSON | Array of impact highlights | `["10% funds React Fellowship"]` |
| `specs` | JSON | Array of spec objects | `[{"label": "Fit", "value": "Unisex"}]` |

**JSON Format Examples:**

```json
// features
["3-layer breathable membrane", "Laser-cut cuff detailing", "Packable hood"]

// highlights
["10% of proceeds fund React Maintainer Fellowship", "Limited batch of 300"]

// specs
[
  {"label": "Fabrication", "value": "60% recycled nylon, 30% polyester"},
  {"label": "Fit", "value": "Unisex modern athletic cut"},
  {"label": "Care", "value": "Machine wash cold, line dry"}
]
```

### Collection Metafields

**Namespace:** `react_foundation`

| Key | Type | Purpose | Example |
|-----|------|---------|---------|
| `home_featured_order` | Number (integer) | Order in Signature Collections (1-3) | `1`, `2`, `3` |
| `home_featured` | Boolean | Show in Signature Collections | `true` |
| `accent_gradient` | Single line text | Collection theme gradient | "from-slate-600 via-cyan-500 to-slate-900" |

---

## Tagging Rules

### Product Tags

Tags control product categorization and filtering:

| Tag | Purpose |
|-----|---------|
| `current-drop` | Shows in Limited Drops section |
| `past-drop` | Shows in Past Drops Archive |
| `clothing` | Category: apparel |
| `drinkware` | Category: mugs/tumblers |
| `accessories` | Category: misc items |
| `tops`, `outerwear` | Subcategories |

**Multiple tags allowed** - A product can have `["current-drop", "clothing", "tops"]`

### Collection Tags

| Tag | Purpose |
|-----|---------|
| `featured-home` | Eligible for home page Signature Collections |
| `hidden` | Don't show in collections list |

---

## Home Page Content Rules

### Hero Product

**Selection Logic:**
1. Try to fetch product with handle: `fiber-shell` (hardcoded hero)
2. Fallback to first product in `current-drop` collection
3. Fallback to null (show placeholder)

**To change hero product:**
- Update `getProductBySlug("fiber-shell")` in `src/app/page.tsx` to a different handle
- OR create a metafield: `is_hero: true` and query for it

### Limited Drops Section

**Selection Logic:**
- Fetch all products from `current-drop` collection
- Hero product shown in left card (large)
- Next 4 products shown in grid (right side)

**To update:**
1. In Shopify, add products to the "Current Drop" collection
2. Products automatically appear on home page
3. Use collection product order to control which appear first

### Signature Collections

**Selection Logic:**
- Fetch collections with metafield: `home_featured = true`
- Sort by `home_featured_order` (1, 2, 3)
- Display exactly 3 collections

**To update:**
1. Edit collection in Shopify
2. Set metafield: `react_foundation.home_featured = true`
3. Set metafield: `react_foundation.home_featured_order` (1, 2, or 3)
4. Add collection image
5. Save

### Past Drops Archive

**Selection Logic:**
- Fetch all products from `past-drop` collection
- Display in grid

**To update:**
1. Move older products from "Current Drop" to "Past Drop" collection
2. Automatically updates home page

---

## How to Set Up in Shopify Admin

### Step 1: Create Custom Metafield Definitions

**For Products:**

Navigate to: **Settings → Custom Data → Products → Add definition**

Create each metafield:
1. **Unlock Tier**
   - Namespace: `react_foundation`
   - Key: `unlock_tier`
   - Type: Single line text
   - Validation: One of `contributor`, `sustainer`, `core`, or empty

2. **Tagline**
   - Namespace: `react_foundation`
   - Key: `tagline`
   - Type: Single line text

3. **Release Window**
   - Namespace: `react_foundation`
   - Key: `release_window`
   - Type: Single line text
   - Example: "Drop 05 · Winter 2025"

4. **Accent Gradient**
   - Namespace: `react_foundation`
   - Key: `accent_gradient`
   - Type: Single line text
   - Example: "from-sky-400 via-indigo-500 to-purple-500"

5. **Rating**
   - Namespace: `react_foundation`
   - Key: `rating`
   - Type: Decimal number
   - Min: 0, Max: 5

6. **Rating Count**
   - Namespace: `react_foundation`
   - Key: `rating_count`
   - Type: Integer
   - Min: 0

7. **Features**
   - Namespace: `react_foundation`
   - Key: `features`
   - Type: JSON

8. **Highlights**
   - Namespace: `react_foundation`
   - Key: `highlights`
   - Type: JSON

9. **Specs**
   - Namespace: `react_foundation`
   - Key: `specs`
   - Type: JSON

**For Collections:**

Navigate to: **Settings → Custom Data → Collections → Add definition**

1. **Home Featured**
   - Namespace: `react_foundation`
   - Key: `home_featured`
   - Type: Boolean

2. **Home Featured Order**
   - Namespace: `react_foundation`
   - Key: `home_featured_order`
   - Type: Integer
   - Min: 1, Max: 3

3. **Accent Gradient**
   - Namespace: `react_foundation`
   - Key: `accent_gradient`
   - Type: Single line text

### Step 2: Create Collections

**Required Collections:**

1. **Current Drop**
   - Handle: `current-drop`
   - Automated: Tag with `current-drop`
   - Condition: Products tagged with `current-drop`

2. **Past Drop**
   - Handle: `past-drop`
   - Automated: Tag with `past-drop`
   - Condition: Products tagged with `past-drop`

3. **Core Maintainer Essentials**
   - Handle: `core-maintainer-essentials`
   - Manual collection
   - Add metafield: `home_featured = true`, `home_featured_order = 1`
   - Upload image: `/assets/collections/core-maintainer-essentials.png`

4. **Conference Spotlight Capsule**
   - Handle: `conference-spotlight`
   - Manual collection
   - Add metafield: `home_featured = true`, `home_featured_order = 2`
   - Upload image

5. **OSS Community Atelier**
   - Handle: `oss-community-atelier`
   - Manual collection
   - Add metafield: `home_featured = true`, `home_featured_order = 3`
   - Upload image

### Step 3: Tag Products Appropriately

**For each product:**
1. Navigate to product in Shopify admin
2. Add relevant tags in the "Tags" field:
   - `current-drop` (if currently available)
   - `past-drop` (if archived)
   - Category tags: `clothing`, `drinkware`, `accessories`
   - Subcategory: `tops`, `outerwear`, `mug`, etc.

**Example product tags:**
- Fiber Shell: `current-drop, clothing, outerwear`
- Archive Tee 01: `current-drop, clothing, tops, t-shirt`
- Debate Mug: `current-drop, drinkware, mug`

### Step 4: Fill in Metafields

**For each product:**
1. Scroll to "Metafields" section in product editor
2. Fill in React Foundation metafields:
   - Unlock tier (if tier-locked)
   - Tagline for card display
   - Release window
   - Accent gradient (Tailwind classes)
   - Rating and rating count
   - Features (JSON array)
   - Highlights (JSON array)
   - Specs (JSON array of objects)

---

## Content Update Workflows

### Adding a New Product Drop

1. **Create product in Shopify**
   - Add title, description, price, images
   - Upload 5+ high-quality product images

2. **Set metafields**
   - Tagline: Short catchy phrase
   - Release window: "Drop 06 · Spring 2025"
   - Accent gradient: Tailwind gradient classes
   - Features: JSON array of 3-5 features
   - Highlights: JSON array of impact statements
   - Specs: JSON array of spec objects
   - Unlock tier (optional): `contributor`, `sustainer`, or `core`

3. **Tag product**
   - Add `current-drop` tag
   - Add category tags (clothing, drinkware, etc.)

4. **Publish**
   - Product automatically appears on home page Limited Drops
   - Product appears on /collections page

### Moving Drop to Archive

1. **Edit product tags**
   - Remove `current-drop` tag
   - Add `past-drop` tag

2. **Changes automatically:**
   - Removed from Limited Drops section
   - Appears in Past Drops Archive

### Updating Signature Collections

1. **Create or edit collection**
   - Set collection image
   - Write compelling description

2. **Set metafields:**
   - `home_featured = true`
   - `home_featured_order = 1` (or 2 or 3)

3. **Changes automatically:**
   - Collection appears in Signature Collections on home page
   - Sorted by order number
   - Only top 3 shown

### Seasonal Theme Updates

1. **Update collection metafield:**
   - Change `accent_gradient` on collections
   - E.g., "from-amber-400 via-orange-500 to-red-500" for fall

2. **Update product metafields:**
   - Change `accent_gradient` on hero products
   - Updates product detail page themes

---

## Migration from Hardcoded Data

### Current State
- `collectionCards` array in `featured-collections.tsx`
- Local `products.json` as fallback
- Manual data updates require code changes

### Target State
- All data in Shopify
- Non-technical team members can update content
- No code deployments for content changes
- Shopify as single source of truth

### Migration Checklist

**Phase 1: Collections**
- [ ] Create 3 signature collections in Shopify
- [ ] Upload collection images
- [ ] Set `home_featured` and `home_featured_order` metafields
- [ ] Update `FeaturedCollections` component to fetch from Shopify
- [ ] Remove hardcoded `collectionCards` array

**Phase 2: Products**
- [ ] Verify all products exist in Shopify
- [ ] Fill in all metafields for each product
- [ ] Verify tags are correct (`current-drop`, `past-drop`)
- [ ] Test home page displays correctly

**Phase 3: Hero Product**
- [ ] Add `is_hero` metafield to products (optional)
- [ ] Query for hero product by metafield OR handle
- [ ] Remove hardcoded `fiber-shell` handle

**Phase 4: Featured Look**
- [ ] Add `featured_look_order` metafield (1-3 for the 3 images)
- [ ] Query products with this metafield
- [ ] Update `FeaturedLook` component

---

## Shopify Metafield Setup Instructions

### Creating Product Metafields

1. **In Shopify Admin:**
   - Settings → Custom Data → Products
   - Click "Add definition"

2. **For each metafield:**
   - Name: Human-readable name (e.g., "Unlock Tier")
   - Namespace and key: `react_foundation.unlock_tier`
   - Type: Choose appropriate type (text, number, JSON)
   - Description: Add helpful description for content team
   - Validation: Set min/max or allowed values if applicable

3. **Save definition**

4. **Use in products:**
   - Edit any product
   - Scroll to "Metafields" section
   - Fill in React Foundation fields

### Creating Collection Metafields

Same process, but:
- Settings → Custom Data → **Collections**
- Add definitions for collections

---

## GraphQL Query Examples

### Fetching Collections with Metafields

```graphql
query getCollections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        image {
          url
          altText
        }
        homeFeatured: metafield(namespace: "react_foundation", key: "home_featured") {
          value
        }
        homeFeaturedOrder: metafield(namespace: "react_foundation", key: "home_featured_order") {
          value
        }
        accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") {
          value
        }
      }
    }
  }
}
```

### Fetching Hero Product

**Option 1: By handle (current)**
```graphql
query getProduct($handle: String!) {
  product(handle: $handle) {
    # ... product fields
  }
}
```

**Option 2: By metafield (recommended)**
```graphql
query getHeroProduct {
  products(first: 1, query: "metafield.react_foundation.is_hero:true") {
    edges {
      node {
        # ... product fields
      }
    }
  }
}
```

---

## Content Management Workflows

### Weekly Content Update Example

**Scenario:** Launching Drop 06 and archiving Drop 05

**Steps:**
1. **Create new products in Shopify**
   - Upload images, set prices
   - Fill in all metafields
   - Tag with `current-drop`

2. **Archive previous drop**
   - Bulk select Drop 05 products
   - Remove `current-drop` tag
   - Add `past-drop` tag

3. **Update featured collections (if needed)**
   - Edit collection metafields
   - Change featured order or swap collections

4. **Changes propagate automatically**
   - Home page updates (no deploy needed)
   - New products appear in Limited Drops
   - Old products move to Archive

**Time required:** 15-30 minutes (vs hours of code changes)

---

## Recommended Shopify Collection Structure

```
📁 Collections
├── 🔴 Current Drop (automated by tag: current-drop)
├── 📦 Past Drop (automated by tag: past-drop)
├── ⭐ Core Maintainer Essentials (manual, home_featured: true, order: 1)
├── 🎤 Conference Spotlight (manual, home_featured: true, order: 2)
├── 🎨 OSS Community Atelier (manual, home_featured: true, order: 3)
├── 👕 Apparel (manual - all clothing)
├── ☕ Drinkware (manual - mugs, tumblers)
└── 🎒 Accessories (manual - misc items)
```

---

## Displaying Dynamic Data

### Home Page Sections Data Sources

| Section | Data Source | Query |
|---------|-------------|-------|
| Hero | Product handle: `fiber-shell` OR metafield `is_hero: true` | `getProductBySlug()` or search query |
| Featured Look | First 3 products from `current-drop` | `getProductsByCollection("current-drop")` |
| Signature Collections | Collections with `home_featured: true` | `getAllCollections()` filtered |
| Limited Drops | Products in `current-drop` collection | `getProductsByCollection("current-drop")` |
| Past Drops | Products in `past-drop` collection | `getProductsByCollection("past-drop")` |

---

## Image Management

### Product Images

**Requirements:**
- Minimum: 5 images per product
- Recommended size: 2000x2000px
- Format: PNG or JPG
- Naming: Descriptive (e.g., `fiber-shell-front.png`)

**Primary Image:**
- First image in product's image list = primary image
- Used in product cards and previews

**Image CDN:**
- Shopify automatically serves images from `cdn.shopify.com`
- Already configured in `next.config.ts`

### Collection Images

**Requirements:**
- Size: 1200x800px minimum
- Format: PNG or JPG
- Shows in collection cards on /collections page

---

## Advanced: Conditional Display Rules

### Example: Seasonal Collections

**Use case:** Show "Holiday Collection" only in November-December

**Implementation:**
1. Add metafield: `available_months` (JSON)
   ```json
   [11, 12]
   ```

2. Update query to filter by current month
3. Collection auto-hides/shows based on calendar

### Example: Limited Edition Countdown

**Use case:** Show "X days left" for limited drops

**Implementation:**
1. Add metafield: `drop_end_date` (date)
2. Calculate days remaining in component
3. Display countdown badge

---

## Troubleshooting

### Collections not appearing on home page
- ✅ Check metafield `home_featured = true`
- ✅ Check `home_featured_order` is 1, 2, or 3
- ✅ Verify collection has image uploaded
- ✅ Check Shopify API credentials are set

### Products not showing in Limited Drops
- ✅ Verify product is tagged with `current-drop`
- ✅ Check product is in "Current Drop" collection
- ✅ Verify product is published (not draft)

### Metafields not showing up
- ✅ Confirm metafield definitions created in Settings → Custom Data
- ✅ Check namespace is exactly `react_foundation`
- ✅ Verify key spelling matches exactly
- ✅ Ensure Storefront API has access to metafields

---

## Best Practices

1. **Always use metafields over product descriptions for structured data**
   - Descriptions are for SEO and customer-facing text
   - Metafields are for structured, queryable data

2. **Use automated collections with tags when possible**
   - Easier to manage
   - Less manual organization
   - `current-drop` and `past-drop` should be tag-based

3. **Keep collection handles lowercase with hyphens**
   - `core-maintainer-essentials` ✅
   - `Core_Maintainer_Essentials` ❌

4. **Use consistent naming for metafield namespaces**
   - All custom metafields use `react_foundation` namespace
   - Never mix namespaces

5. **Document custom metafields**
   - Add descriptions in Shopify when creating definitions
   - Helps content team understand what to enter

6. **Version control for metafield schemas**
   - Keep this doc updated when adding new metafields
   - Track changes in git

---

## Future Enhancements

### Potential Metafields to Add

- `video_url` - Product demo videos
- `size_chart_url` - Link to sizing guide
- `pre_order_ship_date` - Expected ship date for pre-orders
- `limited_edition_number` - "Edition X of Y"
- `collaboration_partner` - "Designed with [Name]"
- `carbon_offset_info` - Sustainability details
- `featured_look_order` - Control Featured Look showcase order

### Shopify Plus Features

If you upgrade to Shopify Plus:
- **Metaobjects** - Create reusable content blocks
- **Functions** - Custom discount rules for contributor tiers
- **Scripts** - Auto-apply tier discounts at checkout

---

## Related Documentation

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Metafields Guide](https://shopify.dev/docs/apps/build/custom-data/metafields)
- [Collections API](https://shopify.dev/docs/api/storefront/latest/objects/Collection)

---

*Last updated: October 2025*
*Maintained by: React Foundation Store Team*
