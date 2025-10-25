/**
 * Ingestion System Types
 * Based on AUTO_INGESTION_SETUP.md specification
 */

/**
 * Raw record from content loaders
 * Each loader outputs an array of RawRecord
 */
export interface RawRecord {
  id: string;
  type: string; // e.g., 'page', 'faq', 'community', 'library'
  title: string;
  url: string;
  updatedAt: string; // ISO string
  tags?: Record<string, unknown>;
  body: string; // Main content to chunk and embed
  anchors?: Array<{ text: string; anchor: string }>; // For deep linking
}

/**
 * Canonical item stored in Redis
 * Key pattern: rf:items:<id>
 */
export interface CanonicalItem {
  type: string;
  title: string;
  url: string;
  source: string; // Origin: 'redis', 'mdx', 'cms', etc.
  updated_at: string; // ISO string
  tags: string; // JSON string of metadata
}

/**
 * Chunk with embedding stored in Redis
 * Key pattern: rf:chunks:<itemId>:<ord>
 */
export interface Chunk {
  item_id: string; // Reference to canonical item
  ord: number; // Chunk order (0-indexed)
  text: string; // Raw chunk text
  url: string; // Canonical URL
  anchor?: string; // Optional anchor for deep linking
  title: string; // Title of parent item
  type: string; // Type of parent item
  updated_at: string; // ISO string
  tsv: string; // Text for full-text BM25 search
  embed: Buffer; // Vector embedding (Float32Array as Buffer)
}

/**
 * Content map for navigation
 * Stored in rf:content-map as JSON string
 */
export interface ContentMap {
  sections: ContentSection[];
}

export interface ContentSection {
  title: string;
  url: string;
  children?: ContentSection[];
  anchors?: Array<{ text: string; anchor: string }>;
}

/**
 * Search request
 */
export interface SearchRequest {
  query: string;
  k?: number; // Number of results (default 8)
  type?: string; // Filter by type
}

/**
 * Search result hit
 */
export interface SearchHit {
  title: string;
  url: string; // May include #anchor
  snippet: string;
  type: string;
  score: number;
}

/**
 * Search response
 */
export interface SearchResponse {
  hits: SearchHit[];
  query: string;
  took_ms: number;
}

/**
 * Loader interface - all loaders implement this
 */
export interface ContentLoader {
  name: string;
  load(): Promise<RawRecord[]>;
}

/**
 * Ingestion statistics
 */
export interface IngestionStats {
  items_created: number;
  items_updated: number;
  chunks_created: number;
  chunks_updated: number;
  chunks_deleted: number;
  embeddings_generated: number;
  duration_ms: number;
  errors: Array<{ item_id: string; error: string }>;
}
