# Content Impact Score (CIS) System

The Content Impact Score (CIS) is a comprehensive scoring system for measuring and rewarding React educators and content creators based on their impact on the React community.

## Overview

The CIS system evaluates educators across 5 key components, each with specific weights and metrics:

### 1. **Educational Reach (ER) - 25%**
Measures how many people the educator reaches:
- Video views across platforms (35%)
- Unique learners reached (30%)
- Course enrollments (paid + free) (20%)
- Article/blog reads (10%)
- Geographic diversity (countries reached) (5%)

### 2. **Content Quality & Correctness (CQC) - 30%**
Evaluates the quality and accuracy of teaching:
- Peer review scores from React experts (35%)
- Automated code quality checks (25%)
- Community upvotes/engagement (20%)
- Alignment with official React docs (15%)
- Accuracy report ratio (inverted - fewer reports = better) (5%)

### 3. **Learning Outcomes (LO) - 25%**
Measures actual student success:
- Course/series completion rates (25%)
- Average time students spend learning (20%)
- Student feedback ratings (25%)
- Students who contribute to React ecosystem (tracked via RIS) (20%)
- Student career growth indicators (10%)

### 4. **Community Teaching Impact (CTI) - 15%**
Evaluates community-focused teaching:
- Free content ratio vs paid (30%)
- Accessibility features (captions, translations, beginner-friendly) (30%)
- Mentorship hours (office hours, Q&A) (25%)
- Beginner-focused content ratio (15%)

### 5. **Consistency & Longevity (CL) - 5%**
Rewards sustained, up-to-date teaching:
- Publishing frequency (30%)
- Content freshness (updates for new React versions) (35%)
- Years actively teaching React (20%)
- Update velocity (updates per content piece per year) (15%)

## Tier System

Educators are assigned to tiers based on their percentile rank:

| Tier | Percentile | Pool Share | Badge |
|------|------------|------------|-------|
| **Platinum** | Top 5% | 40% | 💎 |
| **Gold** | Top 15% | 35% | 🏆 |
| **Silver** | Top 30% | 20% | 🥈 |
| **Bronze** | Top 50% | 5% | 🥉 |
| **None** | Bottom 50% | 0% | 📚 |

## Usage

### Basic Scoring

```typescript
import { CISScoringService, type EducatorRawMetrics } from '@/lib/cis';

const service = new CISScoringService();

const rawMetrics: EducatorRawMetrics[] = [
  {
    educatorId: 'kent-c-dodds',
    name: 'Kent C. Dodds',
    platforms: ['epicreact.dev', 'youtube', 'twitter'],
    // ... metrics
  },
];

const scores = service.calculateScores(rawMetrics);
console.log(scores[0].cis); // Final CIS score (0-1)
```

### Quarterly Allocation with Revenue Distribution

```typescript
const allocation = service.generateQuarterlyAllocation(
  rawMetrics,
  100_000, // $100k pool
  '2025-Q1'
);

allocation.educators.forEach(educator => {
  console.log(`${educator.name}: ${educator.tier} - $${educator.allocation_usd}`);
});
```

### React Hooks

```typescript
'use client';

import { useCISScores, useCISRankings, useEducatorTier } from '@/lib/cis';
import { MOCK_EDUCATORS } from '@/lib/cis/mock-data';

function EducatorLeaderboard() {
  const scores = useCISScores(MOCK_EDUCATORS);
  const rankings = useCISRankings(scores);

  return (
    <div>
      {rankings.map(educator => {
        const tierBadge = useEducatorTier(educator.tier);
        return (
          <div key={educator.educatorId}>
            <h3>{educator.name}</h3>
            <div className={tierBadge.color}>
              {tierBadge.icon} {tierBadge.label}
            </div>
            <p>CIS: {educator.cis.toFixed(3)}</p>
            <p>Rank: #{educator.rank}</p>
            <p>Allocation: ${educator.allocation_usd.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );
}
```

## Configuration

Customize weights and thresholds:

```typescript
const customConfig: Partial<CISConfig> = {
  weights: {
    ER: 0.30,  // Increase reach weight
    CQC: 0.25, // Reduce quality weight
    LO: 0.25,
    CTI: 0.15,
    CL: 0.05,
  },
  minimum_floor_usd: 3000, // Higher floor
  maximum_cap_percent: 0.20, // Higher cap (20%)
  tier_thresholds: {
    platinum: 0.90, // More exclusive (top 10%)
    gold: 0.80,
    silver: 0.60,
    bronze: 0.40,
  },
};

const service = new CISScoringService(customConfig);
```

## Data Collection

### Required Metrics

To calculate CIS scores, you need to collect data from various sources:

#### Educational Reach
- **YouTube API**: Video views, unique viewers
- **Course Platforms**: Enrollment numbers (Udemy, Teachable, own platform)
- **Analytics**: Blog/article traffic (Google Analytics)
- **Geographic Data**: Country distribution from analytics

#### Content Quality
- **Peer Reviews**: Manual reviews by React experts (stored in database)
- **Code Analysis**: Automated linting/quality checks on example code
- **Community Engagement**: Upvotes/likes from platforms
- **Accuracy Reports**: User-submitted issue reports

#### Learning Outcomes
- **Course Analytics**: Completion rates, time spent
- **Surveys**: Student feedback ratings (1-5 stars, normalized to 0-1)
- **RIS Cross-Reference**: Track if students contribute to React libraries
- **LinkedIn API** (opt-in): Career progression data

#### Community Impact
- **Content Audit**: Manual categorization of free vs paid, beginner vs advanced
- **Accessibility Audit**: Check for captions, translations
- **Calendar Data**: Office hours, Q&A sessions

#### Consistency
- **Publishing History**: Track release dates
- **Version Tracking**: Check which React version content uses
- **Update Logs**: Track content updates over time

## Normalization

The system uses three normalization methods:

1. **Logarithmic Normalization** (`log10(1 + x)`)
   - Used for: Views, learners, enrollments (highly skewed distributions)
   - Reduces impact of viral outliers

2. **Linear Min-Max Normalization** (`(x - min) / (max - min)`)
   - Used for: Publishing frequency, update velocity
   - Maintains proportional relationships

3. **Inverted Normalization** (`1 - normalized`)
   - Used for: Accuracy reports (fewer is better), publishing frequency (shorter is better)
   - Converts "lower is better" metrics to "higher is better"

All metrics are winsorized at 5th/95th percentiles to reduce outlier impact.

## Smoothing

Quarter-to-quarter scores are smoothed using Exponential Moving Average (EMA):

```
FinalCIS = 0.7 × CIS_current + 0.3 × CIS_previous
```

This prevents dramatic swings due to temporary fluctuations.

## API Integration

See the [API Routes documentation](../../app/api/cis/README.md) for information on:
- Submitting educator metrics
- Retrieving CIS scores
- Quarterly allocation calculations

## Mock Data

The system includes mock data for 6 example educators representing different educator archetypes:

```typescript
import { MOCK_EDUCATORS } from '@/lib/cis/mock-data';

// Kent C. Dodds - Premium course creator
// Web Dev Simplified - YouTube educator
// Theo (t3.gg) - Modern stack educator
// Josh Comeau - High-quality paid courses
// Lee Robinson - Next.js/Vercel educator
// Small educator - Growing impact
```

## Privacy & Ethics

### Opt-In Data
- Student career tracking requires explicit LinkedIn opt-in
- Student feedback must be anonymous or with consent
- Peer reviews should be transparent and appealable

### Preventing Gaming
- Winsorization reduces impact of bot views/fake engagement
- Peer review component prevents pure reach-based gaming
- Multi-platform diversity prevents single-platform dependence

### Fairness
- Paid vs free content is balanced via CTI component (not penalized)
- Geographic diversity rewards global reach but isn't dominant
- Beginner vs advanced content are both valued

## Related Systems

- **[RIS (React Impact Score)](../ris/README.md)** - For library maintainers
- **[CoIS (Community Impact Score)](../cois/README.md)** - For meetup/conference organizers

## License

Part of the React Foundation Store project.
