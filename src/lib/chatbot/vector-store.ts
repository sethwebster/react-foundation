import type Redis from 'ioredis';
import { getChatbotEnv, getEmbeddingDimensions } from './env';
import { logger } from '../logger';

export interface VectorSearchResult {
  id: string;
  score: number;
  content: string;
  source: string;
}

export interface VectorSearchOptions {
  k?: number;
  minScore?: number;
}

// Redis key for tracking the current active index
const CURRENT_INDEX_KEY = 'vector-store:current-index';
const INDEX_METADATA_PREFIX = 'vector-store:index:';

export interface IndexMetadata {
  indexName: string;
  prefix: string;
  createdAt: string;
  chunkCount?: number;
  status: 'building' | 'active' | 'inactive';
}

function getEnv() {
  return getChatbotEnv();
}

/**
 * Generate a new unique index name
 */
export function generateIndexName(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const random = Math.random().toString(36).substring(2, 8);
  return `idx:chatbot:${timestamp}-${random}`;
}

/**
 * Generate prefix for a specific index
 */
export function generateIndexPrefix(indexName: string): string {
  return `chatbot:${indexName}:`;
}

/**
 * Create a new vector index with specified name and prefix
 */
export async function createVectorIndex(
  redis: Redis,
  indexName: string,
  prefix: string,
  dimensions: number
): Promise<void> {
  const algorithmParams: (string | number)[] = [
    'TYPE',
    'FLOAT32',
    'DIM',
    dimensions,
    'DISTANCE_METRIC',
    'COSINE',
    'INITIAL_CAP',
    2000,
    'M',
    16,
    'EF_CONSTRUCTION',
    200,
    'EF_RUNTIME',
    10,
  ];

  await redis.call(
    'FT.CREATE',
    indexName,
    'ON',
    'HASH',
    'PREFIX',
    '1',
    prefix,
    'SCHEMA',
    'id',
    'TEXT',
    'source',
    'TEXT',
    'content',
    'TEXT',
    'embedding',
    'VECTOR',
    'HNSW',
    algorithmParams.length.toString(),
    ...algorithmParams.map((value) => value.toString())
  );

  // Store metadata about this index
  const metadata: IndexMetadata = {
    indexName,
    prefix,
    createdAt: new Date().toISOString(),
    status: 'building',
  };

  await redis.set(
    `${INDEX_METADATA_PREFIX}${indexName}`,
    JSON.stringify(metadata)
  );

  logger.info(`Created new vector index: ${indexName}`);
}

/**
 * Legacy function - maintained for backward compatibility
 * Creates index using default env config
 */
export function ensureVectorIndex(redis: Redis, dimensions: number): Promise<unknown> {
  const env = getEnv();
  return createVectorIndex(redis, env.redisIndex, env.redisPrefix, dimensions);
}

/**
 * Get the currently active index name from Redis
 */
export async function getCurrentIndexName(redis: Redis): Promise<string | null> {
  const currentIndex = await redis.get(CURRENT_INDEX_KEY);
  return currentIndex;
}

/**
 * Set the currently active index
 */
export async function setCurrentIndex(redis: Redis, indexName: string): Promise<void> {
  await redis.set(CURRENT_INDEX_KEY, indexName);
  logger.info(`Set current index to: ${indexName}`);
}

/**
 * Get metadata for an index
 */
export async function getIndexMetadata(
  redis: Redis,
  indexName: string
): Promise<IndexMetadata | null> {
  const data = await redis.get(`${INDEX_METADATA_PREFIX}${indexName}`);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Update index metadata
 */
export async function updateIndexMetadata(
  redis: Redis,
  indexName: string,
  updates: Partial<IndexMetadata>
): Promise<void> {
  const existing = await getIndexMetadata(redis, indexName);
  if (!existing) {
    throw new Error(`Index metadata not found: ${indexName}`);
  }

  const updated: IndexMetadata = { ...existing, ...updates };
  await redis.set(
    `${INDEX_METADATA_PREFIX}${indexName}`,
    JSON.stringify(updated)
  );
}

/**
 * Swap to a new index atomically
 */
export async function swapToNewIndex(
  redis: Redis,
  newIndexName: string
): Promise<string | null> {
  // Get old index name before swapping
  const oldIndexName = await getCurrentIndexName(redis);

  // Mark new index as active
  await updateIndexMetadata(redis, newIndexName, { status: 'active' });

  // Swap to new index
  await setCurrentIndex(redis, newIndexName);

  // Mark old index as inactive (tolerate missing metadata for old indexes)
  if (oldIndexName) {
    try {
      // Check if metadata exists first
      const oldMetadata = await getIndexMetadata(redis, oldIndexName);
      if (oldMetadata) {
        await updateIndexMetadata(redis, oldIndexName, { status: 'inactive' });
      } else {
        logger.info(`Old index ${oldIndexName} has no metadata (pre-blue-green index), skipping status update`);
      }
    } catch (error) {
      logger.warn(`Could not mark old index as inactive: ${oldIndexName}`, error);
    }
  }

  logger.info(`Swapped from ${oldIndexName || 'none'} to ${newIndexName}`);
  return oldIndexName;
}

/**
 * Delete an old index and its data
 */
export async function deleteIndex(redis: Redis, indexName: string): Promise<void> {
  // Get metadata to find prefix
  const metadata = await getIndexMetadata(redis, indexName);

  if (!metadata) {
    logger.warn(`No metadata found for index: ${indexName}`);
    return;
  }

  // Delete the index
  try {
    await redis.call('FT.DROPINDEX', indexName, 'DD'); // DD = delete documents
    logger.info(`Deleted index: ${indexName}`);
  } catch (error) {
    logger.warn(`Error deleting index ${indexName}:`, error);
  }

  // Delete metadata
  await redis.del(`${INDEX_METADATA_PREFIX}${indexName}`);

  logger.info(`Cleaned up index: ${indexName}`);
}

/**
 * List all indices
 */
export async function listAllIndices(redis: Redis): Promise<IndexMetadata[]> {
  const keys = await redis.keys(`${INDEX_METADATA_PREFIX}*`);
  const indices: IndexMetadata[] = [];

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      try {
        indices.push(JSON.parse(data));
      } catch {
        // Skip invalid metadata
      }
    }
  }

  return indices.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Check if Redis has RediSearch module loaded
 */
async function checkRedisSearchAvailable(redis: Redis): Promise<boolean> {
  try {
    // Try to list indices - if RediSearch is available, this will work
    await redis.call('FT._LIST');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Check if it's an "unknown command" error
    if (message.includes('unknown command') || message.includes('ERR unknown')) {
      logger.error('Redis Stack / RediSearch module not available. Chatbot will not work.');
      logger.error('Please ensure you are using Redis Stack, not regular Redis.');
      logger.error('See: https://redis.io/docs/getting-started/install-stack/');
      return false;
    }

    // Some other error - rethrow
    throw error;
  }
}

/**
 * Ensure current index exists, or create default one
 * Used for backward compatibility and initial setup
 */
export async function ensureVectorIndexIfMissing(redis: Redis): Promise<void> {
  // First check if RediSearch is available
  const hasRediSearch = await checkRedisSearchAvailable(redis);
  if (!hasRediSearch) {
    throw new Error('Redis Stack / RediSearch module not available. Cannot use vector search.');
  }

  const env = getEnv();
  const dimensions = getEmbeddingDimensions(env.embeddingModel);

  // Check if we have a current index set
  let currentIndex = await getCurrentIndexName(redis);

  if (currentIndex) {
    // Verify it exists
    try {
      await redis.call('FT.INFO', currentIndex);
      return; // Index exists and is valid
    } catch (error) {
      logger.warn(`Current index ${currentIndex} not found, creating new one`);
    }
  }

  // No current index or it doesn't exist, check for default index
  try {
    await redis.call('FT.INFO', env.redisIndex);
    // Default index exists, use it
    await setCurrentIndex(redis, env.redisIndex);
    logger.info(`Using existing default index: ${env.redisIndex}`);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const missing =
      message.includes('Unknown Index name') ||
      message.includes('no such index') ||
      message.includes('Unknown index');

    if (!missing) {
      throw error;
    }
  }

  // Create default index
  await createVectorIndex(redis, env.redisIndex, env.redisPrefix, dimensions);
  await setCurrentIndex(redis, env.redisIndex);
  logger.info(`Created and activated default index: ${env.redisIndex}`);
}

export function embeddingToBuffer(embedding: number[]): Buffer {
  const array = new Float32Array(embedding);
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength);
}

export function bufferToEmbedding(buffer: Buffer): number[] {
  const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
  return Array.from(floatArray);
}

/**
 * Upsert a chunk using a specific prefix
 */
export async function upsertChunk(
  redis: Redis,
  id: string,
  payload: { content: string; source: string; embedding: number[] },
  prefix?: string
): Promise<void> {
  const env = getEnv();
  const keyPrefix = prefix || env.redisPrefix;
  const key = `${keyPrefix}${id}`;

  await redis.hset(
    key,
    'id',
    id,
    'content',
    payload.content,
    'source',
    payload.source,
    'embedding',
    embeddingToBuffer(payload.embedding)
  );
}

export async function deleteChunks(redis: Redis, ids: string[]): Promise<void> {
  const env = getEnv();
  if (!ids.length) return;
  const keys = ids.map((id) => `${env.redisPrefix}${id}`);
  await redis.del(keys);
}

/**
 * Search using the currently active index
 */
export async function searchSimilar(
  redis: Redis,
  embedding: number[],
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  // Get current active index
  const currentIndex = await getCurrentIndexName(redis);

  if (!currentIndex) {
    logger.warn('No active index found for search');
    return [];
  }

  const k = options.k ?? 5;
  const minScore = options.minScore ?? 0;
  const vectorBuffer = embeddingToBuffer(embedding);
  const query = `*=>[KNN ${k} @embedding $vector AS score]`;

  const args: (string | number | Buffer)[] = [
    currentIndex,
    query,
    'PARAMS',
    '2',
    'vector',
    vectorBuffer,
    'SORTBY',
    'score',
    'RETURN',
    '4',
    'score',
    'content',
    'source',
    'id',
    'DIALECT',
    '2',
  ];

  try {
    const raw = (await redis.call('FT.SEARCH', ...args)) as unknown;

    if (!Array.isArray(raw)) {
      return [];
    }

    return parseSearchResults(raw, minScore);
  } catch (error) {
    logger.error(`Search failed on index ${currentIndex}:`, error);
    return [];
  }
}

function parseSearchResults(data: unknown[], minScore: number): VectorSearchResult[] {
  if (!Array.isArray(data)) return [];
  const [, ...rest] = data;
  const results: VectorSearchResult[] = [];

  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i];
    const fields = rest[i + 1];
    if (typeof key !== 'string' || !Array.isArray(fields)) continue;

    let id = key;
    let score = 0;
    let content = '';
    let source = '';

    for (let j = 0; j < fields.length; j += 2) {
      const field = fields[j];
      const value = fields[j + 1];
      if (field === 'score' && typeof value === 'string') {
        score = Number.parseFloat(value);
      } else if (field === 'content' && typeof value === 'string') {
        content = value;
      } else if (field === 'source' && typeof value === 'string') {
        source = value;
      } else if (field === 'id' && typeof value === 'string') {
        id = value;
      }
    }

    if (score >= minScore) {
      results.push({ id, score, content, source });
    }
  }

  return results;
}
