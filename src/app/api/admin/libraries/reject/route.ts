/**
 * API endpoint to reject a pending library
 * POST: Reject a library with a reason
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rejectLibrary } from '@/lib/ris/library-approval';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Check if user is admin
  const rejectedBy = session.user.email;

  try {
    const { owner, repo, reason } = await request.json();

    if (!owner || !repo || !reason) {
      return NextResponse.json(
        { error: 'Missing owner, repo, or reason' },
        { status: 400 }
      );
    }

    // Reject the library
    const rejectedLib = await rejectLibrary(owner, repo, rejectedBy, reason);

    if (!rejectedLib) {
      return NextResponse.json(
        { error: 'Library not found in pending queue' },
        { status: 404 }
      );
    }

    console.log(`❌ Library rejected: ${owner}/${repo} - ${reason}`);

    return NextResponse.json({
      success: true,
      library: rejectedLib,
      message: `${owner}/${repo} has been rejected`,
    });
  } catch (error) {
    console.error('Error rejecting library:', error);
    return NextResponse.json(
      { error: 'Failed to reject library' },
      { status: 500 }
    );
  }
}
