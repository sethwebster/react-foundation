/**
 * Latest Ingestion API
 * Returns the most recent ingestion progress (for all admins to see)
 */

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();

    // Get latest ingestion ID from Redis
    const latestId = await redis.get('rf:latest-ingestion-id');

    if (!latestId) {
      return NextResponse.json({
        ingestionId: null,
        message: 'No previous ingestion found',
      });
    }

    return NextResponse.json({
      ingestionId: latestId,
    });
  } catch (error) {
    logger.error('[LatestIngestion] Failed to get latest:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get latest ingestion',
      },
      { status: 500 }
    );
  }
}
