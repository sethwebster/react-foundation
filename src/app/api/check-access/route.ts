/**
 * Check Access API Route
 * Server-side allowlist check (doesn't expose emails to client)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({
        isAllowed: false,
        isAdmin: false,
        reason: 'not-authenticated',
      });
    }

    // Check access in Redis
    const hasAccess = await UserManagementService.hasAccess(session.user.email);
    const isAdmin = await UserManagementService.isAdmin(session.user.email);

    return NextResponse.json({
      isAllowed: hasAccess,
      isAdmin,
      reason: hasAccess ? 'allowed' : 'not-on-allowlist',
    });
  } catch (error) {
    console.error('Access check error:', error);

    return NextResponse.json(
      {
        isAllowed: false,
        isAdmin: false,
        reason: 'error',
      },
      { status: 500 }
    );
  }
}
