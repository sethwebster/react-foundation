# React Impact Score (RIS) System

This directory contains the complete implementation of the React Impact Score (RIS) system for evaluating and funding React ecosystem libraries.

## Overview

The RIS system provides a comprehensive, transparent, and fair method to:
1. **Measure** the impact of React ecosystem libraries across 5 key dimensions
2. **Score** each library on a 0-1 scale based on multiple metrics
3. **Allocate** funding proportionally based on impact scores

## Architecture

```
src/lib/ris/
├── types.ts              # TypeScript type definitions
├── normalization.ts      # Statistical normalization utilities
├── scoring-service.ts    # Main RIS calculation engine
├── hooks.ts              # React hooks for using RIS in components
├── mock-data.ts          # Sample data for testing/demos
├── index.ts              # Public API exports
└── README.md             # This file
```

## Core Concepts

### Five Components (with weights)

1. **Ecosystem Footprint (30%)** - How widely used and adopted
2. **Contribution Quality (25%)** - Quality of contributions and maintenance
3. **Maintainer Health (20%)** - Sustainability of the team
4. **Community Benefit (15%)** - Educational value and support
5. **Mission Alignment (10%)** - Alignment with React's goals

### Scoring Formula

```
RIS = 0.30×EF + 0.25×CQ + 0.20×MH + 0.15×CB + 0.10×MA
```

Each component is calculated from multiple normalized metrics (see `types.ts` for details).

### Revenue Allocation

```
Allocation = (Library_RIS / Total_RIS) × Available_Pool
```

With safeguards:
- **Floor**: Minimum $5,000 per library
- **Cap**: Maximum 12% of total pool
- **Reserve**: 10% held for emergencies/appeals

## Usage

### Basic Usage

```typescript
import { RISScoringService, type LibraryRawMetrics } from '@/lib/ris';

// Your raw metrics data
const rawMetrics: LibraryRawMetrics[] = [...];

// Create service instance
const service = new RISScoringService();

// Calculate scores
const scores = service.calculateScores(rawMetrics);

// Allocate revenue
const allocation = service.generateQuarterlyAllocation(
  rawMetrics,
  1_000_000, // $1M pool
  '2025-Q4'
);
```

### Using React Hooks

```typescript
'use client';

import { useSampleRISData, useRISRankings } from '@/lib/ris';

export function MyComponent() {
  // Get sample data
  const allocation = useSampleRISData(1_000_000, '2025-Q4');

  // Get ranked libraries
  const rankings = useRISRankings(allocation.libraries);

  // Display rankings...
}
```

### Available Hooks

- `useRISScores()` - Calculate RIS scores
- `useQuarterlyAllocation()` - Generate full allocation
- `useLibraryScore()` - Get single library score
- `useRISRankings()` - Sort and rank libraries
- `useRISFiltered()` - Filter by minimum RIS
- `useRISByCategory()` - Group by category
- `useComponentStats()` - Get component statistics
- `useSampleRISData()` - Use demo data
- `useInteractiveRIS()` - Interactive exploration with state

## Components

### Available UI Components

Located in `src/components/ris/`:

1. **RISScoreBreakdown** - Detailed breakdown of a library's score
2. **RISLibraryRankings** - Sortable library rankings table

### Example Usage

```typescript
import { RISScoreBreakdown, RISLibraryRankings } from '@/components/ris';

<RISLibraryRankings
  libraries={allocation.libraries}
  showAllocation={true}
  highlightTop={3}
/>

<RISScoreBreakdown
  score={libraryScore}
  showAllocation={true}
  showRawMetrics={true}
/>
```

## Pages

### /scoring - How Scoring Works

Simple, 5th-grade-level explanation of the RIS system. Perfect for:
- Users new to the system
- Public documentation
- Educational purposes

Located at: `src/app/scoring/page.tsx`

### /libraries - Library Impact Dashboard

Interactive demo showing:
- Library rankings by RIS score
- Component score breakdowns
- Funding allocations
- Detailed metrics for each library

Located at: `src/app/libraries/page.tsx`

## Data Flow

```
1. Collect Raw Metrics
   ↓
2. Winsorize (cap outliers at 5th/95th percentile)
   ↓
3. Normalize (min-max or log-normalize)
   ↓
4. Calculate Component Scores (EF, CQ, MH, CB, MA)
   ↓
5. Calculate Final RIS (weighted sum)
   ↓
6. Apply EMA Smoothing (with previous quarter)
   ↓
7. Allocate Revenue (proportional distribution)
   ↓
8. Apply Floor/Cap Safeguards
```

## Key Features

### Anti-Gaming Measures

- **Winsorization** - Caps extreme outliers
- **Quality over Quantity** - PR points based on impact, not just count
- **Multi-dimensional** - Can't game one metric to boost score
- **Transparent** - All calculations are public

### Statistical Rigor

- **Normalization** - Handles different scales fairly
- **Log Transforms** - Manages skewed distributions (downloads, etc.)
- **Smoothing** - EMA prevents quarter-to-quarter volatility
- **Percentile Capping** - Reduces outlier impact

### Transparency

- All raw metrics published
- All intermediate scores published
- Calculations are reproducible
- Open source implementation

## Configuration

Customize the RIS system via `RISConfig`:

```typescript
const customConfig = {
  weights: {
    EF: 0.35,  // Increase ecosystem weight
    CQ: 0.25,
    MH: 0.20,
    CB: 0.10,
    MA: 0.10,
  },
  minimum_floor_usd: 10000,  // Higher floor
  maximum_cap_percent: 0.15,  // Higher cap
  // ... more options
};

const service = new RISScoringService(customConfig);
```

See `types.ts` for all configuration options.

## Testing with Sample Data

```typescript
import { SAMPLE_RAW_METRICS } from '@/lib/ris';

// Use pre-populated sample data for 10 popular libraries
const service = new RISScoringService();
const scores = service.calculateScores(SAMPLE_RAW_METRICS);
```

## Metric Collection

### Required Metrics

Each library needs these raw metrics (see `LibraryRawMetrics` type):

**Ecosystem Footprint (EF)**
- `npm_downloads` - 12-month download count
- `gh_dependents` - GitHub dependent count
- `import_mentions` - Mentions in top repos
- `cdn_hits` - CDN request count (optional)

**Contribution Quality (CQ)**
- `pr_points` - Weighted PR impact score
- `issue_resolution_rate` - Closed/opened ratio
- `median_first_response_hours` - Response time
- `unique_contribs` - Unique contributors

**Maintainer Health (MH)**
- `active_maintainers` - Active team members
- `release_cadence_days` - Release frequency
- `top_author_share` - Bus factor proxy
- `triage_latency_hours` - Issue triage time
- `maintainer_survey` - Self-reported health

**Community Benefit (CB)**
- `docs_completeness` - Documentation coverage
- `tutorials_refs` - Tutorial citations
- `helpful_events` - Helpful answers/events
- `user_satisfaction` - User survey score

**Mission Alignment (MA)**
- `a11y_advances` - Accessibility score
- `perf_concurrency_support` - Performance score
- `typescript_strictness` - TypeScript adoption
- `rsc_compat_progress` - RSC compatibility
- `security_practices` - Security score (OSSF)

## Utilities

### Formatting Helpers

```typescript
import { formatRIS, formatAllocation } from '@/lib/ris';

formatRIS(0.672);        // "67.2%"
formatAllocation(84213); // "$84,213"
```

### Color Helpers

```typescript
import { getRISColorClass, getComponentColorClass } from '@/lib/ris';

// Returns Tailwind classes based on score
getRISColorClass(0.85);           // "text-green-400"
getComponentColorClass('EF');     // "bg-blue-500/20 text-blue-300"
```

## Future Enhancements

Potential improvements:
- Real-time data collection from GitHub API
- Integration with npm registry
- Historical trending (track RIS over time)
- Category-specific weights
- Machine learning for PR quality classification
- Automated data pipeline

## References

- Full specification: `/docs/foundation/REVENUE_DISTRIBUTION_MODEL.md`
- Explanation page: `/scoring` route
- Demo dashboard: `/libraries` route
- Original tracking: `ECOSYSTEM_LIBRARIES.md`

## License

Part of the React Foundation Store project.
