/**
 * API endpoint for updating library eligibility metadata
 * Admin-only endpoint for setting funding eligibility status
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import {
  getLibraryEligibility,
  updateLibraryEligibility,
} from '@/lib/admin/library-eligibility-service';
import type { EligibilityStatus, SponsorshipLevel } from '@/lib/ris/eligibility';

export async function POST(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { owner, repo, eligibility_status, sponsorship_level, eligibility_notes } = body;

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    // Use service to update eligibility
    const result = await updateLibraryEligibility(owner, repo, {
      eligibility_status: eligibility_status as EligibilityStatus | undefined,
      sponsorship_level: sponsorship_level as SponsorshipLevel | undefined,
      eligibility_notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update eligibility' },
        { status: 400 }
      );
    }

    // Fetch updated data
    const updated = await getLibraryEligibility(owner, repo);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to fetch updated data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      eligibility: updated.eligibility,
    });
  } catch (error) {
    console.error('Error updating eligibility metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update eligibility metadata' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    // Use service to get eligibility
    const eligibility = await getLibraryEligibility(owner, repo);
    if (!eligibility) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error('Error fetching eligibility metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligibility metadata' },
      { status: 500 }
    );
  }
}
