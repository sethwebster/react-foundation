# Metafields Reference

Quick reference for all React Foundation custom metafields.

**Namespace:** `react_foundation`

---

## Collection Metafields (14)

### Drop Configuration

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `is_drop` | boolean | ✅ | Marks as time-limited drop | `true` |
| `drop_number` | number_integer | ✅ | Sequential drop number | `8` |
| `drop_start_date` | date | ✅ | Drop goes live (YYYY-MM-DD) | `2025-10-01` |
| `drop_end_date` | date | ✅ | Drop ends (YYYY-MM-DD) | `2025-11-30` |
| `drop_season` | single_line_text | ✅ | Season | `Fall`, `Winter`, `Spring`, `Summer` |
| `drop_year` | number_integer | ✅ | Year | `2025` |
| `drop_theme` | single_line_text | ✅ | Theme name | `Neon Pulse`, `Ocean Breeze` |
| `limited_edition_size` | number_integer | ❌ | Total units available | `500` |

### Perennial Collections

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `is_perennial` | boolean | ✅ | Always-available | `true` |
| `collection_type` | single_line_text | ✅ | Category | `essentials`, `apparel`, `accessories`, `drinkware` |
| `time_limited` | boolean | ❌ | Time-limited (non-drop) | `true` |

### Display & Theming

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `home_featured` | boolean | ❌ | Show in Signature Collections | `true` |
| `home_featured_order` | number_integer | ❌ | Order (1-3) | `1`, `2`, `3` |
| `accent_gradient` | single_line_text | ❌ | Tailwind gradient | `from-sky-400 via-indigo-500 to-purple-500` |

---

## Product Metafields (12)

### Home Page Features

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `is_hero` | boolean | ❌ | Mark as hero product | `true` |
| `featured_look_order` | number_integer | ❌ | Order in Featured Look (1-3) | `1`, `2`, `3` |

### Access Control

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `unlock_tier` | single_line_text | ❌ | Required tier | `contributor`, `sustainer`, `core` |
| `is_perennial` | boolean | ❌ | Always available | `true` |

### Display & Metadata

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `tagline` | single_line_text | ✅ | Short description | `Built for the ecosystem` |
| `release_window` | single_line_text | ✅ | Release info | `Drop 08 · Fall 2025` |
| `accent_gradient` | single_line_text | ❌ | Tailwind gradient | `from-emerald-400 to-cyan-500` |

### Reviews & Social Proof

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `rating` | number_decimal | ❌ | Rating (0-5) | `4.7` |
| `rating_count` | number_integer | ❌ | Number of reviews | `142` |

### Product Details (JSON)

| Key | Type | Required | Description | Example |
|-----|------|----------|-------------|---------|
| `features` | json | ✅ | Feature list | `["Premium cotton", "Unisex fit"]` |
| `highlights` | json | ❌ | Impact highlights | `["Funds 3 maintainers"]` |
| `specs` | json | ✅ | Spec objects | `[{"label":"Fit","value":"Unisex"}]` |

---

## JSON Field Examples

### Features

```json
[
  "Premium heavyweight cotton blend",
  "Unisex relaxed fit",
  "Screen-printed React logo",
  "Reinforced double stitching",
  "Pre-shrunk for lasting fit"
]
```

### Highlights

```json
[
  "Supports 3 ecosystem maintainers",
  "Carbon-neutral production",
  "Limited to 500 units worldwide",
  "Ethically sourced materials"
]
```

### Specs

```json
[
  {
    "label": "Fit",
    "value": "Unisex relaxed"
  },
  {
    "label": "Material",
    "value": "100% organic cotton"
  },
  {
    "label": "Weight",
    "value": "350gsm heavyweight"
  },
  {
    "label": "Care",
    "value": "Machine wash cold, tumble dry low"
  },
  {
    "label": "Origin",
    "value": "Made in USA"
  }
]
```

---

## Tailwind Gradient Examples

### Blue/Purple Theme
```
from-sky-400 via-indigo-500 to-purple-500
```

### Cyan/Teal Theme
```
from-cyan-400 via-blue-500 to-teal-600
```

### React Brand Colors
```
from-cyan-300 via-blue-400 to-indigo-500
```

### Emerald/Green Theme
```
from-emerald-400 via-teal-500 to-cyan-600
```

### Warm Theme
```
from-orange-400 via-red-500 to-pink-600
```

### Neon Theme
```
from-fuchsia-500 via-purple-600 to-indigo-700
```

---

## GraphQL Query Examples

### Fetch Collection with All Metafields

```graphql
query getCollection($handle: String!) {
  collectionByHandle(handle: $handle) {
    id
    handle
    title
    description
    image { url }

    # Drop metafields
    isDrop: metafield(namespace: "react_foundation", key: "is_drop") { value }
    dropNumber: metafield(namespace: "react_foundation", key: "drop_number") { value }
    dropStartDate: metafield(namespace: "react_foundation", key: "drop_start_date") { value }
    dropEndDate: metafield(namespace: "react_foundation", key: "drop_end_date") { value }
    dropSeason: metafield(namespace: "react_foundation", key: "drop_season") { value }
    dropYear: metafield(namespace: "react_foundation", key: "drop_year") { value }
    dropTheme: metafield(namespace: "react_foundation", key: "drop_theme") { value }
    limitedEditionSize: metafield(namespace: "react_foundation", key: "limited_edition_size") { value }

    # Perennial metafields
    isPerennial: metafield(namespace: "react_foundation", key: "is_perennial") { value }
    collectionType: metafield(namespace: "react_foundation", key: "collection_type") { value }
    timeLimited: metafield(namespace: "react_foundation", key: "time_limited") { value }

    # Display metafields
    homeFeatured: metafield(namespace: "react_foundation", key: "home_featured") { value }
    homeFeaturedOrder: metafield(namespace: "react_foundation", key: "home_featured_order") { value }
    accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") { value }
  }
}
```

### Fetch Product with All Metafields

```graphql
query getProduct($handle: String!) {
  productByHandle(handle: $handle) {
    id
    handle
    title
    description

    # Home page metafields
    isHero: metafield(namespace: "react_foundation", key: "is_hero") { value }
    featuredLookOrder: metafield(namespace: "react_foundation", key: "featured_look_order") { value }

    # Access metafields
    unlockTier: metafield(namespace: "react_foundation", key: "unlock_tier") { value }
    isPerennial: metafield(namespace: "react_foundation", key: "is_perennial") { value }

    # Display metafields
    tagline: metafield(namespace: "react_foundation", key: "tagline") { value }
    releaseWindow: metafield(namespace: "react_foundation", key: "release_window") { value }
    accentGradient: metafield(namespace: "react_foundation", key: "accent_gradient") { value }

    # Reviews metafields
    rating: metafield(namespace: "react_foundation", key: "rating") { value }
    ratingCount: metafield(namespace: "react_foundation", key: "rating_count") { value }

    # Product details (JSON)
    features: metafield(namespace: "react_foundation", key: "features") { value }
    highlights: metafield(namespace: "react_foundation", key: "highlights") { value }
    specs: metafield(namespace: "react_foundation", key: "specs") { value }
  }
}
```

---

## Validation Rules

### Collection Metafields

- `drop_number`: min = 1
- `drop_year`: min = 2025
- `drop_season`: choices = `["Winter", "Spring", "Summer", "Fall"]`
- `collection_type`: choices = `["essentials", "apparel", "accessories", "drinkware"]`
- `home_featured_order`: min = 1, max = 3

### Product Metafields

- `featured_look_order`: min = 1, max = 3
- `unlock_tier`: choices = `["contributor", "sustainer", "core"]`
- `rating`: min = 0, max = 5
- `rating_count`: min = 0

---

## Important Notes

### Boolean Parsing

Shopify returns boolean metafields as capital `"True"` or `"False"` strings.

Always use:
```typescript
node.isDrop?.value?.toLowerCase() === 'true'
```

### Storefront Access

**Critical:** All metafields MUST have "Storefront access" enabled:

1. Settings → Custom data
2. Click metafield definition
3. Scroll to "Storefront access"
4. Check "Expose via Storefront API"
5. Save

Without this, metafields return `null` from GraphQL.

### JSON Formatting

JSON metafields must be valid JSON arrays/objects:

**Valid:**
```json
["Item 1", "Item 2"]
```

**Invalid:**
```
Item 1, Item 2
```

Test with:
```bash
echo '["Item 1"]' | jq .
```

---

## Setup Commands

**Create all metafield definitions:**
```bash
npm run shopify:setup-metafields
```

**Clean up obsolete metafields:**
```bash
npm run shopify:cleanup-metafields
```

---

**Last Updated:** October 2025
