# Community Impact Score (CoIS) System

> **For Chatbot:** This document explains the Community Impact Score system used to evaluate and reward React meetup and conference organizers.

## Overview

The Community Impact Score (CoIS) measures and rewards React community organizers who create spaces for developers to connect, learn, and grow.

**CoIS evaluates:**
- React meetup organizers
- Conference organizers (React Conf, local conferences)
- Hackathon organizers
- Workshop series organizers
- Online community builders

## Five Components

### 1. Event Reach & Frequency (ERF) - 25%

**What it measures:** How many people attend and how often events happen

**Metrics:**
- **Total attendees** (30%) - Cumulative 12-month attendance
- **Unique attendees** (25%) - Distinct individuals (not just headcount)
- **Events held** (25%) - Number of events per year
- **Event size** (10%) - Average attendance per event
- **Virtual participation** (10%) - Online/hybrid event reach

**Why it matters:** Rewards consistent, well-attended community building.

### 2. Community Health (CH) - 25%

**What it measures:** Quality of the community experience

**Metrics:**
- **Repeat attendance** (25%) - Percentage who return to multiple events
- **Code of Conduct** (20%) - Enforcement and incident handling
- **Diversity** (25%) - Speaker and attendee diversity (gender, geography, experience)
- **First-timer experience** (15%) - Satisfaction of new attendees
- **Overall satisfaction** (15%) - Post-event survey ratings

**Why it matters:** Ensures communities are welcoming, safe, and inclusive.

### 3. Content Quality (CQ) - 20%

**What it measures:** Quality of talks and educational content

**Metrics:**
- **Speaker diversity** (30%) - Variety of speakers and perspectives
- **Talk quality ratings** (35%) - Attendee ratings of presentations
- **React relevance** (20%) - Percentage of talks focused on React
- **Post-event resources** (15%) - Slides, recordings, code samples shared

**Why it matters:** Rewards educational value and content excellence.

### 4. Ecosystem Growth (EG) - 20%

**What it measures:** Impact on the broader React ecosystem

**Metrics:**
- **OSS contributors** (40%) - Attendees who contribute to React libraries (via RIS tracking)
- **Job placements** (25%) - Career advancement via community connections
- **Cross-community collaboration** (20%) - Partnerships with other meetups
- **Sponsor engagement** (15%) - Local business/OSS project sponsorships

**Why it matters:** Measures real impact on ecosystem growth and careers.

### 5. Sustainability (S) - 10%

**What it measures:** Long-term viability of the community

**Metrics:**
- **Years active** (20%) - How long the community has existed
- **Organizer count** (30%) - Team size (prevents single-person burnout)
- **Organizer turnover** (25%) - Stability of organizing team
- **Financial health** (15%) - Stable funding (sponsors, ticket sales)
- **Succession planning** (10%) - Plans for leadership transitions

**Why it matters:** Rewards sustainable communities that will last.

## Scoring Formula

```
CoIS = 0.25×ERF + 0.25×CH + 0.20×CQ + 0.20×EG + 0.10×S
```

Where each component is normalized to 0-1 scale.

**Final CoIS range:** 0.0 to 1.0

## Tier System

Same tier system as CIS:

| Tier | Percentile | Pool Share | Badge |
|------|------------|------------|-------|
| **Platinum** | Top 5% | 40% of pool | 💎 |
| **Gold** | Top 15% | 35% of pool | 🏆 |
| **Silver** | Top 30% | 20% of pool | 🥈 |
| **Bronze** | Top 50% | 5% of pool | 🥉 |
| **None** | Bottom 50% | 0% | 📚 |

### Example Allocation

If the CoIS pool is $50,000 for a quarter:
- **Platinum tier** (React Conf, large meetups): Shares $20,000
- **Gold tier**: Shares $17,500
- **Silver tier**: Shares $10,000
- **Bronze tier**: Shares $2,500

## Data Collection

### Event Metrics

Collected from:
- **Meetup.com API** - RSVPs, attendance, ratings
- **Conference systems** - Eventbrite, Tito registration data
- **Post-event surveys** - Satisfaction, diversity, first-timer experience
- **Manual submission** - Organizers report quarterly

### OSS Tracking

- Cross-reference attendee emails (opt-in) with GitHub accounts
- Track if attendees contribute to RIS-tracked libraries
- Measure community impact on ecosystem growth

### Privacy

- **Opt-in tracking** - Attendees consent to OSS contribution tracking
- **Anonymous surveys** - Satisfaction data is aggregated
- **Public metrics** - Event counts and sizes are public

## Quality Standards

### Code of Conduct (Required)

All CoIS-eligible communities must:
1. **Have a published Code of Conduct**
2. **Enforce CoC consistently**
3. **Provide incident reporting mechanism**
4. **Train organizers on enforcement**
5. **Report incidents to Foundation** (aggregated, anonymous)

Missing or unenforced CoC disqualifies from CoIS entirely.

### Diversity & Inclusion

Encouraged practices (not required, but boost CH score):
- Diverse speaker lineup (not all men, not all one company)
- Scholarship programs for underrepresented groups
- Childcare support for parents
- Multiple experience levels (beginner tracks)
- Accessibility accommodations

### Content Quality

- At least 60% of content must be React-related
- Talks rated by attendees (average >3.5/5)
- Post-event resources shared publicly

## How to Qualify

### Start a Community

1. **Create a React meetup or conference**
2. **Hold regular events** (monthly meetups or annual conference)
3. **Adopt a Code of Conduct**
4. **Track attendance and satisfaction**
5. **Submit quarterly reports**

### Minimum Requirements

- **3+ events in 12 months** (for meetups) or **1 annual conference**
- **Code of Conduct** published and enforced
- **50+ attendees** total across all events
- **Post-event surveys** with >50% response rate

### Application Process

1. **Register community** with Foundation
2. **Provide event history** (past 12 months)
3. **Initial review** - Verify CoC and basic quality
4. **Connect platforms** - Meetup.com, Eventbrite, etc.
5. **Quarterly reporting** - Submit metrics
6. **Tier assignment** - Automatic based on CoIS

## Benefits of CoIS

### For Organizers

- **Funding** - Quarterly revenue to cover expenses
- **Recognition** - Public profile and tier badge
- **Resources** - Access to Foundation speaker network
- **Support** - Community building toolkit and best practices

### For Communities

- **Sustainability** - Financial support enables growth
- **Quality** - Toolkit and standards raise the bar
- **Network** - Connect with other React communities
- **Visibility** - Featured on Foundation community map

### For Attendees

- **Quality events** - CoIS standards ensure good experiences
- **Safe spaces** - CoC requirement protects attendees
- **Career growth** - Tracked job placements via community
- **Learning** - Quality content standards

### For the Ecosystem

- **Global growth** - Support for communities worldwide
- **Diversity** - Metrics encourage inclusive communities
- **OSS pipeline** - Track ecosystem contributions
- **Local identity** - React presence in every city

## Example Communities

### React Native London
- **ERF**: 2,000 total attendees, 12 events/year
- **CH**: 65% repeat attendance, excellent CoC enforcement
- **CQ**: Diverse speakers, 4.6/5 talk ratings
- **EG**: 15 attendees contributed to RIS libraries
- **S**: 5 years active, 4 co-organizers
- **Result**: Platinum tier

### React Lagos
- **ERF**: 500 attendees, 10 events/year, hybrid format
- **CH**: Growing community, good first-timer experience
- **CQ**: Local speakers, React-focused content
- **EG**: 8 OSS contributors, 3 job placements
- **S**: 2 years active, 3 organizers
- **Result**: Silver tier

## Anti-Gaming Measures

- **Attendance verification** - Random spot checks
- **Satisfaction surveys** - Required for all events
- **OSS tracking** - Cross-referenced with GitHub
- **Diversity audits** - Speaker lineup reviews
- **CoC enforcement** - Incident reporting required

## Geographic Fairness

CoIS adjusts for local context:
- **Cost of living** - Higher floors for expensive cities
- **Population density** - Urban vs rural considerations
- **Market maturity** - New communities vs established ones

This ensures global communities can compete fairly.

## Related Topics

- [Foundation Overview](./foundation-overview.md)
- [RIS System (Libraries)](./ris-system.md)
- [CIS System (Educators)](./cis-system.md)
- [Community Building Guide](../getting-involved/community-building-guide.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*
