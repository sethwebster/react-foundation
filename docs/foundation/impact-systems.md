# React Foundation Impact Scoring Systems

## Overview

The React Foundation now has **three parallel impact scoring systems** to recognize and reward different types of contributions to the React ecosystem:

1. **RIS (React Impact Score)** - For library maintainers and code contributors
2. **CIS (Content Impact Score)** - For educators and content creators
3. **CoIS (Community Impact Score)** - For meetup/conference organizers

## System Architecture

All three systems share the same core architecture:

```
src/lib/
├── ris/     # React Impact Score (existing)
├── cis/     # Content Impact Score (NEW)
└── cois/    # Community Impact Score (NEW)
```

Each system includes:
- `types.ts` - TypeScript definitions for metrics and scores
- `normalization.ts` - Statistical normalization utilities
- `scoring-service.ts` - Main calculation engine
- `hooks.ts` - React hooks for UI integration
- `mock-data.ts` - Sample data for testing
- `index.ts` - Public API exports
- `README.md` - Complete documentation

## CIS: Content Impact Score

**Purpose:** Measure and reward React educators, YouTubers, course creators, and technical writers.

### Components (5)

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| **Educational Reach (ER)** | 25% | Video views, unique learners, course enrollments, article reads, geographic diversity |
| **Content Quality & Correctness (CQC)** | 30% | Peer reviews, code quality, community upvotes, React docs alignment, accuracy |
| **Learning Outcomes (LO)** | 25% | Completion rates, time spent, student feedback, student contributions to OSS |
| **Community Teaching Impact (CTI)** | 15% | Free content ratio, accessibility, mentorship hours, beginner content |
| **Consistency & Longevity (CL)** | 5% | Publishing frequency, content freshness, years teaching, update velocity |

### Mock Educators Included
- Kent C. Dodds (Epic React)
- Kyle Cook (Web Dev Simplified)
- Theo Browne (t3.gg)
- Josh Comeau (joshwcomeau.com)
- Lee Robinson (Vercel/Next.js)
- Small educator (growing impact)

### Tier System
- **Platinum (Top 5%)**: 40% of pool - 💎
- **Gold (Top 15%)**: 35% of pool - 🏆
- **Silver (Top 30%)**: 20% of pool - 🥈
- **Bronze (Top 50%)**: 5% of pool - 🥉
- **None (Bottom 50%)**: Recognition only - 📚

## CoIS: Community Impact Score

**Purpose:** Measure and reward React meetup organizers, conference organizers, and community builders.

### Components (5)

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| **Event Reach & Frequency (ERF)** | 25% | Total attendees, unique attendees, events held, virtual ratio, event size |
| **Community Health (CH)** | 25% | Repeat attendance, CoC enforcement, diversity, first-timer experience, satisfaction |
| **Content Quality (CQ)** | 20% | Speaker diversity, talk quality, React relevance, post-event resources |
| **Ecosystem Growth (EG)** | 20% | New OSS contributors, job placements, cross-community collaboration, sponsors |
| **Sustainability (S)** | 10% | Years active, organizer count, turnover rate, financial health, succession plans |

### Mock Organizers Included
- React Native London
- React Conf
- ReactJS SF Bay Area
- React Lagos
- Small React Meetup (Boulder)

### Tier System
Same as CIS: Platinum/Gold/Silver/Bronze/None with percentile-based distribution.

## Revenue Pool Split

**Total Store Profits** → Three pools:

```
60% → RIS Pool (Library Maintainers)
├─ 60% → CIS Pool (Educators)
└─ 40% → CoIS Pool (Community Organizers)
```

This split reflects:
- **Code contributions** are foundational (largest pool)
- **Education** amplifies impact (larger than community events)
- **Community building** is essential but more local (smaller but meaningful)

## Usage Examples

### Educator Scoring

```typescript
import { CISScoringService, MOCK_EDUCATORS } from '@/lib/cis';

const service = new CISScoringService();
const allocation = service.generateQuarterlyAllocation(
  MOCK_EDUCATORS,
  100_000, // $100k educator pool
  '2025-Q1'
);

allocation.educators.forEach(educator => {
  console.log(`${educator.name}: ${educator.tier} - $${educator.allocation_usd}`);
});
```

### Community Organizer Scoring

```typescript
import { CoISScoringService, MOCK_ORGANIZERS } from '@/lib/cois';

const service = new CoISScoringService();
const allocation = service.generateQuarterlyAllocation(
  MOCK_ORGANIZERS,
  50_000, // $50k community pool
  '2025-Q1'
);

allocation.organizers.forEach(org => {
  console.log(`${org.name}: ${org.tier} - $${org.allocation_usd}`);
});
```

### React Hooks for UI

```typescript
'use client';

import { useCISScores, useCoISScores } from '@/lib/cis';
import { MOCK_EDUCATORS } from '@/lib/cis/mock-data';
import { MOCK_ORGANIZERS } from '@/lib/cois/mock-data';

function LeaderboardPage() {
  const educatorScores = useCISScores(MOCK_EDUCATORS);
  const organizerScores = useCoISScores(MOCK_ORGANIZERS);

  return (
    <div>
      <h2>Top Educators</h2>
      {educatorScores.map(e => (
        <div key={e.educatorId}>
          {e.name}: CIS {e.cis.toFixed(3)} - {e.tier}
        </div>
      ))}

      <h2>Top Organizers</h2>
      {organizerScores.map(o => (
        <div key={o.organizerId}>
          {o.name}: CoIS {o.cois.toFixed(3)} - {o.tier}
        </div>
      ))}
    </div>
  );
}
```

## Data Collection

### CIS Data Sources
- **YouTube API**: Views, engagement
- **Course Platforms**: Udemy, Teachable, custom platforms
- **Analytics**: Google Analytics for blog traffic
- **Peer Reviews**: Manual reviews by React experts
- **Student Surveys**: Feedback and outcomes
- **LinkedIn API** (opt-in): Career progression

### CoIS Data Sources
- **Meetup.com API**: Event attendance
- **Conference Systems**: Registration/attendance data
- **Post-Event Surveys**: Satisfaction, diversity, quality ratings
- **Manual Submission**: Organizers submit data quarterly
- **GitHub Cross-reference**: Track attendee OSS contributions

## Next Steps

### Phase 1: Database Schema (Current)
- PostgreSQL/Supabase tables for educators and organizers
- Quarterly metrics storage
- Historical score tracking

### Phase 2: API Routes
- `/api/cis/submit` - Submit educator metrics
- `/api/cis/scores` - Retrieve CIS leaderboard
- `/api/cois/submit` - Submit organizer metrics
- `/api/cois/scores` - Retrieve CoIS leaderboard

### Phase 3: Public Profile Pages
- `/educators/[slug]` - Educator profile with CIS breakdown
- `/communities/[slug]` - Organizer profile with CoIS breakdown
- Interactive score visualizations

### Phase 4: Admin Dashboard
- Review and approve submitted metrics
- Adjust scores manually if needed
- Generate quarterly allocation reports
- Handle appeals and disputes

### Phase 5: Payment Integration
- Stripe/payment system integration
- Automated quarterly distributions
- Tax reporting (1099s for US recipients)

## Critical Challenges

### Preventing Gaming
- **Winsorization** reduces outlier impact
- **Peer Review** component prevents pure metric gaming
- **Multi-factor scoring** requires excellence across dimensions
- **Historical smoothing** prevents sudden spikes

### Quality Verification
- **Peer Review Board**: React experts review content quality
- **Code Analysis**: Automated checks on example code
- **Community Reports**: User-submitted accuracy issues
- **Manual Audits**: Random sampling of content/events

### Privacy & Ethics
- **Opt-in tracking**: Student outcomes require consent
- **Anonymous feedback**: Protect survey respondents
- **Transparent appeals**: Dispute resolution process
- **Geographic fairness**: CoIS adjusts for local context

## Success Metrics

Track these to evaluate the systems:

1. **Participation Rate**: % of eligible educators/organizers who opt in
2. **Quality Improvement**: Average peer review scores over time
3. **Ecosystem Growth**: New OSS contributors from students/attendees
4. **Geographic Diversity**: Distribution across countries/regions
5. **Retention**: Year-over-year participation rates

## Documentation

- **[CIS README](../src/lib/cis/README.md)** - Complete CIS documentation
- **[CoIS README](../src/lib/cois/README.md)** - Complete CoIS documentation (TODO)
- **[RIS README](../src/lib/ris/README.md)** - Existing RIS documentation

## License

Part of the React Foundation Store project.
