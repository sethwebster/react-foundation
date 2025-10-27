# React Foundation Store - Content Taxonomy

This document defines the complete content taxonomy for managing products and collections in Shopify.

## Design Philosophy

**Core Principles:**
1. **Each drop is its own collection** - Drop 05, Drop 06, etc. are individual collections
2. **Time-based activation** - Drops can be current, upcoming, or past based on dates
3. **Perennial vs. Drop content** - Some items are always available (contributor essentials), others are limited-time
4. **Flexible display rules** - Metafields control what appears where on the storefront
5. **No hardcoded data** - All content managed through Shopify CMS

---

## Collection Types

### 1. Drop Collections

**Naming Convention:** `drop-{number}-{season}-{year}`

**Examples:**
- `drop-05-winter-2025`
- `drop-06-spring-2025`
- `drop-07-summer-2025`

**Purpose:** Time-limited product releases with specific themes

**Required Metafields:**
```
react_foundation.is_drop = true
react_foundation.drop_number = 5 (integer)
react_foundation.drop_status = "current" | "upcoming" | "past"
react_foundation.drop_start_date = "2025-01-15" (YYYY-MM-DD)
react_foundation.drop_end_date = "2025-03-31" (YYYY-MM-DD, optional)
react_foundation.drop_season = "Winter" | "Spring" | "Summer" | "Fall"
react_foundation.drop_year = 2025 (integer)
react_foundation.accent_gradient = "from-sky-400 via-indigo-500 to-purple-500"
```

**Optional Metafields:**
```
react_foundation.drop_theme = "React Fiber" (short theme name)
react_foundation.limited_edition_size = 300 (total units across all products)
```

**Products:**
- Products belong to ONE drop collection
- No need for `current-drop` tag - collection status determines display

**Display Rules:**
- **Current drops** → "Limited Drops" section on home page
- **Past drops** → "Past Drops Archive" (grouped by drop)
- **Upcoming drops** → Can be teased/pre-announced

---

### 2. Perennial Collections

**Naming Convention:** `{category}-{descriptor}`

**Examples:**
- `contributor-essentials` - Always-available gear for OSS contributors
- `core-maintainer-gear` - Tier-locked evergreen items
- `react-fundamentals` - Basics that never go out of stock
- `conference-ready` - Stage-appropriate apparel (always available)

**Purpose:** Long-term, always-available product lines

**Required Metafields:**
```
react_foundation.is_perennial = true
react_foundation.collection_type = "essentials" | "apparel" | "accessories" | "drinkware"
```

**Optional Metafields:**
```
react_foundation.home_featured = true
react_foundation.home_featured_order = 1 | 2 | 3
react_foundation.unlock_tier_filter = "contributor" (only show products of this tier)
```

**Products:**
- Products can belong to multiple perennial collections
- Not time-limited
- Restock as needed

**Display Rules:**
- Can appear in "Signature Collections" if `home_featured = true`
- Always visible on `/collections` page
- Product availability controlled by inventory, not dates

---

### 3. Curated/Thematic Collections

**Naming Convention:** `{theme}-{descriptor}`

**Examples:**
- `summit-2025` - React Summit exclusive merch
- `maintainer-appreciation` - Thank you collection for maintainers
- `holiday-2025` - Seasonal special

**Purpose:** Special themed collections, may or may not be time-limited

**Required Metafields:**
```
react_foundation.is_curated = true
react_foundation.curation_theme = "React Summit 2025"
```

**Optional Metafields:**
```
react_foundation.time_limited = true
react_foundation.available_start = "2025-05-01"
react_foundation.available_end = "2025-06-15"
```

---

## Collection Metafield Schema (Complete)

**Namespace:** `react_foundation`

| Key | Type | Purpose | Values |
|-----|------|---------|--------|
| `is_drop` | Boolean | Marks as drop collection | `true` / `false` |
| `is_perennial` | Boolean | Marks as always-available | `true` / `false` |
| `is_curated` | Boolean | Marks as curated/themed | `true` / `false` |
| `drop_number` | Integer | Drop sequence number | `5`, `6`, `7` |
| `drop_status` | Single line text | Current state | `current`, `upcoming`, `past` |
| `drop_start_date` | Date | When drop goes live | `2025-01-15` |
| `drop_end_date` | Date | When drop ends (optional) | `2025-03-31` |
| `drop_season` | Single line text | Season identifier | `Winter`, `Spring`, `Summer`, `Fall` |
| `drop_year` | Integer | Year of drop | `2025` |
| `drop_theme` | Single line text | Short theme name | "React Fiber", "Neon Pulse" |
| `limited_edition_size` | Integer | Total units in drop | `300` |
| `collection_type` | Single line text | Category | `essentials`, `apparel`, `accessories`, `drinkware` |
| `home_featured` | Boolean | Show in Signature Collections | `true` / `false` |
| `home_featured_order` | Integer | Order in featured (1-3) | `1`, `2`, `3` |
| `accent_gradient` | Single line text | Tailwind gradient | `from-sky-400 via-indigo-500 to-purple-500` |
| `time_limited` | Boolean | Has start/end dates | `true` / `false` |
| `available_start` | Date | When to show | `2025-05-01` |
| `available_end` | Date | When to hide | `2025-06-15` |
| `unlock_tier_filter` | Single line text | Tier restriction | `contributor`, `sustainer`, `core` |

---

## Home Page Display Rules (New System)

### Hero Product

**Query:** Product with `react_foundation.is_hero = true` OR hardcoded handle

```typescript
// Option 1: Query by metafield (recommended)
const heroProduct = await searchProducts('metafield.react_foundation.is_hero:true');

// Option 2: Fallback to handle
const heroProduct = await getProductBySlug('fiber-shell');
```

### Featured Look (3 images)

**Query:** Products with `react_foundation.featured_look_order` metafield (1, 2, 3)

```typescript
const featuredLookProducts = currentDropProducts
  .filter(p => p.featuredLookOrder)
  .sort((a, b) => a.featuredLookOrder - b.featuredLookOrder)
  .slice(0, 3);
```

**Fallback:** First 3 products from current drop

### Signature Collections (3 collections)

**Query:** Collections where `home_featured = true`, sorted by `home_featured_order`

```typescript
const signatureCollections = allCollections
  .filter(c => c.homeFeatured)
  .sort((a, b) => a.homeFeaturedOrder - b.homeFeaturedOrder)
  .slice(0, 3);
```

**Can be:**
- Drop collections
- Perennial collections
- Mix of both

### Limited Drops Section

**Query:** Collections where `is_drop = true` AND `drop_status = "current"`

```typescript
const currentDrops = allCollections.filter(c =>
  c.isDrop && c.dropStatus === 'current'
);
```

**Display:**
- First drop collection → Hero card (left, large)
- Products from that drop → Grid (right, 2x2)

**Alternative:** Show multiple current drops if you have concurrent releases

### Past Drops Archive

**Query:** Collections where `is_drop = true` AND `drop_status = "past"`

**Sorted by:** `drop_number` descending (newest first)

```typescript
const pastDrops = allCollections
  .filter(c => c.isDrop && c.dropStatus === 'past')
  .sort((a, b) => b.dropNumber - a.dropNumber);
```

**Display:**
- Grid of drop collection cards
- Each card links to `/collections/drop-{number}`
- Shows drop theme, season, year
- Preview of products in that drop

---

## Product Taxonomy

### Product Metafields

**Namespace:** `react_foundation`

| Key | Type | Purpose | Example |
|-----|------|---------|---------|
| `is_hero` | Boolean | Featured hero product | `true` |
| `featured_look_order` | Integer | Order in Featured Look (1-3) | `1`, `2`, `3` |
| `unlock_tier` | Single line text | Purchase restriction | `contributor`, `sustainer`, `core` |
| `tagline` | Single line text | Card subtitle | "Signal Reactive Innovation" |
| `release_window` | Single line text | When it drops | "Drop 05 · Winter 2025" |
| `accent_gradient` | Single line text | Theme gradient | "from-sky-400 via-indigo-500 to-purple-500" |
| `rating` | Decimal | Product rating (0-5) | `4.8` |
| `rating_count` | Integer | Number of reviews | `312` |
| `features` | JSON | Product features | `["Feature 1", "Feature 2"]` |
| `highlights` | JSON | Impact highlights | `["10% funds Fellowship"]` |
| `specs` | JSON | Technical specs | `[{"label": "Fit", "value": "Unisex"}]` |
| `is_perennial` | Boolean | Always available | `true` |
| `limited_edition_number` | Integer | Unit number (e.g., "23 of 300") | `23` |

### Product Tags (Simplified)

Tags are now primarily for **categorization**, not display rules:

| Tag | Purpose |
|-----|---------|
| `clothing` | Category |
| `drinkware` | Category |
| `accessories` | Category |
| `tops` | Subcategory |
| `outerwear` | Subcategory |
| `mug` | Subcategory |
| `contributor-tier` | Available to contributors+ |
| `sustainer-tier` | Available to sustainers+ |
| `core-tier` | Available to core allies only |

**Display is controlled by:**
- Collection membership (not tags)
- Collection metafields (`is_drop`, `drop_status`)
- Product metafields (`is_hero`, `featured_look_order`)

---

## Example Shopify Structure

```
📁 Collections
│
├── 🚀 DROP COLLECTIONS (is_drop: true)
│   ├── drop-05-winter-2025 (drop_status: past, drop_number: 5)
│   │   └── Products: Fiber Shell, Debate Mug, Archive Tee 01
│   │
│   ├── drop-06-spring-2025 (drop_status: current, drop_number: 6)
│   │   └── Products: Spring Hoodie, React Tumbler, Neon Tee
│   │
│   └── drop-07-summer-2025 (drop_status: upcoming, drop_number: 7)
│       └── Products: (not yet added)
│
├── 🏛️ PERENNIAL COLLECTIONS (is_perennial: true)
│   ├── contributor-essentials
│   │   └── Products always available for verified contributors
│   │
│   ├── core-maintainer-gear
│   │   └── Tier-locked items always in stock
│   │
│   └── react-fundamentals
│       └── Basic tees, stickers, always available
│
├── ⭐ SIGNATURE/FEATURED (home_featured: true)
│   ├── core-maintainer-essentials (home_featured_order: 1)
│   ├── conference-spotlight (home_featured_order: 2)
│   └── oss-community-atelier (home_featured_order: 3)
│
└── 🎨 CURATED/THEMATIC (is_curated: true)
    ├── summit-2025 (time_limited: true)
    └── maintainer-appreciation
```

---

## Display Logic

### Home Page - Limited Drops Section

**Query:**
```graphql
collections(query: "metafield.react_foundation.is_drop:true AND metafield.react_foundation.drop_status:current")
```

**Display:**
- Latest current drop collection → Hero card
- Products from that collection → Product grid
- If multiple current drops, show all in tabs or separate sections

### Home Page - Past Drops Archive

**Query:**
```graphql
collections(
  query: "metafield.react_foundation.is_drop:true AND metafield.react_foundation.drop_status:past",
  sortKey: METAFIELD,
  reverse: true
)
```

**Display:**
- Grid of drop collection cards (not individual products)
- Each card shows:
  - Drop number, season, year
  - Collection image (hero product or custom image)
  - "X products" count
  - Link to `/collections/drop-{number}`
- Sorted by drop number (newest first)

**Example Card:**
```
┌─────────────────────┐
│   [Drop Image]      │
│                     │
│ Drop 05 · Winter 25 │
│ React Fiber Theme   │
│ 8 products          │
│                     │
│ [View Drop →]       │
└─────────────────────┘
```

### Home Page - Signature Collections

**Query:**
```graphql
collections(query: "metafield.react_foundation.home_featured:true")
```

**Sort by:** `home_featured_order`

**Display:**
- Top 3 collections (can be drops OR perennials)
- Shows collection image, title, description
- Links to collection page

### Collections List Page (`/collections`)

**Query:** All collections

**Grouping:**
1. **Current Drops** (is_drop + current)
2. **Perennial Collections** (is_perennial)
3. **Past Drops** (is_drop + past, sorted by drop_number)
4. **Special/Curated** (is_curated)

---

## Automated Drop Status Management

### Option 1: Manual Status Updates

**Process:**
1. When drop ends, admin updates `drop_status` from `current` → `past`
2. Changes immediately reflected on storefront

**Pros:** Simple, explicit control
**Cons:** Requires manual intervention

### Option 2: Date-Based Auto-Status (Recommended)

**Process:**
1. Set `drop_start_date` and `drop_end_date` on collection
2. Frontend queries current date
3. Status determined automatically:
   ```typescript
   const now = new Date();
   const status =
     now < drop_start_date ? 'upcoming' :
     now > drop_end_date ? 'past' :
     'current';
   ```

**Pros:** No manual updates needed, automatic transitions
**Cons:** Requires date logic in frontend

**Implementation:**
```typescript
function getDropStatus(collection: ShopifyCollection): 'current' | 'past' | 'upcoming' {
  const now = new Date();
  const startDate = collection.dropStartDate ? new Date(collection.dropStartDate) : null;
  const endDate = collection.dropEndDate ? new Date(collection.dropEndDate) : null;

  if (startDate && now < startDate) return 'upcoming';
  if (endDate && now > endDate) return 'past';
  return 'current';
}
```

### Option 3: Hybrid (Best of Both)

- Use `drop_status` metafield as override
- If not set, calculate from dates
- Allows manual control when needed + automatic transitions

---

## Migration from Current System

### Current System Issues

❌ Products tagged `current-drop` → flat list, loses drop context
❌ No way to browse "Drop 05" as a cohesive collection
❌ Moving products to archive loses drop association
❌ Can't feature both a current drop AND perennial items

### New System Benefits

✅ Each drop is browsable: `/collections/drop-05-winter-2025`
✅ Past drops preserve their identity and theme
✅ Can have multiple current drops simultaneously
✅ Perennial items clearly separated from time-limited drops
✅ Flexible home page featuring (drops OR perennials)

### Migration Steps

**1. Create Drop Collections:**
```
drop-05-winter-2025
- is_drop: true
- drop_status: past
- drop_number: 5
- drop_season: Winter
- drop_year: 2025
- Add all current "current-drop" tagged products
```

**2. Create Perennial Collections:**
```
contributor-essentials
- is_perennial: true
- collection_type: essentials
- Add tier-locked items that are always available
```

**3. Update Code:**
- Query collections instead of tagged products
- Filter by `is_drop` + `drop_status`
- Update Past Drops to show collection cards

**4. Deprecate Old Tags:**
- Remove `current-drop` and `past-drop` tags
- Keep category tags (clothing, drinkware, etc.)

---

## Content Update Workflows

### Launching a New Drop

**Week 1: Preparation**
1. Create collection: `drop-07-summer-2025`
2. Set metafields:
   - `is_drop: true`
   - `drop_status: upcoming`
   - `drop_number: 7`
   - `drop_start_date: 2025-06-01`
   - `drop_end_date: 2025-08-31`
   - `drop_season: Summer`
   - `drop_year: 2025`
3. Add products to collection (but don't publish products yet)

**Week 2: Tease (Optional)**
- Products still unpublished
- Collection visible with "Coming Soon" badge
- Builds anticipation

**Drop Day:**
1. Publish all products in the drop
2. Change `drop_status: upcoming` → `current`
3. Drop automatically appears in "Limited Drops" section

**After Drop Ends:**
1. Change `drop_status: current` → `past`
2. Drop moves to "Past Drops Archive"
3. Products still available (unless sold out)
4. Drop browsable at `/collections/drop-07-summer-2025`

### Managing Perennial Items

**Adding New Essentials:**
1. Create product in Shopify
2. Add to `contributor-essentials` collection
3. Set `is_perennial: true` on product (optional)
4. Automatically always visible

**Seasonal Restocks:**
- Update inventory in Shopify
- No collection or metafield changes needed

---

## URL Structure

| URL | Shows |
|-----|-------|
| `/` | Home page (current drops + featured collections) |
| `/collections` | All collections (grouped by type) |
| `/collections/drop-05-winter-2025` | Specific drop page with all products |
| `/collections/contributor-essentials` | Perennial collection page |
| `/products/fiber-shell` | Individual product detail |

---

## Shopify Admin Quick Reference

### Creating a Drop Collection

```
Title: Drop 05 · Winter 2025
Handle: drop-05-winter-2025
Description: React Fiber themed drop featuring technical outerwear...

Metafields:
✅ is_drop: true
✅ drop_status: current
✅ drop_number: 5
✅ drop_season: Winter
✅ drop_year: 2025
✅ drop_start_date: 2025-01-15
✅ accent_gradient: from-sky-400 via-indigo-500 to-purple-500

Collection type: Manual
Products: (add products manually)
```

### Creating a Perennial Collection

```
Title: Contributor Essentials
Handle: contributor-essentials
Description: Always-available gear for OSS contributors...

Metafields:
✅ is_perennial: true
✅ collection_type: essentials
✅ home_featured: true (if you want it on home page)
✅ home_featured_order: 1

Collection type: Manual OR Automated (tag: contributor-essentials)
```

---

## Advanced: Programmatic Status Updates

### Using Shopify CLI

You mentioned having access to Shopify CLI. Here's how to bulk update drop statuses:

**Script: Archive all past drops**
```bash
# Get all drop collections
shopify theme liquid collections --format=json > collections.json

# Filter drops with end_date < today
# Update drop_status to "past"

shopify metafields set \
  --namespace react_foundation \
  --key drop_status \
  --value "past" \
  --type single_line_text_field \
  --owner-resource collections \
  --owner-id gid://shopify/Collection/12345
```

**Scheduled Job (Optional):**
- Run daily via GitHub Actions or cron
- Automatically archives drops when end_date passes
- Promotes upcoming → current on start_date

---

## Testing Checklist

### After Setting Up Taxonomy

- [ ] Create test drop collection with `drop_status: current`
- [ ] Add 3-5 products to drop
- [ ] Verify drop shows in "Limited Drops" on home page
- [ ] Change `drop_status` to `past`
- [ ] Verify drop moves to "Past Drops Archive"
- [ ] Create perennial collection
- [ ] Verify it stays visible regardless of dates
- [ ] Set `home_featured: true` on 3 collections
- [ ] Verify they show in "Signature Collections"

---

## Benefits of New Taxonomy

✅ **Scalable** - Add unlimited drops without code changes
✅ **Context-preserving** - Each drop maintains its theme and identity
✅ **Flexible** - Mix perennial and drop items in featured sections
✅ **Time-aware** - Can auto-transition based on dates
✅ **Browsable history** - Past drops are explorable collections
✅ **SEO-friendly** - Each drop has its own URL and metadata
✅ **Marketing-ready** - Can tease upcoming drops

---

## Next Steps

1. Review this taxonomy with your team
2. Decide on manual vs. automated status transitions
3. Create metafield definitions in Shopify
4. Migrate existing products to drop collections
5. Update frontend queries to use new taxonomy
6. Test thoroughly before going live

---

*Last updated: October 2025*
*For implementation details, see SHOPIFY_CMS_GUIDE.md*
