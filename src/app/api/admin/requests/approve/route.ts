/**
 * Approve Access Request API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { UserManagementService } from '@/lib/admin/user-management-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, role = 'user' } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
    }

    await AccessRequestsService.approveRequest(id, session.user.email, role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
