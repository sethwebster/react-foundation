/**
 * API endpoint for pending library approvals
 * GET: List all pending libraries
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPendingLibraries, getApprovedLibraries, getRejectedLibraries } from '@/lib/ris/library-approval';

export async function GET() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Check if user is admin
  // For now, allow any authenticated user

  try {
    const [pending, approved, rejected] = await Promise.all([
      getPendingLibraries(),
      getApprovedLibraries(),
      getRejectedLibraries(),
    ]);

    // Sort by date (newest first)
    pending.sort((a, b) => new Date(b.installedAt).getTime() - new Date(a.installedAt).getTime());
    approved.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
    rejected.sort((a, b) => new Date(b.rejectedAt).getTime() - new Date(a.rejectedAt).getTime());

    return NextResponse.json({
      pending,
      approved,
      rejected,
      counts: {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
      },
    });
  } catch (error) {
    console.error('Error fetching library approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library approvals' },
      { status: 500 }
    );
  }
}
