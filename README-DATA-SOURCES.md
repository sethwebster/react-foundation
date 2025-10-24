# Data Sources

## Single Source of Truth

**src/data/communities.ts** - The ONLY active data source for communities.

All community data lives here. Redis seeds from this file. Edits should be made here.

## Archived

**data/archive/normalized-meetups-data.json** - Original scraped data from react.dev (archived for reference)

## How to Update Communities

1. Edit `src/data/communities.ts` directly
2. Visit `/admin/reset` to re-seed Redis
3. Changes appear immediately

## Scripts

- `scripts/merge-all-communities.ts` - Regenerates communities.ts from multiple sources (deprecated)
- `scripts/verify-and-fix-meetup-urls.ts` - Verifies meetup.com links
