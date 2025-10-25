/**
 * Ingestion Service
 * Orchestrates crawling, content extraction, embedding generation, and storage
 */

import type Redis from 'ioredis';
import { EnhancedSiteCrawler, type CrawlerOptions } from './crawler-enhanced';
import { ContentExtractor, type ContentChunk } from './content-extractor';
import { FileIngester } from './file-ingest';
import { createEmbedding } from './openai';
import {
  upsertChunk,
  generateIndexName,
  generateIndexPrefix,
  createVectorIndex,
  swapToNewIndex,
  deleteIndex,
  getCurrentIndexName,
  updateIndexMetadata,
} from './vector-store';
import { getEmbeddingDimensions, getChatbotEnv } from './env';
import { logger } from '../logger';

export interface IngestionProgress {
  status: 'running' | 'completed' | 'failed';
  phase: 'crawling' | 'extracting' | 'embedding' | 'storing' | 'files' | 'swapping' | 'cleanup' | 'completed';
  crawledPages: number;
  totalPages: number;
  filesIngested: number;
  chunksCreated: number;
  chunksStored: number;
  currentUrl?: string;
  newIndexName?: string;
  oldIndexName?: string;
  logs: string[];
  errors: string[];
  startedAt: string;
  completedAt?: string;
}

export interface IngestionOptions extends CrawlerOptions {
  clearExisting?: boolean; // Deprecated - now always creates new index
  deleteOldIndex?: boolean; // Whether to delete old index after successful swap
  baseUrl: string;
}

export class IngestionService {
  private progress: IngestionProgress;
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
    this.progress = {
      status: 'running',
      phase: 'crawling',
      crawledPages: 0,
      totalPages: 0,
      filesIngested: 0,
      chunksCreated: 0,
      chunksStored: 0,
      logs: [],
      errors: [],
      startedAt: new Date().toISOString(),
    };
  }

  getProgress(): IngestionProgress {
    return { ...this.progress };
  }

  async ingest(options: IngestionOptions): Promise<void> {
    let newIndexName: string | null = null;
    let oldIndexName: string | null = null;

    try {
      this.addLog(`🚀 Starting ingestion for ${options.baseUrl}`);

      // Get current active index (before creating new one)
      oldIndexName = await getCurrentIndexName(this.redis);
      if (oldIndexName) {
        this.addLog(`Current active index: ${oldIndexName}`);
        this.progress.oldIndexName = oldIndexName;
      }

      // Generate new index name (blue-green deployment)
      newIndexName = generateIndexName();
      const newPrefix = generateIndexPrefix(newIndexName);
      this.progress.newIndexName = newIndexName;
      this.addLog(`🆕 Creating new index: ${newIndexName}`);

      // Create new vector index
      const env = getChatbotEnv();
      const dimensions = getEmbeddingDimensions(env.embeddingModel);
      await createVectorIndex(this.redis, newIndexName, newPrefix, dimensions);
      this.addLog(`✅ New index created: ${newIndexName}`);

      // Phase 1: Crawl site
      this.progress.phase = 'crawling';
      this.addLog('🕷️ Phase 1: Crawling site...');
      const crawlResults = await this.crawlSite(options);
      this.progress.crawledPages = crawlResults.length;
      this.addLog(`✅ Crawled ${crawlResults.length} pages`);

      // Phase 2: Extract and chunk content
      this.progress.phase = 'extracting';
      this.addLog('📄 Phase 2: Extracting and chunking content...');
      const chunks = await this.extractAndChunk(crawlResults);
      this.progress.chunksCreated = chunks.length;
      this.addLog(`✅ Created ${chunks.length} chunks`);

      // Phase 3: Ingest files from public-context
      this.progress.phase = 'files';
      this.addLog('📁 Phase 3: Ingesting public-context files...');
      const fileChunks = await this.ingestFiles();
      chunks.push(...fileChunks);
      this.progress.chunksCreated = chunks.length;
      this.addLog(`✅ Added ${fileChunks.length} chunks from files (${this.progress.filesIngested} files)`);

      // Phase 4 & 5: Generate embeddings and store (into new index)
      this.progress.phase = 'embedding';
      this.addLog('🧠 Phase 4: Generating embeddings and storing into new index...');
      await this.embedAndStore(chunks, newPrefix);
      this.addLog(`✅ Stored ${this.progress.chunksStored} chunks in new index`);

      // Update metadata with chunk count
      await updateIndexMetadata(this.redis, newIndexName, {
        chunkCount: this.progress.chunksStored,
      });

      // Phase 6: Atomic swap to new index
      this.progress.phase = 'swapping';
      this.addLog('🔄 Phase 5: Swapping to new index (atomic)...');
      const swappedOldIndex = await swapToNewIndex(this.redis, newIndexName);
      this.addLog(`✅ Swapped to new index: ${newIndexName}`);
      if (swappedOldIndex) {
        this.addLog(`Old index marked inactive: ${swappedOldIndex}`);
      }

      // Phase 7: Cleanup old index if requested
      if (options.deleteOldIndex !== false && swappedOldIndex) {
        this.progress.phase = 'cleanup';
        this.addLog('🗑️ Phase 6: Cleaning up old index...');
        await deleteIndex(this.redis, swappedOldIndex);
        this.addLog(`✅ Deleted old index: ${swappedOldIndex}`);
      } else if (swappedOldIndex) {
        this.addLog(`ℹ️ Old index preserved: ${swappedOldIndex}`);
      }

      // Complete
      this.progress.phase = 'completed';
      this.progress.status = 'completed';
      this.progress.completedAt = new Date().toISOString();
      this.addLog(`✅ Ingestion completed successfully!`);
      this.addLog(
        `📊 Final stats: ${this.progress.crawledPages} pages, ${this.progress.chunksCreated} chunks, ${this.progress.chunksStored} stored`
      );
      this.addLog(`🎯 Active index: ${newIndexName}`);
    } catch (error) {
      this.progress.status = 'failed';
      this.progress.completedAt = new Date().toISOString();
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`❌ Ingestion failed: ${errorMsg}`, 'error');
      throw error;
    }
  }

  private async crawlSite(options: IngestionOptions) {
    const crawler = new EnhancedSiteCrawler(options.baseUrl, {
      ...options,
      waitTime: 2000, // Wait 2 seconds for dynamic content to load
      onProgress: (current, total, url) => {
        this.progress.crawledPages = current;
        this.progress.totalPages = total;
        this.progress.currentUrl = url;
        if (current % 5 === 0 || current === total) {
          this.addLog(`🔍 Crawling: ${url} (${current}/${total})`);
        }
      },
    });

    return await crawler.crawl();
  }

  private async extractAndChunk(crawlResults: Array<{ url: string; title: string; html: string }>) {
    const extractor = new ContentExtractor({
      maxChunkSize: 1000,
      overlapSize: 200,
    });

    const allChunks: ContentChunk[] = [];

    for (const result of crawlResults) {
      try {
        const content = await extractor.extractContent(result.html, result.url);
        if (!content) {
          this.addLog(`⚠️ No content extracted from ${result.url}`, 'warn');
          continue;
        }

        const chunks = extractor.chunkContent(content, result.url, result.title);
        allChunks.push(...chunks);

        this.addLog(`📝 Extracted ${chunks.length} chunks from ${result.title}`);
      } catch (error) {
        this.addLog(
          `❌ Failed to extract content from ${result.url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    }

    return allChunks;
  }

  private async ingestFiles(): Promise<ContentChunk[]> {
    const fileIngester = new FileIngester();

    try {
      const results = await fileIngester.ingestPublicContext();
      this.progress.filesIngested = results.length;

      const allChunks: ContentChunk[] = [];
      for (const result of results) {
        allChunks.push(...result.chunks);
        this.addLog(`📄 Ingested ${result.title} (${result.chunks.length} chunks)`);
      }

      return allChunks;
    } catch (error) {
      this.addLog(
        `❌ Failed to ingest files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      return [];
    }
  }

  private async embedAndStore(chunks: ContentChunk[], prefix: string) {
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (chunk) => {
          try {
            // Generate embedding
            const embedding = await createEmbedding(chunk.content);

            // Store in Redis with specific prefix (new index)
            await upsertChunk(
              this.redis,
              chunk.id,
              {
                content: chunk.content,
                source: chunk.source,
                embedding,
              },
              prefix
            );

            this.progress.chunksStored++;

            if (this.progress.chunksStored % 10 === 0 || this.progress.chunksStored === chunks.length) {
              this.addLog(`💾 Stored ${this.progress.chunksStored}/${chunks.length} chunks`);
            }
          } catch (error) {
            this.addLog(
              `❌ Failed to embed/store chunk ${chunk.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              'error'
            );
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Deprecated - no longer needed with blue-green deployment
  // Kept for backward compatibility
  private async clearExistingChunks() {
    this.addLog('ℹ️ Note: clearExisting is deprecated - using blue-green deployment instead');
  }

  private addLog(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    const log = `[${timestamp}] ${icon} ${message}`;

    this.progress.logs.push(log);

    // Keep only last 200 logs
    if (this.progress.logs.length > 200) {
      this.progress.logs.shift();
    }

    if (level === 'error') {
      this.progress.errors.push(message);
      logger.error(message);
    } else if (level === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  }
}
