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
import { logger } from '@/lib/logger';

export const runtime = 'nodejs'; // Requires Node runtime for file system access
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

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

    const startTime = Date.now();
    const redis = getRedisClient();

    logger.info('[FullIngestion] Starting full content ingestion');

    // 1. Ensure RediSearch index exists
    logger.info('[FullIngestion] Ensuring RediSearch index exists');
    await createChunksIndex(redis);

    // 2. Initialize loaders
    const loaders = [
      new MDXLoader(), // Loads public-context markdown files
      new CommunitiesLoader(), // Loads communities from Redis
      new LibrariesLoader(), // Loads tracked libraries
    ];

    // 3. Load content from all sources
    logger.info(`[FullIngestion] Running ${loaders.length} loaders`);
    const allRecords = [];
    const loaderStats = [];

    for (const loader of loaders) {
      const loaderStart = Date.now();
      try {
        const records = await loader.load();
        allRecords.push(...records);

        loaderStats.push({
          loader: loader.name,
          records: records.length,
          duration_ms: Date.now() - loaderStart,
        });

        logger.info(`[FullIngestion] ${loader.name}: ${records.length} records in ${Date.now() - loaderStart}ms`);
      } catch (error) {
        logger.error(`[FullIngestion] ${loader.name} failed:`, error);
        loaderStats.push({
          loader: loader.name,
          records: 0,
          duration_ms: Date.now() - loaderStart,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 4. Upsert all records (creates canonical items + chunks + embeddings)
    logger.info(`[FullIngestion] Upserting ${allRecords.length} records`);
    const upsertStats = await upsertRecords(redis, allRecords, 'rf:chunks:');

    // 5. Generate and store content map
    logger.info('[FullIngestion] Generating content map');
    const contentMap = generateContentMap(allRecords);
    await storeContentMap(redis, contentMap);

    // 6. Return statistics
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

    logger.info('[FullIngestion] Completed successfully:', result);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('[FullIngestion] Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
