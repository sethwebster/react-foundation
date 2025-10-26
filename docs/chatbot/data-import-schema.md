# Preferred Data Import Schema

## Philosophy

**Redis is the source of truth** for runtime data (communities, educators, organizers).

- `.ts` and `.json` files are **ONLY for initial seeding**
- After seeding, **all reads come from Redis**
- **All updates happen in Redis** (via admin APIs)
- No fallback to static files after initial seed

## Community Data Schema

### Preferred JSON Format

```json
{
  "id": "unique-slug",
  "name": "React Buenos Aires",
  "city": "Buenos Aires",
  "region": "Buenos Aires Province",
  "country": "Argentina",
  "coordinates": {
    "lat": -34.6037,
    "lng": -58.3816
  },
  "timezone": "America/Argentina/Buenos_Aires",

  "organizers": [
    {
      "name": "Mariano Vazquez",
      "role": "lead",
      "github": "marianovazquez",
      "twitter": "mariano_vaz"
    }
  ],

  "details": {
    "description": "Large community of software developers...",
    "founded_date": "2015-06-15",
    "member_count": 8566,
    "typical_attendance": 150,
    "meeting_frequency": "monthly",
    "primary_language": "Spanish",
    "secondary_languages": ["English"],
    "event_types": ["meetup", "workshop"]
  },

  "metrics": {
    "total_events": 100,
    "last_event_date": "2025-01-15",
    "rating": 4.7,
    "rating_count": 1114,
    "has_hackathons": false
  },

  "links": {
    "meetup_url": "https://www.meetup.com/react-ba/",
    "website": null,
    "discord": null,
    "twitter": "@reactba"
  },

  "sponsors": [
    {
      "name": "Distillery",
      "type": "venue",
      "website": "https://distillery.com"
    }
  ],

  "cois": {
    "tier": "platinum",
    "score": 0.92,
    "invite_only": false,
    "verified": true
  },

  "status": "active",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### Why This Schema?

**✅ Advantages:**
1. **Flat structure** - Easy to query and filter
2. **Typed coordinates** - No string parsing needed
3. **Separate sections** - details vs metrics vs links
4. **Organizer objects** - Rich data, not just strings
5. **Sponsor details** - Can track sponsor relationships
6. **ISO timestamps** - Proper date handling
7. **CoIS embedded** - Tier and score with community

**❌ Problems with Current normalized-meetups-data.json:**
1. Location is a string - requires parsing
2. Organizers are strings - loses metadata
3. Sponsors are strings - can't track relationships
4. Dates are just years - loses precision
5. No coordinates - requires geocoding
6. Mixed status/frequency fields

## Educator Data Schema

```json
{
  "id": "kent-c-dodds",
  "name": "Kent C. Dodds",
  "github_username": "kentcdodds",

  "profile": {
    "bio": "Making the world better with quality software...",
    "avatar_url": "https://...",
    "location": "Utah, USA",
    "website": "https://kentcdodds.com",
    "twitter": "kentcdodds",
    "linkedin": "kentcdodds"
  },

  "platforms": [
    {
      "type": "own-site",
      "name": "Epic React",
      "url": "https://epicreact.dev",
      "primary": true
    },
    {
      "type": "youtube",
      "url": "https://youtube.com/@kentcdodds",
      "subscribers": 250000
    }
  ],

  "specialties": ["React Hooks", "Testing", "TypeScript"],
  "experience_level": "all-levels",

  "metrics": {
    "video_views_12mo": 2500000,
    "unique_learners": 150000,
    "course_enrollments": 45000,
    "completion_rate": 0.75,
    "student_feedback_score": 0.92
  },

  "cis": {
    "tier": "platinum",
    "score": 0.95,
    "verified": true,
    "invite_only": true
  },

  "status": "active",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

## Data Flow

```
1. Initial Seed (one-time)
   JSON file → Transform → Redis

2. Runtime (normal operation)
   API Request → Redis ONLY

3. Updates (admin)
   Admin API → Update Redis → Success

4. Never
   ❌ Fallback to .ts files after seed
   ❌ Read from JSON during normal operation
```

## Import Process

### 1. Prepare JSON File
Place in `data/` directory with proper schema

### 2. Seed Redis
```bash
# Via API (preferred - runs in app context)
POST /api/admin/import-communities

# Via script (requires Redis connection)
npm run seed:communities -- --force
```

### 3. Verify
```bash
curl http://localhost:3000/api/communities | jq '.count'
```

### 4. Done
Redis is now the source of truth. JSON file can be archived.

## Schema Validation

Future: Add JSON Schema validation before import

```typescript
import Ajv from 'ajv';

const schema = {
  type: 'object',
  required: ['id', 'name', 'city', 'country', 'coordinates'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    name: { type: 'string', minLength: 1 },
    coordinates: {
      type: 'object',
      required: ['lat', 'lng'],
      properties: {
        lat: { type: 'number', minimum: -90, maximum: 90 },
        lng: { type: 'number', minimum: -180, maximum: 180 }
      }
    }
    // ... etc
  }
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

if (!validate(data)) {
  throw new Error('Invalid schema');
}
```

## Migration Guide

### From Old Schema to New Schema

Use the transformation script as a template:

```typescript
// Old format (string location)
{
  "location": "Buenos Aires, Argentina"
}

// New format (structured)
{
  "city": "Buenos Aires",
  "region": "Buenos Aires Province",
  "country": "Argentina",
  "coordinates": { "lat": -34.6037, "lng": -58.3816 },
  "timezone": "America/Argentina/Buenos_Aires"
}
```

## Redis Keys

```
communities:all          → JSON array of all communities
communities:seeded       → "true" flag (permanent)
educator:{id}            → Single educator JSON
organizer:{id}           → Single organizer JSON
```

## Best Practices

1. **Always include coordinates** - Don't rely on geocoding
2. **Use ISO dates** - Not just years
3. **Structured organizers** - Objects, not strings
4. **Enum values** - Use our defined enums (status, frequency, etc.)
5. **Validate before import** - Check schema first
6. **Backup before re-seed** - Export from Redis before force re-seed

---

**Summary:** Redis is the database. JSON/TS files are just seed data. After seeding, forget the files exist.
