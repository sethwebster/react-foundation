# Community Systems Documentation

Documentation for community and educator impact systems.

## Overview

The React Foundation supports and rewards two key groups:

1. **Educators** - Content creators, course authors, tutorial writers (CIS)
2. **Community Organizers** - Meetup hosts, conference organizers (CoIS)

## Documentation

### [📚 Educator and Community Systems](./educator-and-community.md)
Complete overview of CIS (Content Impact Score) and CoIS (Community Impact Score) systems:
- How they work
- Scoring methodology
- Revenue allocation
- Qualification requirements
- Data collection process

### [🤝 Community Toolkit](./community-toolkit.md)
Resources and guides for community organizers:
- Starting a React meetup
- Organizing conferences
- Best practices
- Resource checklist
- Funding opportunities

### [🔧 Data Fixes](./data-fixes.md)
Fixing stale or incorrect community data:
- Data cleanup procedures
- Common data issues
- Update workflows
- Verification process

## Systems Overview

### Content Impact Score (CIS)

**For:** Educators creating React learning content

**Tracks:**
- Course enrollments and completions
- Tutorial views and engagement
- Student outcomes
- Content quality ratings

**Revenue Share:** 25-35% of quarterly revenue

**Tiers:**
- **Educator** (100+ students) - Basic access
- **Senior Educator** (500+ students) - Enhanced support
- **Master Educator** (2000+ students) - Premium benefits

### Community Impact Score (CoIS)

**For:** Community organizers running React events

**Tracks:**
- Event attendance
- Community growth
- Organizer effort (hours)
- Geographic reach
- Event quality

**Revenue Share:** 20-30% of quarterly revenue

**Tiers:**
- **Organizer** (100+ attendees/year) - Basic support
- **Senior Organizer** (500+ attendees/year) - Enhanced resources
- **Master Organizer** (2000+ attendees/year) - Full benefits

## Data Sources

### Educator Data *(Coming Soon)*
- Course platforms (Udemy, Coursera, etc.)
- Tutorial analytics (YouTube, blog platforms)
- Student feedback and ratings
- Content quality metrics

### Community Data (Active)
Stored in Redis with keys:
- `community:{id}` - Community details
- `community:organizer:{id}` - Organizer profiles
- `community:events:{id}` - Event records

**Current Status:**
- 65+ React communities tracked
- 120+ organizers
- 500+ events annually

## Getting Involved

### For Educators
1. Create quality React educational content
2. Track your reach (students, views, engagement)
3. Apply for CIS program when you hit thresholds
4. Submit quarterly impact reports

### For Community Organizers
1. Start or join a React meetup/conference
2. Track attendance and engagement
3. Register your community with Foundation
4. Submit event data quarterly

## API Access *(Coming Soon)*

Educators and organizers will be able to:
- Submit impact data via API
- View their scores and tier status
- Track quarterly allocations
- Update profile information

## Related Documentation

### Public Documentation
For users learning about these programs:
- **[public-context/foundation/cis-system.md](../../public-context/foundation/cis-system.md)** - CIS overview for educators
- **[public-context/foundation/cois-system.md](../../public-context/foundation/cois-system.md)** - CoIS overview for organizers
- **[public-context/getting-involved/educator-program.md](../../public-context/getting-involved/educator-program.md)** - Joining as educator
- **[public-context/getting-involved/community-building-guide.md](../../public-context/getting-involved/community-building-guide.md)** - Community building guide

### Foundation Documentation
For system design:
- **[docs/foundation/impact-systems.md](../foundation/impact-systems.md)** - Technical overview of all impact systems

### Chatbot Integration
- **[docs/chatbot/README.md](../chatbot/)** - How community data is ingested

---

*These systems are in active development. Check back for updates on educator data collection and API access.*
