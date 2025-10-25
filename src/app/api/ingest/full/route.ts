/**
 * Full Ingestion API
 * Runs all loaders and ingests complete content set
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getRedisClient } from '@/lib/redis';
import { MDXLoader, CommunitiesLoader, LibrariesLoader, upsertRecords, generateContentMap, storeContentMap } from '@/lib/ingest';
import { createChunksIndex } from '@/lib/ingest/redis-index';
import { generateIndexName, generateIndexPrefix, getCurrentIndexName, swapToNewIndex, deleteIndex } from '@/lib/chatbot/vector-store';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs'; // Requires Node runtime for file system access
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

// Store ingestion progress in memory
interface IngestionProgress {
  status: 'running' | 'completed' | 'failed';
  logs: string[];
  result?: unknown;
  error?: string;
}

const ingestionProgress = new Map<string, IngestionProgress>();
const runningIngestions = new Map<string, Promise<void>>();

// Helper to add log
function addLog(ingestionId: string, message: string) {
  const progress = ingestionProgress.get(ingestionId);
  if (progress) {
    const timestamp = new Date().toLocaleTimeString();
    progress.logs.push(`[${timestamp}] ${message}`);

    // Keep only last 200 logs
    if (progress.logs.length > 200) {
      progress.logs.shift();
    }
  }
  logger.info(`[FullIngestion:${ingestionId}] ${message}`);
}

export async function POST(request: Request) {
  try {
    // Check for API token (for CI/CD workflows) or session auth (for admin UI)
    const authHeader = request.headers.get('Authorization');
    const apiToken = authHeader?.replace('Bearer ', '');

    // API token authentication (for GitHub Actions)
    if (apiToken && process.env.INGESTION_API_TOKEN) {
      if (apiToken !== process.env.INGESTION_API_TOKEN) {
        logger.warn('Invalid ingestion API token provided');
        return NextResponse.json({ error: 'Invalid API token' }, { status: 401 });
      }
      logger.info('Ingestion authenticated via API token');
    } else {
      // Session-based authentication (for admin UI)
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const isAdmin = await UserManagementService.isAdmin(session.user.email);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const ingestionId = `ingest-full-${Date.now()}`;

    // Check if ingestion is already running
    if (runningIngestions.size > 0) {
      return NextResponse.json(
        { error: 'An ingestion is already in progress' },
        { status: 409 }
      );
    }

    // Initialize progress tracking
    ingestionProgress.set(ingestionId, {
      status: 'running',
      logs: [],
    });

    const startTime = Date.now();
    const redis = getRedisClient();

    addLog(ingestionId, '🚀 Starting full content ingestion');

    // Run ingestion in background
    const ingestionPromise = (async () => {
      let newIndexName: string | null = null;
      let oldIndexName: string | null = null;

      try {
        // 1. Blue-Green: Get current index (before creating new one)
        oldIndexName = await getCurrentIndexName(redis);
        if (oldIndexName) {
          addLog(ingestionId, `📊 Current active index: ${oldIndexName}`);
        }

        // 2. Blue-Green: Generate new unique index name
        newIndexName = generateIndexName();
        const newPrefix = generateIndexPrefix(newIndexName);
        addLog(ingestionId, `🆕 Creating new index: ${newIndexName}`);

        // 3. Create new RediSearch index
        await createChunksIndex(redis);
        addLog(ingestionId, `✅ New index created: ${newIndexName}`);

        // 4. Initialize loaders
        const loaders = [
          new MDXLoader(), // Loads public-context markdown files (includes page-content/)
          new CommunitiesLoader(), // Loads communities from Redis
          new LibrariesLoader(), // Loads tracked libraries
        ];

        // 5. Load content from all sources
        addLog(ingestionId, `📂 Running ${loaders.length} loaders...`);
        const allRecords = [];
        const loaderStats = [];

        for (const loader of loaders) {
          const loaderStart = Date.now();
          addLog(ingestionId, `▶️ Running ${loader.name}...`);

          try {
            const records = await loader.load();
            allRecords.push(...records);

            loaderStats.push({
              loader: loader.name,
              records: records.length,
              duration_ms: Date.now() - loaderStart,
            });

            addLog(ingestionId, `✅ ${loader.name}: ${records.length} records in ${((Date.now() - loaderStart) / 1000).toFixed(1)}s`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            addLog(ingestionId, `❌ ${loader.name} failed: ${errorMsg}`);

            loaderStats.push({
              loader: loader.name,
              records: 0,
              duration_ms: Date.now() - loaderStart,
              error: errorMsg,
            });
          }
        }

        addLog(ingestionId, `📊 Total records loaded: ${allRecords.length}`);

        // 6. Upsert all records into NEW index (creates canonical items + chunks + embeddings)
        addLog(ingestionId, `🧠 Generating embeddings and storing into NEW index...`);
        addLog(ingestionId, `   Building ${allRecords.length} records into: ${newIndexName}`);

        const upsertStats = await upsertRecords(
          redis,
          allRecords,
          newPrefix,
          (current: number, total: number, recordTitle: string) => {
            // Log progress every 5 records or on last record
            if (current % 5 === 0 || current === total) {
              addLog(ingestionId, `   Processing [${current}/${total}]: ${recordTitle}`);
            }
          }
        );

        addLog(ingestionId, `✅ Created ${upsertStats.chunks_created} chunks with ${upsertStats.embeddings_generated} embeddings in new index`);

        if (upsertStats.errors.length > 0) {
          addLog(ingestionId, `⚠️ ${upsertStats.errors.length} errors occurred`);
        }

        // 7. Generate and store content map
        addLog(ingestionId, '🗺️ Generating content map...');
        const contentMap = generateContentMap(allRecords);
        await storeContentMap(redis, contentMap);
        addLog(ingestionId, `✅ Content map created with ${contentMap.sections.length} sections`);

        // 7.5. Create index metadata (required for swap)
        // Using correct metadata key pattern from vector-store.ts
        const metadataKey = `vector-store:index:${newIndexName}`;
        await redis.set(metadataKey, JSON.stringify({
          indexName: newIndexName,
          prefix: newPrefix,
          chunkCount: upsertStats.chunks_created,
          createdAt: new Date().toISOString(),
          status: 'ready',
        }));

        // 8. Blue-Green: Atomic swap to new index
        addLog(ingestionId, '🔄 Swapping to new index (atomic, zero downtime)...');
        const swappedOldIndex = await swapToNewIndex(redis, newIndexName);
        addLog(ingestionId, `✅ Swapped to new index: ${newIndexName}`);

        if (swappedOldIndex) {
          addLog(ingestionId, `   Old index marked inactive: ${swappedOldIndex}`);

          // 9. Blue-Green: Cleanup old index
          addLog(ingestionId, '🗑️ Cleaning up old index...');
          await deleteIndex(redis, swappedOldIndex);
          addLog(ingestionId, `✅ Deleted old index: ${swappedOldIndex}`);
        }

        // 10. Complete
        const totalDuration = Date.now() - startTime;

        const result = {
          success: true,
          duration_ms: totalDuration,
          loaders: loaderStats,
          ingestion: {
            records_processed: allRecords.length,
            items_created: upsertStats.items_created,
            chunks_created: upsertStats.chunks_created,
            embeddings_generated: upsertStats.embeddings_generated,
            errors: upsertStats.errors.length,
          },
          content_map: {
            sections: contentMap.sections.length,
          },
        };

        addLog(ingestionId, `🎉 Ingestion completed successfully in ${(totalDuration / 1000).toFixed(1)}s`);
        addLog(ingestionId, `📊 Final stats: ${result.ingestion.chunks_created} chunks, ${result.ingestion.embeddings_generated} embeddings`);

        const progress = ingestionProgress.get(ingestionId);
        if (progress) {
          progress.status = 'completed';
          progress.result = result;
        }

        runningIngestions.delete(ingestionId);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(ingestionId, `❌ Ingestion failed: ${errorMsg}`);

        const progress = ingestionProgress.get(ingestionId);
        if (progress) {
          progress.status = 'failed';
          progress.error = errorMsg;
        }

        runningIngestions.delete(ingestionId);
      }
    })();

    runningIngestions.set(ingestionId, ingestionPromise);

    // Store as latest ingestion ID in Redis for all admins to see
    await redis.set('rf:latest-ingestion-id', ingestionId);

    return NextResponse.json({
      ingestionId,
      message: 'Ingestion started',
    });
  } catch (error) {
    logger.error('[FullIngestion] Failed to start:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check progress
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ingestionId = searchParams.get('ingestionId');

    // If no ingestionId, check for running ingestion
    if (!ingestionId) {
      // Return first running ingestion if any
      for (const [id, progress] of ingestionProgress.entries()) {
        if (progress.status === 'running') {
          return NextResponse.json({
            ingestionId: id,
            status: 'running',
            isRunning: true,
          });
        }
      }

      // No running ingestion
      return NextResponse.json({
        ingestionId: null,
        isRunning: false,
      });
    }

    const progress = ingestionProgress.get(ingestionId);
    if (!progress) {
      return NextResponse.json(
        { error: 'Ingestion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    logger.error('[FullIngestion] Failed to get progress:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get progress',
      },
      { status: 500 }
    );
  }
}
