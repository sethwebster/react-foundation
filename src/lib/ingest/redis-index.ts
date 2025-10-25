/**
 * RediSearch Index Management
 * Creates and manages vector + text search index
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import type Redis from 'ioredis';
import { getEmbeddingDimensions, getChatbotEnv } from '../chatbot/env';
import { logger } from '../logger';

/**
 * Create RediSearch index for chunks
 * Supports both vector (KNN) and text (BM25) search
 *
 * Index name: rf:chunks-idx
 * Prefix: rf:chunks:
 *
 * @param redis - Redis client
 */
export async function createChunksIndex(redis: Redis): Promise<void> {
  const indexName = 'rf:chunks-idx';
  const prefix = 'rf:chunks:';

  try {
    // Check if index already exists
    try {
      await redis.call('FT.INFO', indexName);
      logger.info(`[createChunksIndex] Index ${indexName} already exists`);
      return;
    } catch (error) {
      // Index doesn't exist, create it
    }

    const env = getChatbotEnv();
    const dimensions = getEmbeddingDimensions(env.embeddingModel);

    logger.info(`[createChunksIndex] Creating index ${indexName} with ${dimensions} dimensions`);

    // Create index with vector + text fields
    // VECTOR HNSW count should be number of attribute-value pairs × 2
    // We have 5 pairs: TYPE, DIM, DISTANCE_METRIC, M, EF_CONSTRUCTION = 10 total items
    await redis.call(
      'FT.CREATE',
      indexName,
      'ON',
      'HASH',
      'PREFIX',
      '1',
      prefix,
      'SCHEMA',
      'item_id',
      'TAG',
      'type',
      'TAG',
      'title',
      'TEXT',
      'url',
      'TEXT',
      'anchor',
      'TEXT',
      'updated_at',
      'TEXT',
      'tsv',
      'TEXT',
      'WEIGHT',
      '1.0',
      'embed',
      'VECTOR',
      'HNSW',
      '10',  // Changed from 6 to 10 (5 pairs × 2)
      'TYPE',
      'FLOAT32',
      'DIM',
      dimensions.toString(),
      'DISTANCE_METRIC',
      'COSINE',
      'M',
      '16',
      'EF_CONSTRUCTION',
      '200'
    );

    logger.info(`[createChunksIndex] Successfully created index ${indexName}`);
  } catch (error) {
    logger.error('[createChunksIndex] Failed to create index:', error);
    throw error;
  }
}

/**
 * Delete RediSearch index
 *
 * @param redis - Redis client
 */
export async function deleteChunksIndex(redis: Redis): Promise<void> {
  const indexName = 'rf:chunks-idx';

  try {
    await redis.call('FT.DROPINDEX', indexName, 'DD');
    logger.info(`[deleteChunksIndex] Deleted index ${indexName}`);
  } catch (error) {
    logger.warn('[deleteChunksIndex] Failed to delete index (may not exist):', error);
  }
}

/**
 * Get index statistics
 *
 * @param redis - Redis client
 * @returns Index info or null
 */
export async function getIndexInfo(redis: Redis): Promise<Record<string, unknown> | null> {
  const indexName = 'rf:chunks-idx';

  try {
    const info = await redis.call('FT.INFO', indexName) as unknown[];

    // Parse info array into object
    const result: Record<string, unknown> = {};
    for (let i = 0; i < info.length; i += 2) {
      const key = info[i] as string;
      const value = info[i + 1];
      result[key] = value;
    }

    return result;
  } catch (error) {
    logger.warn('[getIndexInfo] Failed to get index info:', error);
    return null;
  }
}
