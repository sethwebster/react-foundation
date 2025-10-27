# Documentation Reorganization Plan

**Date**: October 26, 2025
**Status**: Proposed

## Goals

1. **Clear separation**: Internal developer docs vs external public docs
2. **Logical grouping**: By feature area (foundation, store, chatbot, development)
3. **Clean root**: Only essential files at root level
4. **No duplicates**: Single source of truth for each topic
5. **Easy navigation**: Clear index files and cross-references

## Proposed Structure

```
react-foundation-store/
├── README.md                          # Main README (consolidated & updated)
├── CLAUDE.md                          # Keep - AI development instructions
├── CONTRIBUTING.md                    # New - contributor guidelines
│
├── docs/                              # INTERNAL DEVELOPER DOCUMENTATION
│   ├── README.md                      # **NEW** - Index of all internal docs
│   │
│   ├── getting-started/               # **NEW** - Setup & onboarding
│   │   ├── README.md                  # Getting started index
│   │   ├── local-setup.md             # From README.md + consolidation
│   │   ├── deployment.md              # From DEPLOYMENT_GUIDE.md
│   │   └── troubleshooting.md         # General troubleshooting
│   │
│   ├── architecture/                  # **NEW** - System design
│   │   ├── README.md                  # Architecture index
│   │   ├── overview.md                # High-level architecture
│   │   ├── data-flow.md               # How data flows through system
│   │   └── tech-stack-deep-dive.md    # Detailed tech explanations
│   │
│   ├── foundation/                    # Foundation-specific developer docs
│   │   ├── README.md                  # **NEW** - Foundation docs index
│   │   ├── content-taxonomy.md        # From docs/foundation/CONTENT_TAXONOMY.md
│   │   ├── design-system.md           # From docs/foundation/DESIGN_SYSTEM.md
│   │   ├── revenue-distribution.md    # From docs/foundation/REVENUE_DISTRIBUTION_MODEL.md
│   │   ├── shopify-cms-guide.md       # From docs/foundation/SHOPIFY_CMS_GUIDE.md
│   │   ├── shopify-setup.md           # From docs/foundation/SHOPIFY_SETUP.md
│   │   └── impact-systems.md          # From docs/IMPACT_SCORING_SYSTEMS.md
│   │
│   ├── store/                         # Store-specific developer docs
│   │   ├── README.md                  # **UPDATE** - Store docs index
│   │   ├── store-management.md        # Keep - docs/store/STORE_MANAGEMENT.md
│   │   ├── metafields-reference.md    # Keep - docs/store/METAFIELDS_REFERENCE.md
│   │   ├── quick-start.md             # Keep - docs/store/QUICK_START.md
│   │   └── shopify-scripts.md         # From scripts/README.md + consolidation
│   │
│   ├── chatbot/                       # **NEW** - Chatbot & ingestion system
│   │   ├── README.md                  # **NEW** - Chatbot docs index
│   │   ├── architecture.md            # From docs/AUTO_INGESTION_SETUP.md
│   │   ├── data-sources.md            # From README-DATA-SOURCES.md
│   │   ├── ingestion-guide.md         # From docs/BLUE_GREEN_INGESTION.md + others
│   │   ├── crawler-bypass.md          # From docs/CRAWLER_BYPASS_SETUP.md
│   │   └── troubleshooting.md         # From docs/INGESTION_TROUBLESHOOTING.md
│   │
│   ├── community/                     # Community & educator systems
│   │   ├── README.md                  # **NEW** - Community systems index
│   │   ├── educator-and-community.md  # From docs/EDUCATOR_AND_COMMUNITY_SYSTEMS.md
│   │   ├── community-toolkit.md       # From docs/community/COMMUNITY_BUILDING_TOOLKIT.md
│   │   └── data-fixes.md              # From docs/FIX_STALE_COMMUNITY_DATA.md
│   │
│   └── development/                   # **NEW** - Development guides
│       ├── README.md                  # **NEW** - Development guides index
│       ├── theming.md                 # From THEMING_GUIDE.md
│       ├── ris-setup.md               # From RIS_SETUP.md
│       └── ecosystem-libraries.md     # From ECOSYSTEM_LIBRARIES.md
│
├── public-context/                    # EXTERNAL/PUBLIC DOCUMENTATION
│   │                                  # (Keep current structure - it's good!)
│   ├── README.md                      # Keep - explains chatbot ingestion
│   ├── faq.md                         # Keep
│   ├── development/                   # Keep
│   │   ├── design-system-overview.md
│   │   └── tech-stack.md
│   ├── foundation/                    # Keep
│   │   ├── foundation-overview.md
│   │   ├── ris-system.md
│   │   ├── cis-system.md
│   │   └── cois-system.md
│   ├── getting-involved/              # Keep
│   │   ├── contributor-tracking.md
│   │   ├── educator-program.md
│   │   └── community-building-guide.md
│   └── store/                         # Keep
│       ├── store-overview.md
│       └── drops-explained.md
│
├── src/lib/                           # CODE DOCUMENTATION (no changes)
│   ├── cis/README.md                  # Keep with code
│   └── ris/
│       ├── README.md                  # Keep with code
│       └── INCREMENTAL_COLLECTION.md  # Keep with code
│
└── archive/                           # **NEW** - Outdated/historical docs
    ├── README.md                      # **NEW** - Explains archive purpose
    ├── AGENTS.md                      # Old - unclear purpose
    ├── CHECKPOINTS.md                 # Old - unclear purpose
    ├── STATUS.md                      # Old - Oct 19 session notes
    ├── MIGRATION_PLAN.md              # Old - Oct 19 migration
    ├── MIGRATION_SUMMARY.md           # Old - Oct 19 migration
    ├── LOADER_ARCHITECTURE_STATUS.md  # Old - status doc
    ├── README_STORE.md                # Duplicate of README.md
    ├── INGESTION_TROUBLESHOOTING.md   # Duplicate (root copy)
    └── chatbot-plan.md                # Old - from docs/chatbot-plan.md

```

## File Actions

### Root Level Cleanup

| Current File | Action | New Location |
|--------------|--------|--------------|
| `README.md` | **Update** | Same (consolidate content) |
| `CLAUDE.md` | **Keep** | Same |
| `CONTRIBUTING.md` | **Create** | New file |
| `AGENTS.md` | **Archive** | `archive/AGENTS.md` |
| `CHECKPOINTS.md` | **Archive** | `archive/CHECKPOINTS.md` |
| `STATUS.md` | **Archive** | `archive/STATUS.md` |
| `MIGRATION_PLAN.md` | **Archive** | `archive/MIGRATION_PLAN.md` |
| `MIGRATION_SUMMARY.md` | **Archive** | `archive/MIGRATION_SUMMARY.md` |
| `LOADER_ARCHITECTURE_STATUS.md` | **Archive** | `archive/LOADER_ARCHITECTURE_STATUS.md` |
| `README_STORE.md` | **Archive** | `archive/README_STORE.md` (duplicate) |
| `README-DATA-SOURCES.md` | **Move** | `docs/chatbot/data-sources.md` |
| `DEPLOYMENT_GUIDE.md` | **Move** | `docs/getting-started/deployment.md` |
| `THEMING_GUIDE.md` | **Move** | `docs/development/theming.md` |
| `RIS_SETUP.md` | **Move** | `docs/development/ris-setup.md` |
| `ECOSYSTEM_LIBRARIES.md` | **Move** | `docs/development/ecosystem-libraries.md` |
| `INGESTION_TROUBLESHOOTING.md` | **Archive** | `archive/` (duplicate) |

### docs/ Reorganization

| Current File | Action | New Location |
|--------------|--------|--------------|
| `docs/AUTO_INGESTION_SETUP.md` | **Move** | `docs/chatbot/architecture.md` |
| `docs/BLUE_GREEN_INGESTION.md` | **Consolidate** | `docs/chatbot/ingestion-guide.md` |
| `docs/CRAWLER_BYPASS_SETUP.md` | **Move** | `docs/chatbot/crawler-bypass.md` |
| `docs/DATA_IMPORT_SCHEMA.md` | **Move** | `docs/chatbot/data-import-schema.md` |
| `docs/INGESTION_SUMMARY.md` | **Consolidate** | `docs/chatbot/ingestion-guide.md` |
| `docs/INGESTION_TROUBLESHOOTING.md` | **Move** | `docs/chatbot/troubleshooting.md` |
| `docs/PUPPETEER_PAGES_LOADER.md` | **Move** | `docs/chatbot/puppeteer-loader.md` |
| `docs/IMPACT_SCORING_SYSTEMS.md` | **Move** | `docs/foundation/impact-systems.md` |
| `docs/EDUCATOR_AND_COMMUNITY_SYSTEMS.md` | **Move** | `docs/community/educator-and-community.md` |
| `docs/FIX_STALE_COMMUNITY_DATA.md` | **Move** | `docs/community/data-fixes.md` |
| `docs/chatbot-plan.md` | **Archive** | `archive/chatbot-plan.md` |
| `docs/TODO-streaming-responses.md` | **Delete** | (TODO file, not documentation) |
| `docs/community/COMMUNITY_BUILDING_TOOLKIT.md` | **Move** | `docs/community/community-toolkit.md` |
| `docs/foundation/*` | **Move** | `docs/foundation/` (new structure) |
| `docs/store/*` | **Keep** | Same (already well organized) |

### scripts/ Consolidation

| Current File | Action | New Location |
|--------------|--------|--------------|
| `scripts/README.md` | **Consolidate** | `docs/store/shopify-scripts.md` |
| `scripts/SHOPIFY_QUICKSTART.md` | **Consolidate** | `docs/store/shopify-scripts.md` |
| `scripts/SHOPIFY_SETUP.md` | **Consolidate** | `docs/store/shopify-scripts.md` |

### New Files to Create

| File | Purpose |
|------|---------|
| `docs/README.md` | Index of all internal developer documentation |
| `docs/getting-started/README.md` | Getting started section index |
| `docs/architecture/README.md` | Architecture section index |
| `docs/foundation/README.md` | Foundation docs index |
| `docs/chatbot/README.md` | Chatbot system docs index |
| `docs/community/README.md` | Community systems docs index |
| `docs/development/README.md` | Development guides index |
| `archive/README.md` | Explains archive purpose and contents |
| `CONTRIBUTING.md` | Contributor guidelines |

## Benefits

### For Developers

1. **Clear entry point**: `docs/README.md` guides you to the right section
2. **Logical grouping**: Foundation, store, chatbot, community systems
3. **No hunting**: All dev docs in `docs/`, organized by topic
4. **Clean root**: No clutter, easy to find main README and CLAUDE.md

### For External Users (Chatbot)

1. **No changes**: `public-context/` structure stays the same
2. **Clear separation**: Public docs separate from internal dev docs
3. **Well maintained**: Easier to keep public docs updated

### For Maintenance

1. **Single source of truth**: No more duplicates
2. **Clear ownership**: Each doc has a clear purpose and location
3. **Historical record**: Archive preserves old docs without cluttering
4. **Easy updates**: Know exactly where to update docs

## Implementation Steps

1. **Create new directory structure**
   - Create `docs/getting-started/`, `docs/architecture/`, `docs/chatbot/`, etc.
   - Create `archive/`

2. **Move and consolidate files**
   - Move files from root to appropriate `docs/` subdirectories
   - Consolidate related docs (e.g., ingestion docs, script docs)
   - Archive outdated files

3. **Create index files**
   - `docs/README.md` - Main developer docs index
   - Section `README.md` files for each subdirectory

4. **Update main README.md**
   - Consolidate content from `README_STORE.md`
   - Update links to new documentation structure
   - Add clear navigation to docs sections

5. **Update cross-references**
   - Update links in CLAUDE.md
   - Update links between documentation files
   - Verify all internal links work

6. **Create CONTRIBUTING.md**
   - Extract contributor info from README
   - Add documentation contribution guidelines

7. **Test and verify**
   - Check all links work
   - Verify nothing important was lost
   - Test chatbot ingestion still works with `public-context/`

## Success Criteria

- ✅ Root level has only 3-4 markdown files (README, CLAUDE, CONTRIBUTING)
- ✅ All developer docs organized in `docs/` by topic
- ✅ No duplicate documentation
- ✅ Clear index files for navigation
- ✅ All internal links work
- ✅ public-context/ unchanged and working
- ✅ Old docs archived with explanation

## Notes

- **public-context/** is NOT changed - it's already well organized for chatbot ingestion
- **src/lib/** docs stay with code - this is good practice
- **scripts/** can keep actual scripts, but docs move to `docs/store/`
- **Archive** preserves history without cluttering - can delete later if truly not needed

---

**Status**: Ready for implementation
**Estimated effort**: 2-3 hours
**Risk**: Low (mostly file moves, can revert if needed)
