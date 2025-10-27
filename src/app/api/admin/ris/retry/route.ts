/**
 * API endpoint to trigger manual retry of failed collections
 * POST: Process retries for failed collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processRetries } from '@/lib/ris/collection-scheduler';
import { resetCollectionState } from '@/lib/ris/collection-state';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { owner, repo, maxRetries = 10 } = body;

    // If owner/repo provided, reset and retry specific library
    if (owner && repo) {
      logger.info(`🔄 Manual retry requested for ${owner}/${repo} by ${session.user.email}`);

      // Reset the collection state to allow immediate retry
      await resetCollectionState(owner, repo);

      // Import and trigger collection
      const { collectBaselineForLibrary } = await import('@/lib/ris/baseline-collection');
      const result = await collectBaselineForLibrary(owner, repo, repo, { resume: true });

      return NextResponse.json({
        success: true,
        library: `${owner}/${repo}`,
        result: {
          completed: result.success && !result.isPartial,
          partial: result.isPartial,
          failed: !result.success,
          failedSources: result.failedSources,
        },
        message: result.success
          ? result.isPartial
            ? `Collection partially succeeded for ${owner}/${repo}`
            : `Collection completed for ${owner}/${repo}`
          : `Collection failed for ${owner}/${repo}`,
      });
    }

    // Otherwise, process all pending retries
    logger.info(`🔄 Processing pending retries (max: ${maxRetries}) requested by ${session.user.email}`);

    const stats = await processRetries(maxRetries);

    return NextResponse.json({
      success: true,
      stats,
      message: `Processed ${stats.attempted} retries: ${stats.succeeded} succeeded, ${stats.partial} partial, ${stats.failed} failed`,
    });

  } catch (error) {
    logger.error('Error processing retries:', error);
    return NextResponse.json(
      { error: 'Failed to process retries', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
