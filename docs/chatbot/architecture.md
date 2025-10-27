# React Foundation – Ingestion, Embedding, and Search System

## Overview
This document defines the architecture, workflow, and technical specifications for the **React Foundation Knowledge System** — the ingestion and retrieval backend that powers the **chat bot and semantic search** on [react.foundation](https://react.foundation).

The goal is to provide the bot with complete, navigable access to all Foundation content — both static and dynamic (e.g., community data from Redis) — without crawling or scraping the live website.

---

## Objectives

1. **Eliminate runtime crawling** — All data is pushed to embeddings at build or update time.
2. **Single-application architecture** — Everything lives inside one Next.js app (no monorepo).
3. **Instant updates** — Whenever new content or communities are added, their embeddings are updated automatically.
4. **Full navigability** — Every embedded chunk contains a canonical URL (and optional anchor) to direct users precisely to the source page.
5. **Hybrid search** — Use Redis for both vector and keyword search (RediSearch).

---

## System Architecture

┌─────────────────────────────┐
│  React.Foundation Website   │
│  (Next.js on Vercel)        │
│                             │
│  • /app + /pages            │
│  • /lib/ingest              │
│  • /pages/api/search.ts     │
│  • /pages/api/ingest/*.ts   │
└─────────────┬───────────────┘
│
│
┌─────────────▼───────────────┐
│         Redis Cloud         │
│  (Upstash or self-managed)  │
│                             │
│  • RediSearch Index         │
│  • Vector Embeddings        │
│  • Canonical Items          │
│  • Chunked Text             │
│  • Content Map JSON         │
└─────────────┬───────────────┘
│
│
┌─────────────▼───────────────┐
│     Embedding Model API     │
│   (e.g. OpenAI / Anthropic) │
│                             │
│  • text-embedding-3-large   │
│  • Batch Embedding Calls    │
└─────────────────────────────┘

---

## Data Model (Redis)

### 1. Canonical Items
Each “thing” (page, FAQ, community, policy, etc.) has a canonical record.

**Key Pattern:**  
`rf:items:<id>`

**Type:** `HASH`

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | e.g., `page`, `faq`, `community` |
| `title` | string | Display title |
| `url` | string | Canonical URL |
| `source` | string | Origin of data (e.g. `redis`, `mdx`, `cms`) |
| `updated_at` | ISO string | Last modified timestamp |
| `tags` | JSON string | Arbitrary metadata |

---

### 2. Chunks
Chunks are tokenized segments (≈900–1200 tokens) of canonical items with embeddings.

**Key Pattern:**  
`rf:chunks:<itemId>:<ord>`

**Type:** `HASH`

| Field | Type | Description |
|-------|------|-------------|
| `item_id` | string | Canonical item reference |
| `ord` | int | Chunk order |
| `text` | string | Raw chunk text |
| `url` | string | Canonical URL |
| `anchor` | string | Optional anchor (for deep link) |
| `title` | string | Title of parent item |
| `type` | string | Type of parent item |
| `updated_at` | ISO string | Timestamp of ingestion |
| `tsv` | string | Text for full-text BM25 search |
| `embed` | BLOB | Vector embedding (Float32Array) |

---

### 3. RediSearch Index

```bash
FT.CREATE rf:chunks-idx ON HASH PREFIX 1 "rf:chunks:" SCHEMA \
  item_id TAG \
  type TAG \
  title TEXT \
  url TEXT \
  anchor TEXT \
  updated_at TEXT \
  tsv TEXT \
  embed VECTOR HNSW 6 TYPE FLOAT32 DIM 3072 DISTANCE_METRIC COSINE M 16 EF_CONSTRUCTION 200

	•	DIM = dimension of the embedding model (e.g. 3072 for text-embedding-3-large).
	•	Supports both KNN vector similarity and keyword (BM25) search.

⸻

4. Content Map

Key:
rf:content-map

Type: STRING (JSON)

Stores a lightweight navigation graph for UI and chat navigation.

{
  "sections": [
    { "title": "About", "url": "/about" },
    { "title": "Communities", "url": "/communities", "children": [
      { "title": "React Bangalore", "url": "/communities/bengaluru" }
    ]},
    { "title": "Funding", "url": "/funding", "anchors": [
      { "text": "Eligibility", "anchor": "#eligibility" },
      { "text": "Apply", "anchor": "#apply" }
    ]}
  ]
}


⸻

Ingestion Flow

1. Sources

Source	Description	Loader
MDX Files	Local documentation, pages, FAQs	/lib/ingest/loaders/mdx.ts
Redis Communities	Dynamic data from your main app	/lib/ingest/loaders/communities.ts
External APIs	Optional CMS or partner data	/lib/ingest/loaders/api.ts

Each loader outputs an array of RawRecord:

type RawRecord = {
  id: string;
  type: string;
  title: string;
  url: string;
  updatedAt: string;
  tags?: Record<string, any>;
  body: string;
  anchors?: Array<{ text: string; anchor: string }>;
};


⸻

2. Chunking

Target size: ~950 tokens
Overlap: 100 tokens
Algorithm:

export function chunk(text: string, target = 950, overlap = 100) {
  const words = text.split(/\s+/);
  const out: string[] = [];
  for (let i = 0; i < words.length; ) {
    const slice = words.slice(i, i + target).join(' ');
    out.push(slice);
    i += target - overlap;
  }
  return out;
}


⸻

3. Embedding

API: OpenAI (or equivalent)

const res = await openai.embeddings.create({
  model: "text-embedding-3-large",
  input: chunks,
});

Each response is converted to a Float32Array and stored in Redis as a binary BLOB:

Buffer.from(new Float32Array(vector).buffer);


⸻

4. Upsert Pipeline
	1.	Write rf:items:<id> hash (canonical item)
	2.	Write rf:chunks:<itemId>:<ord> hash for each chunk
	3.	Add/update RediSearch index automatically
	4.	Update rf:content-map if relevant

Batching: Use Redis pipelines for performance.

⸻

Retrieval (Search API)

Route: /api/search

Request

{
  "query": "How do I start a new React community?",
  "k": 8
}

Steps
	1.	Embed the query → vector BLOB
	2.	Run hybrid KNN + BM25 search:

FT.SEARCH rf:chunks-idx
  "(@type:{community}|@type:{page}) => {$YIELD_DISTANCE_AS: score}
   *=>[KNN 8 @embed $VEC]
   @tsv:(\"start|community|create\")"
  PARAMS 2 VEC $BLOB
  DIALECT 2
  SORTBY score
  RETURN 6 item_id ord url anchor title text


	3.	Parse results, deduplicate by item_id, and return with url#anchor.

Response

{
  "hits": [
    {
      "title": "React Bangalore",
      "url": "/communities/bengaluru#organizers",
      "snippet": "To start a React community..."
    }
  ]
}


⸻

API Endpoints Summary

Path	Method	Description	Auth
/api/ingest/full	POST	Re-ingest all content (MDX + Redis communities)	Bearer Token
/api/ingest/delta	POST	Re-ingest items changed since timestamp	Bearer Token
/api/search	POST	Perform hybrid semantic search	Public
/api/content-map	GET	Return navigable content map	Public


⸻

Security
	•	Protect ingestion endpoints with a secret:

INGEST_TOKEN=supersecretvalue


	•	Verify in handler:

if (req.headers.authorization !== `Bearer ${process.env.INGEST_TOKEN}`)
  return res.status(401).end();



⸻

Vercel Integration

vercel.json

{
  "crons": [
    {
      "path": "/api/ingest/delta?since=-24h",
      "schedule": "0 2 * * *"
    }
  ]
}

This ensures daily synchronization of any changed Redis data or content files.

⸻

Example Directory Layout

/lib/
  redis.ts
  /ingest/
    chunk.ts
    embed.ts
    upsert.ts
    contentMap.ts
    /loaders/
      communities.ts
      mdx.ts
/pages/api/
  search.ts
  ingest/full.ts
  ingest/delta.ts
/scripts/
  ingest.ts
next.config.js
vercel.json


⸻

Deployment Flow
	1.	Developer pushes to main
	2.	GitHub Action builds site
	3.	Vercel deploys site
	4.	(Optional) GitHub Action calls /api/ingest/full to refresh embeddings for changed content
	5.	Vercel nightly cron calls /api/ingest/delta
	6.	Chat bot retrieves via /api/search

⸻

Bot Integration Behavior
	•	Every response cites url#anchor from rf:chunks.
	•	The bot can navigate users to exact sections.
	•	For “browse” queries, it reads rf:content-map and suggests links.

⸻

Future Enhancements
	•	Add multilingual embeddings (different index per language)
	•	Integrate reranker (optional LLM re-ranking)
	•	Add stream-based ingest (Redis Streams rf:events)
	•	Track coverage metrics (what % of pages are embedded)

⸻

Summary

Component	Description
Storage	Redis (RediSearch)
Index	rf:chunks-idx (hybrid: vector + text)
Embeddings	text-embedding-3-large
Ingestion	Push-based via API or GitHub Action
Search	Hybrid KNN + keyword
Navigation	rf:content-map
Deployment	Single Next.js app on Vercel
Security	Bearer token ingestion endpoints


⸻

Core Principles
	1.	Push, don’t crawl
Every content source pushes its text upstream for embedding.
	2.	Single source of truth
Redis stores both the canonical data and the search vectors.
	3.	Immediate navigability
Every chunk knows its url and anchor.
	4.	Zero downtime updates
Ingestion is incremental, fast, and idempotent.

⸻

Owner: React Foundation Engineering
Maintainer: Seth Webster
Last Updated: 2025-10-25

---

Would you like me to generate a **ready-to-deploy folder skeleton** (with all the files mentioned in the spec — stubs for loaders, APIs, and scripts) so you can drop it into your Next.js app immediately?