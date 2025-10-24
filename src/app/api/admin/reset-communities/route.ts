/**
 * Admin API: Reset Communities
 * POST /api/admin/reset-communities
 * Clears Redis and forces re-seed
 */

import { NextResponse } from 'next/server';
import { forceSeed } from '@/lib/redis-communities';
import { REACT_COMMUNITIES } from '@/data/communities';

export async function POST(request: Request) {
  try {
    console.log('🗑️ Resetting communities...');

    // Force re-seed (clears old data first)
    await forceSeed(REACT_COMMUNITIES);

    console.log(`✅ Reset complete - ${REACT_COMMUNITIES.length} communities seeded`);

    return NextResponse.json({
      success: true,
      message: `${REACT_COMMUNITIES.length} communities from source`,
    });

  } catch (error: any) {
    console.error('❌ Reset failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
