# Content Impact Score (CIS) System

> **For Chatbot:** This document explains the Content Impact Score system used to evaluate and reward React educators and content creators.

## Overview

The Content Impact Score (CIS) is a comprehensive scoring system for measuring and rewarding React educators and content creators based on their impact on the React community.

**CIS evaluates:**
- YouTube educators and video content creators
- Course creators (Udemy, Teachable, own platforms)
- Technical writers and bloggers
- Tutorial authors
- React documentation contributors

## Five Components

### 1. Educational Reach (ER) - 25%

**What it measures:** How many people the educator reaches

**Metrics:**
- **Video views** (35%) - Total views across all platforms (YouTube, Twitch, etc.)
- **Unique learners** (30%) - Distinct individuals reached (de-duplicated across platforms)
- **Course enrollments** (20%) - Both paid and free course sign-ups
- **Article/blog reads** (10%) - Page views on written content
- **Geographic diversity** (5%) - Number of countries reached

**Why it matters:** Rewards educators who reach and teach large, diverse audiences.

### 2. Content Quality & Correctness (CQC) - 30%

**What it measures:** Quality and accuracy of teaching

**Metrics:**
- **Peer review scores** (35%) - Reviews from React core team and experts
- **Code quality checks** (25%) - Automated linting on example code
- **Community engagement** (20%) - Upvotes, likes, positive feedback
- **React docs alignment** (15%) - Consistency with official React documentation
- **Accuracy reports** (5%) - Inverted - fewer accuracy issues = higher score

**Anti-gaming measures:**
- Mandatory peer review by React experts
- Automated code analysis prevents low-quality examples
- Community reports flag inaccuracies
- Alignment check against official docs

**Why it matters:** Ensures we reward quality teaching, not just popular content.

### 3. Learning Outcomes (LO) - 25%

**What it measures:** Actual student success

**Metrics:**
- **Completion rates** (25%) - Percentage who finish courses/series
- **Time spent learning** (20%) - Average engagement time (normalized)
- **Student feedback** (25%) - Survey ratings from learners
- **OSS contributions** (20%) - Students who contribute to React libraries (tracked via RIS)
- **Career growth** (10%) - LinkedIn opt-in career progression data

**Why it matters:** Measures real impact on student success, not just views.

### 4. Community Teaching Impact (CTI) - 15%

**What it measures:** Community-focused teaching efforts

**Metrics:**
- **Free content ratio** (30%) - Percentage of free vs paid content (balanced, not punitive)
- **Accessibility** (30%) - Captions, translations, beginner-friendly content
- **Mentorship hours** (25%) - Office hours, Q&A sessions, Discord support
- **Beginner content** (15%) - Percentage targeting React beginners

**Why it matters:** Rewards educators who prioritize community access and support.

### 5. Consistency & Longevity (CL) - 5%

**What it measures:** Sustained, up-to-date teaching

**Metrics:**
- **Publishing frequency** (30%) - Regular content releases
- **Content freshness** (35%) - Updates for new React versions
- **Years teaching** (20%) - Time actively teaching React
- **Update velocity** (15%) - How often content is refreshed

**Why it matters:** Rewards consistent educators who keep content current.

## Scoring Formula

```
CIS = 0.25×ER + 0.30×CQC + 0.25×LO + 0.15×CTI + 0.05×CL
```

Where each component is normalized to 0-1 scale.

**Final CIS range:** 0.0 to 1.0

## Tier System

Educators are assigned to tiers based on their percentile rank:

| Tier | Percentile | Pool Share | Badge | Benefits |
|------|------------|------------|-------|----------|
| **Platinum** | Top 5% | 40% of pool | 💎 | Highest revenue share + recognition |
| **Gold** | Top 15% | 35% of pool | 🏆 | Substantial revenue share |
| **Silver** | Top 30% | 20% of pool | 🥈 | Moderate revenue share |
| **Bronze** | Top 50% | 5% of pool | 🥉 | Small revenue share |
| **None** | Bottom 50% | 0% | 📚 | Recognition only, no revenue |

### Example Allocation

If the CIS pool is $100,000 for a quarter:
- **Platinum tier** (Top 5%): Shares $40,000 equally
- **Gold tier** (Next 10%): Shares $35,000 equally
- **Silver tier** (Next 15%): Shares $20,000 equally
- **Bronze tier** (Next 20%): Shares $5,000 equally

**Individual example:**
- 20 educators qualify (10,000 applicants)
- Platinum tier has 1 educator → receives $40,000
- Gold tier has 2 educators → each receives $17,500
- Silver tier has 3 educators → each receives ~$6,667
- Bronze tier has 4 educators → each receives $1,250

## Data Collection

### Platform Integrations

Metrics are collected from:
- **YouTube API** - Views, subscribers, engagement
- **Course platforms** - Udemy, Teachable, Skillshare enrollment data
- **Google Analytics** - Blog/article traffic
- **GitHub** - Tutorial repo stars and forks
- **Peer Review Portal** - Expert assessments

### Privacy & Opt-In

- **Student outcomes**: Requires explicit opt-in (LinkedIn career tracking)
- **Anonymous feedback**: Student surveys are anonymous
- **Public metrics**: Views, enrollments are from public APIs
- **Educator consent**: All participants opt-in to CIS evaluation

## Quality Standards

### Peer Review Process

1. **Submit content** for quarterly review
2. **Expert panel** (3 React core/ecosystem contributors) reviews
3. **Scoring criteria:**
   - Code accuracy and best practices
   - Alignment with React documentation
   - Teaching clarity and effectiveness
   - Up-to-date with latest React features

### Code Quality Checks

Automated checks on all code examples:
- ESLint with React recommended rules
- TypeScript strict mode (if applicable)
- Accessibility checks (jsx-a11y)
- Performance best practices

### Accuracy Reports

Community can submit inaccuracy reports:
- Reviewed by peer review board
- Verified inaccuracies reduce CQC score
- Educators can appeal and correct content
- Points restored after correction

## How to Qualify

### Eligibility

1. **Create React content** (videos, courses, articles, tutorials)
2. **Public portfolio** - Content must be publicly accessible
3. **Minimum reach** - 1,000+ monthly learners across all content
4. **Quality threshold** - Pass initial peer review
5. **Opt-in** - Submit application and consent to tracking

### Application Process

1. **Submit portfolio** - Links to all React content
2. **Initial review** - Peer review board evaluates quality
3. **Metrics setup** - Connect platforms (YouTube, course sites, analytics)
4. **Quarterly reporting** - Submit metrics each quarter
5. **Tier assignment** - Automatic based on CIS calculation

### Launch Phase (Invite-Only)

Initially invite-only to ensure quality:
- **Content review board** manually approves educators
- **Minimum quality bar** enforced
- **Gradual expansion** as system scales
- **Public launch** once proven at scale

## Benefits of CIS

### For Educators

- **Sustainable revenue** - Quarterly payments based on impact
- **Recognition** - Public profile and tier badge
- **Quality feedback** - Peer review improves content
- **Community connection** - Network with other top educators

### For Learners

- **Quality assurance** - CIS-verified educators meet quality standards
- **Current content** - Consistency component rewards updates
- **Free access** - CTI component encourages free content
- **Better outcomes** - Learning outcomes metric ensures effectiveness

### For the Ecosystem

- **Quality teaching** - Peer review raises the bar
- **OSS pipeline** - Learning outcomes track student contributions
- **Global reach** - Geographic diversity encouraged
- **Accessibility** - Accessibility metrics reward inclusive content

## Preventing Gaming

### Statistical Protections

- **Winsorization** - Caps extreme outliers at 95th percentile
- **Multi-dimensional** - Can't boost one metric to dominate
- **Peer review** - Prevents pure reach-based gaming
- **Historical smoothing** - EMA prevents quarter-to-quarter spikes

### Monitoring

- **Bot detection** - YouTube/platform APIs filter fake views
- **Code quality** - Automated checks prevent low-quality examples
- **Accuracy tracking** - Community reports flag issues
- **Peer audits** - Random sampling verifies metrics

## Related Topics

- [Foundation Overview](./foundation-overview.md)
- [RIS System (Libraries)](./ris-system.md)
- [CoIS System (Organizers)](./cois-system.md)
- [Educator Program Details](../getting-involved/educator-program.md)

---

*Last updated: October 2025*
*Part of React Foundation public documentation*
