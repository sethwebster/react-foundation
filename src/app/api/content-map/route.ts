/**
 * Content Map API
 * Returns navigation graph for chatbot and UI
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { loadContentMap } from '@/lib/ingest/content-map';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();

    // Load content map from Redis
    const contentMap = await loadContentMap(redis);

    if (!contentMap) {
      return NextResponse.json(
        { error: 'Content map not found. Run /api/ingest/full first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(contentMap);
  } catch (error) {
    logger.error('[ContentMapAPI] Failed to load content map:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load content map',
      },
      { status: 500 }
    );
  }
}
