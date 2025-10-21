/**
 * RIS Allocation API Route
 * Returns the current quarterly allocation with RIS scores
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedQuarterlyAllocation } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Get period from query params, default to current quarter
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || getCurrentQuarter();

    // Try to get from cache
    const allocation = await getCachedQuarterlyAllocation(period);

    if (!allocation) {
      return NextResponse.json(
        {
          error: 'No allocation data available',
          message: 'Run data collection first via POST /api/ris/collect',
          period,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(allocation);
  } catch (error) {
    console.error('Allocation fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch allocation',
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
