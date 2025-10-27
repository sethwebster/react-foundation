/**
 * RIS Raw Metrics Diagnostic API
 * Returns raw metrics for a library to debug collection issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getCachedLibraryMetrics } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication - require admin role
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner') || 'facebook';
    const repo = searchParams.get('repo') || 'react';

    // Get cached metrics
    const metrics = await getCachedLibraryMetrics(owner, repo);

    if (!metrics) {
      return NextResponse.json({
        error: 'No cached metrics found',
        owner,
        repo,
        message: 'Run data collection first via POST /api/ris/collect',
      }, { status: 404 });
    }

    // Format EF metrics
    const ef = {
      npm_downloads: metrics.npm_downloads,
      gh_dependents: metrics.gh_dependents,
      import_mentions: metrics.import_mentions,
      cdn_hits: metrics.cdn_hits,
    };

    // Format CB metrics
    const cb = {
      docs_completeness: metrics.docs_completeness,
      tutorials_refs: metrics.tutorials_refs,
      helpful_events: metrics.helpful_events,
      user_satisfaction: metrics.user_satisfaction,
    };

    return NextResponse.json({
      success: true,
      library: `${owner}/${repo}`,
      collected_at: metrics.collected_at,
      ef_metrics: ef,
      cb_metrics: cb,
      full_metrics: metrics,
    });

  } catch (error) {
    console.error('Raw metrics diagnostic error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch raw metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
