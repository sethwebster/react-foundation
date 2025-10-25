/**
 * Index Statistics API
 * Returns current RediSearch index statistics
 */

import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getIndexInfo } from '@/lib/ingest/redis-index';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();
    const info = await getIndexInfo(redis);

    if (!info) {
      return NextResponse.json({
        index_name: 'rf:chunks-idx',
        num_docs: 0,
        num_records: 0,
        indexing: 0,
      });
    }

    // Parse RediSearch info response
    const stats = {
      index_name: (info.index_name as string) || 'rf:chunks-idx',
      num_docs: parseInt(info.num_docs as string) || 0,
      num_records: parseInt(info.num_records as string) || 0,
      indexing: parseInt(info.indexing as string) || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('[IndexStats] Failed to get stats:', error);
    // Return zeros instead of error - stats are optional
    return NextResponse.json({
      index_name: 'rf:chunks-idx',
      num_docs: 0,
      num_records: 0,
      indexing: 0,
    });
  }
}
