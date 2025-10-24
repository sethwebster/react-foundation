/**
 * Single Community API Route
 * GET /api/communities/[slug] - Fetch a single community by slug
 */

import { NextResponse } from 'next/server';
import { getCommunityBySlug } from '@/data/communities';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const community = getCommunityBySlug(slug);

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      community,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}
