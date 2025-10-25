/**
 * Upsert Utility
 * Stores canonical items and chunks in Redis
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import type Redis from 'ioredis';
import type { RawRecord, CanonicalItem, Chunk, IngestionStats } from './types';
import { chunkText } from './chunk';
import { generateEmbeddings, embeddingToBuffer } from './embed';
import { logger } from '../logger';

/**
 * Upsert a raw record: create canonical item + chunks with embeddings
 *
 * @param redis - Redis client
 * @param record - Raw record from loader
 * @param indexPrefix - Prefix for chunk keys (e.g., 'rf:chunks:')
 * @returns Number of chunks created
 */
export async function upsertRecord(
  redis: Redis,
  record: RawRecord,
  indexPrefix: string = 'rf:chunks:'
): Promise<number> {
  const pipeline = redis.pipeline();

  // 1. Store canonical item
  const canonicalKey = `rf:items:${record.id}`;
  const canonicalItem: CanonicalItem = {
    type: record.type,
    title: record.title,
    url: record.url,
    source: 'loader',
    updated_at: record.updatedAt,
    tags: JSON.stringify(record.tags || {}),
  };

  pipeline.hset(canonicalKey, canonicalItem as unknown as Record<string, string>);

  // 2. Chunk the body text
  const chunks = chunkText(record.body);

  if (chunks.length === 0) {
    logger.warn(`[upsertRecord] No chunks generated for ${record.id}`);
    await pipeline.exec();
    return 0;
  }

  // 3. Generate embeddings for all chunks
  logger.info(`[upsertRecord] Generating ${chunks.length} embeddings for ${record.id}`);
  const embeddings = await generateEmbeddings(chunks);

  // 4. Store each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkKey = `${indexPrefix}${record.id}:${i}`;

    // Convert embedding to base64 for Redis storage
    const embedBuffer = embeddingToBuffer(embeddings[i]);

    const chunkData: Record<string, string | number> = {
      item_id: record.id,
      ord: i,
      text: chunks[i],
      url: record.url,
      title: record.title,
      type: record.type,
      updated_at: record.updatedAt,
      tsv: chunks[i], // For BM25 full-text search
      embed: embedBuffer.toString('base64'),
    };

    // Add optional anchor if available
    if (record.anchors && record.anchors[0]) {
      chunkData.anchor = record.anchors[0].anchor;
    }

    // Store chunk fields
    pipeline.hset(chunkKey, chunkData);
  }

  await pipeline.exec();

  logger.info(`[upsertRecord] Stored ${chunks.length} chunks for ${record.id}`);
  return chunks.length;
}

/**
 * Upsert multiple records in batch
 *
 * @param redis - Redis client
 * @param records - Array of raw records
 * @param indexPrefix - Prefix for chunk keys
 * @param onProgress - Optional callback for progress updates
 * @returns Ingestion statistics
 */
export async function upsertRecords(
  redis: Redis,
  records: RawRecord[],
  indexPrefix: string = 'rf:chunks:',
  onProgress?: (current: number, total: number, recordTitle: string) => void
): Promise<IngestionStats> {
  const stats: IngestionStats = {
    items_created: 0,
    items_updated: 0,
    chunks_created: 0,
    chunks_updated: 0,
    chunks_deleted: 0,
    embeddings_generated: 0,
    duration_ms: 0,
    errors: [],
  };

  const startTime = Date.now();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      // Notify progress
      onProgress?.(i + 1, records.length, record.title);

      const chunksCreated = await upsertRecord(redis, record, indexPrefix);
      stats.items_created++;
      stats.chunks_created += chunksCreated;
      stats.embeddings_generated += chunksCreated;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[upsertRecords] Failed to upsert ${record.id}:`, error);
      stats.errors.push({ item_id: record.id, error: errorMsg });
    }
  }

  stats.duration_ms = Date.now() - startTime;

  logger.info(`[upsertRecords] Completed: ${stats.items_created} items, ${stats.chunks_created} chunks, ${stats.errors.length} errors`);

  return stats;
}

/**
 * Delete all chunks for a record
 *
 * @param redis - Redis client
 * @param recordId - Record ID
 * @param indexPrefix - Prefix for chunk keys
 * @returns Number of chunks deleted
 */
export async function deleteRecord(
  redis: Redis,
  recordId: string,
  indexPrefix: string = 'rf:chunks:'
): Promise<number> {
  // Find all chunk keys for this record
  const pattern = `${indexPrefix}${recordId}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length === 0) {
    return 0;
  }

  // Delete all chunks
  await redis.del(...keys);

  // Delete canonical item
  await redis.del(`rf:items:${recordId}`);

  logger.info(`[deleteRecord] Deleted ${keys.length} chunks for ${recordId}`);
  return keys.length;
}
