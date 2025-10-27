/**
 * API endpoint to approve a pending library
 * POST: Approve a library and add it to the ecosystem
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { approveLibrary } from '@/lib/ris/library-approval';
import { trackInstallation } from '@/lib/ris/webhook-queue';
import { collectBaselineForLibrary } from '@/lib/ris/baseline-collection';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const approvedBy = session.user.email;

  try {
    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing owner or repo' },
        { status: 400 }
      );
    }

    // Approve the library
    const approvedLib = await approveLibrary(owner, repo, approvedBy);

    if (!approvedLib) {
      return NextResponse.json(
        { error: 'Library not found in pending queue' },
        { status: 404 }
      );
    }

    // Track installation (now that it's approved)
    await trackInstallation(owner, repo, approvedLib.installationId);

    logger.info(`✅ Library approved and installation tracked: ${owner}/${repo}`);

    // Trigger baseline collection asynchronously (don't wait)
    // This runs in the background and won't block the response
    collectBaselineForLibrary(owner, repo, repo, { resume: true })
      .then((result) => {
        if (result.success && !result.isPartial) {
          logger.info(`✅ Baseline collection completed for ${owner}/${repo}`);
        } else if (result.isPartial) {
          logger.warn(`⚠️  Baseline collection partial for ${owner}/${repo} - will retry failed sources`);
        } else {
          logger.error(`❌ Baseline collection failed for ${owner}/${repo} - will retry: ${result.error}`);
        }
      })
      .catch((error) => {
        logger.error(`❌ Baseline collection crashed for ${owner}/${repo}:`, error);
      });

    return NextResponse.json({
      success: true,
      library: approvedLib,
      message: `${owner}/${repo} has been approved and added to the RIS system. Data collection started in background.`,
    });
  } catch (error) {
    logger.error('Error approving library:', error);
    return NextResponse.json(
      { error: 'Failed to approve library' },
      { status: 500 }
    );
  }
}
