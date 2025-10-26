# Chatbot Documentation

Documentation for the React Foundation chatbot and content ingestion system.

## System Overview

The chatbot uses a **loader-based push ingestion system** to populate its knowledge base:

1. **Loaders** gather content from various sources (MDX files, Redis, in-memory data)
2. **Chunking** splits content into ~950-word chunks with 100-word overlap
3. **Embeddings** are generated via OpenAI API
4. **Vector Database** (Redis with RediSearch) stores embeddings + metadata
5. **Semantic Search** finds relevant content for user queries
6. **LLM Response** generates answers using GPT-4 with context

## Documentation

### [🏗️ Architecture](./architecture.md)
Complete technical specification of the loader-based ingestion system:
- System design and data flow
- Loader architecture
- Chunking and embedding strategy
- Redis schema
- API endpoints
- Performance characteristics

### [📊 Data Sources](./data-sources.md)
Where content comes from:
- Public documentation (MDX files)
- Community data (Redis)
- Library data (in-memory)
- Educator data *(coming soon)*

### [🔄 Blue-Green Ingestion](./blue-green-ingestion.md)
Zero-downtime content updates:
- Dual index strategy
- Safe switching process
- Rollback capability

### [📝 Ingestion Summary](./ingestion-summary.md)
High-level overview of the ingestion process

### [📋 Data Import Schema](./data-import-schema.md)
Data structure reference for loaders

### [🚀 Crawler Bypass](./crawler-bypass.md)
Why we use loaders instead of runtime crawlers:
- Serverless compatibility
- Performance benefits
- Reliability improvements

### [🔍 Puppeteer Loader](./puppeteer-loader.md)
Browser-based page loading for complex content

### [🐛 Troubleshooting](./troubleshooting.md)
Common ingestion issues and solutions:
- Timeout errors
- Redis memory issues
- Embedding failures
- Missing content

## Quick Start

### Run Full Ingestion

```bash
# Via API
curl -X POST http://localhost:3000/api/ingest/full

# Via admin UI
open http://localhost:3000/admin/ingest-full
```

### Check Status

```bash
curl http://localhost:3000/api/ingestion/status
```

### Test Chatbot

```bash
# Get content map
curl http://localhost:3000/api/content-map

# Test search
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What is the React Foundation?"}]}'
```

## Architecture Diagram

```
┌─────────────────┐
│  Data Sources   │
├─────────────────┤
│ • MDX Files     │
│ • Communities   │
│ • Libraries     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Loaders      │
├─────────────────┤
│ • MDXLoader     │
│ • CommunityLoad │
│ • LibraryLoader │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Chunking     │
├─────────────────┤
│ • 950 words     │
│ • 100 overlap   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Embeddings    │
├─────────────────┤
│ • OpenAI API    │
│ • Batch process │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Vector   │
│    Database     │
├─────────────────┤
│ • 400-500 chunks│
│ • Semantic search│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Chatbot      │
├─────────────────┤
│ • Query vectors │
│ • Retrieve docs │
│ • Generate resp │
└─────────────────┘
```

## Performance Expectations

### Ingestion Duration
- **MDX Loader**: ~30-45 seconds (12 files)
- **Communities Loader**: ~10-15 seconds (65 communities)
- **Libraries Loader**: ~5-10 seconds (54 libraries)
- **Total**: 60-90 seconds for full ingestion

### Chatbot Response Time
- Query processing: <500ms
- Embedding generation: ~200ms (OpenAI)
- Vector search: <100ms (Redis)
- LLM response: 1-3s (OpenAI)
- **Total**: 2-4 seconds typical

### Storage
- ~400-500 chunks total
- ~1-2 MB total storage
- Redis memory: <10 MB

## Loaders

### MDXLoader
Ingests markdown/MDX files from `public-context/`:
- Foundation overview
- Impact systems (RIS, CIS, CoIS)
- Store and drops
- Getting involved guides

**Sources**: File system
**Records**: ~12 documents
**Chunks**: ~30-45 chunks

### CommunitiesLoader
Ingests React community data:
- Meetups and conferences
- Community organizers
- Location and attendance data

**Sources**: Redis (`community:*` keys)
**Records**: ~65 communities
**Chunks**: ~100-150 chunks

### LibrariesLoader
Ingests React ecosystem library data:
- Library metadata
- GitHub stats
- NPM download data
- RIS scores

**Sources**: In-memory (from `ecosystem-libraries.ts`)
**Records**: 54 libraries
**Chunks**: ~200-300 chunks

## API Endpoints

### POST `/api/ingest/full`
Triggers full ingestion of all loaders.

**Response:**
```json
{
  "success": true,
  "loaders": {
    "MDXLoader": { "records": 12, "chunks": 45 },
    "CommunitiesLoader": { "records": 65, "chunks": 150 },
    "LibrariesLoader": { "records": 54, "chunks": 250 }
  },
  "total": { "records": 131, "chunks": 445 },
  "duration": 72
}
```

### GET `/api/ingestion/status`
Returns current ingestion status.

### GET `/api/content-map`
Returns navigation map of ingested content.

### POST `/api/chat`
Chatbot query endpoint.

## Environment Variables

```bash
# OpenAI (required)
OPENAI_API_KEY=sk-xxxxx

# Redis (required)
REDIS_URL=redis://localhost:6379

# Optional
NEXT_PUBLIC_CHATBOT_ENABLED=true
```

## Related Documentation

### Public Content
The actual content that gets ingested:
- **[public-context/](../../public-context/)** - All chatbot content

### Code
Implementation details:
- **[src/lib/ingestion/](../../src/lib/ingestion/)** - Loader implementations
- **[src/lib/redis/](../../src/lib/redis/)** - Redis integration
- **[src/lib/embeddings/](../../src/lib/embeddings/)** - Embedding generation

---

*For deployment and troubleshooting, see [Getting Started](../getting-started/) and [Troubleshooting](./troubleshooting.md).*
