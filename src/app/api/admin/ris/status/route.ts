/**
 * API endpoint to check RIS collection status
 * GET: Get collection status for libraries
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getCollectionState,
  getFailedCollections,
  getCollectionStats,
} from '@/lib/ris/collection-state';
import { getSchedulerStats } from '@/lib/ris/collection-scheduler';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const type = searchParams.get('type') || 'overview'; // 'overview', 'failed', or 'library'

    // Get specific library status
    if (type === 'library' && owner && repo) {
      const state = await getCollectionState(owner, repo);

      if (!state) {
        return NextResponse.json(
          { error: 'No collection state found for this library' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        library: `${owner}/${repo}`,
        state,
      });
    }

    // Get failed collections
    if (type === 'failed') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const failed = await getFailedCollections(limit);

      return NextResponse.json({
        success: true,
        count: failed.length,
        failed,
      });
    }

    // Default: Get overview stats
    const [collectionStats, schedulerStats] = await Promise.all([
      getCollectionStats(),
      getSchedulerStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        ...collectionStats,
        ...schedulerStats,
      },
    });

  } catch (error) {
    logger.error('Error getting collection status:', error);
    return NextResponse.json(
      { error: 'Failed to get collection status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
