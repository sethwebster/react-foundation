# React Foundation Store Documentation

Complete documentation for managing and developing the React Foundation Shopify store.

---

## Documentation Index

### 📚 [Store Management Guide](./store-management.md)
**Complete store management guide** - 150+ page comprehensive reference

**Use this when:**
- Setting up the store for the first time
- Learning the system architecture
- Understanding drop lifecycle management
- Troubleshooting issues
- Need detailed explanations

**Covers:**
- System overview and architecture
- Initial setup (API tokens, metafields, configuration)
- Complete metafield taxonomy (26 fields)
- Drop management (create, configure, transitions)
- Product management workflows
- Collection types and organization
- All management scripts with examples
- Daily workflows and processes
- Comprehensive troubleshooting guide

---

### 📖 [Metafields Reference](./metafields-reference.md)
**Quick metafield reference** - All 26 metafields at a glance

**Use this when:**
- Adding metafields to products/collections
- Looking up metafield types and formats
- Writing GraphQL queries
- Need JSON examples for features/specs
- Want Tailwind gradient examples

**Covers:**
- 14 collection metafields (detailed table)
- 12 product metafields (detailed table)
- JSON field examples (features, highlights, specs)
- Tailwind gradient examples
- GraphQL query examples
- Validation rules
- Boolean parsing notes

---

### ⚡ [Quick Start Guide](./quick-start.md)
**Fast reference for daily tasks** - Cheat sheet

**Use this when:**
- Creating a new drop (quick steps)
- Adding products to collections
- Generating AI images
- Need script commands
- Quick troubleshooting
- Daily operations

**Covers:**
- Setup checklist (environment, metafields)
- Daily task commands
- Common metafield values (copy-paste ready)
- Inventory display rules
- Quick troubleshooting
- All script commands
- File locations

---

### 🔧 [Shopify Scripts](./shopify-scripts.md)
**CLI tools for managing Shopify** - Script reference and guide

**Use this when:**
- Running management scripts
- Need Shopify setup instructions
- Creating drops via command line
- Seeding products
- Managing images
- Troubleshooting API issues

**Covers:**
- Getting API credentials
- All management scripts
- Drop workflow automation
- Product seeding
- Image management
- Troubleshooting guide
- Metafield setup

---

## Quick Navigation

### I want to...

**Set up the store from scratch**
→ Start with [Store Management Guide](./store-management.md#initial-setup)

**Create a new drop collection**
→ [Quick Start](./quick-start.md#create-a-new-drop) or [Store Management Guide](./store-management.md#creating-a-new-drop)

**Add metafields to a product**
→ [Metafields Reference](./metafields-reference.md#product-metafields-12) or [Store Management Guide](./store-management.md#adding-products-to-a-drop)

**Generate collection images**
→ [Quick Start](./quick-start.md#generate-collection-image) or [Store Management Guide](./store-management.md#collection-images)

**Understand drop lifecycle**
→ [Store Management Guide](./store-management.md#drop-lifecycle)

**Troubleshoot metafields not showing**
→ [Store Management Guide](./store-management.md#metafields-not-showing-on-frontend) or [Quick Start](./quick-start.md#troubleshooting)

**Look up a script command**
→ [Quick Start](./quick-start.md#scripts-reference) or [Shopify Scripts](./shopify-scripts.md)

**See metafield examples**
→ [Metafields Reference](./metafields-reference.md#json-field-examples)

**Understand inventory display**
→ [Quick Start](./quick-start.md#inventory-display-rules) or [Store Management Guide](./store-management.md#inventory-management)

---

## Document Comparison

| Feature | STORE_MANAGEMENT | METAFIELDS_REFERENCE | QUICK_START |
|---------|-----------------|---------------------|-------------|
| **Scope** | Complete system | Metafields only | Daily tasks |
| **Detail** | Comprehensive | Medium | Brief |
| **Length** | ~150 pages | ~20 pages | ~10 pages |
| **Use case** | Learning, reference | Field reference | Quick lookup |
| **Examples** | ✅ Many | ✅ Many | ✅ Few |
| **Troubleshooting** | ✅ Extensive | ❌ | ✅ Basic |
| **Setup guide** | ✅ Detailed | ❌ | ✅ Checklist |
| **GraphQL** | ✅ Yes | ✅ Yes | ❌ |

---

## Key Concepts

### Metafield Namespace
All custom fields use: **`react_foundation`**

### Drop Status Transitions
```
CREATE → UPCOMING → CURRENT → PAST
         ↑          ↑          ↑
     start_date  (active)  end_date
```

Status is **automatic** - calculated from dates, not stored.

### Inventory Display
- **>= 999**: "Made to order" (print-on-demand)
- **6-998**: "X available"
- **1-5**: "Only X left"
- **0**: "Sold out"

### Critical Setup Step
All metafields MUST have **"Storefront access" enabled** in Shopify Admin, or they return `null` from GraphQL.

---

## Common Scripts

```bash
# Setup (first time)
npm run shopify:setup-metafields

# Create drop
npm run drops:create 8 Fall 2025 "Theme Name"

# List drops
npm run drops:list

# Generate images
npm run collections:generate-images
npm run collections:generate-images drop-08-fall-2025
npm run collections:generate-images --force

# Development
npm run dev
npm run build
```

---

## Getting Help

1. **Quick answer:** Check [Quick Start Guide](./quick-start.md)
2. **Need details:** Check [Store Management Guide](./store-management.md)
3. **Metafield info:** Check [Metafields Reference](./metafields-reference.md)
4. **Script help:** Check [Shopify Scripts](./shopify-scripts.md)
5. **API issues:** Run `npm run shopify:test-storefront`
6. **Still stuck:** Check troubleshooting sections

---

## Documentation Structure

```
docs/store/
├── README.md                   # This file - documentation index
├── store-management.md         # Complete guide (150+ pages)
├── metafields-reference.md     # Metafield reference (~20 pages)
├── quick-start.md              # Quick reference (~10 pages)
└── shopify-scripts.md          # Script reference and guide
```

---

## For New Team Members

**Recommended reading order:**

1. **[Quick Start Guide](./quick-start.md)** - Get oriented (10 min)
2. **[Store Management Guide](./store-management.md) - Setup section** - Configure environment (30 min)
3. **[Store Management Guide](./store-management.md) - Drop Management** - Learn drop workflow (20 min)
4. **[Metafields Reference](./metafields-reference.md)** - Bookmark for daily use (5 min)
5. **[Shopify Scripts](./shopify-scripts.md)** - Learn CLI tools (10 min)

Then use as reference material.

---

## Maintenance

**Update these docs when:**
- Adding new metafields
- Changing drop workflow
- Adding new scripts
- Updating API versions
- Changing taxonomy

**Last updated:** October 2025
