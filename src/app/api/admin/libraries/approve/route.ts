/**
 * API endpoint to approve a pending library
 * POST: Approve a library and add it to the ecosystem
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { approveLibrary } from '@/lib/ris/library-approval';
import { trackInstallation } from '@/lib/ris/webhook-queue';

export async function POST(request: NextRequest) {
  // TEMPORARY: Auth disabled for testing
  // TODO: Re-enable after testing
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.email) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const approvedBy = 'test-admin@react.foundation'; // Temporary for testing

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

    console.log(`✅ Library approved and installation tracked: ${owner}/${repo}`);

    return NextResponse.json({
      success: true,
      library: approvedLib,
      message: `${owner}/${repo} has been approved and added to the RIS system`,
    });
  } catch (error) {
    console.error('Error approving library:', error);
    return NextResponse.json(
      { error: 'Failed to approve library' },
      { status: 500 }
    );
  }
}
