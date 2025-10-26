/**
 * RIS Collection Status API Route
 * Returns the current status of data collection
 */

import { NextResponse } from 'next/server';
import { getCollectionStatus, getLastUpdated, isCollectionLocked } from '@/lib/redis';

export async function GET() {
  try {
    const [status, lastUpdated, lockExists] = await Promise.all([
      getCollectionStatus(),
      getLastUpdated(),
      isCollectionLocked(),
    ]);

    // If status says "running" but lock doesn't exist, the process crashed
    if (status && status.status === 'running' && !lockExists) {
      return NextResponse.json({
        status: {
          status: 'failed',
          message: 'Collection was interrupted (lock expired)',
          progress: status.progress,
          total: status.total,
          startedAt: status.startedAt,
          completedAt: new Date().toISOString(),
        },
        lastUpdated: lastUpdated || null,
        currentQuarter: getCurrentQuarter(),
      });
    }

    return NextResponse.json({
      status: status || { status: 'idle', message: 'No collection running' },
      lastUpdated: lastUpdated || null,
      currentQuarter: getCurrentQuarter(),
    });
  } catch (error) {
    console.error('Status fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get current quarter (e.g., "2025-Q4")
 */
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);

  return `${year}-Q${quarter}`;
}
