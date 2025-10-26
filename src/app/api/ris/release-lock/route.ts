/**
 * RIS Release Lock API Route
 * Releases stuck collection locks (admin only)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { releaseCollectionLock } from '@/lib/redis';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Check authentication - require admin role
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      logger.warn('Lock release attempted without authentication');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      logger.warn(`Lock release attempted by non-admin: ${session.user.email}`);
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    // Release the lock
    await releaseCollectionLock();
    logger.info(`Collection lock released by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Lock released successfully',
    });
  } catch (error) {
    logger.error('Error releasing lock:', error);

    return NextResponse.json(
      {
        error: 'Failed to release lock',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
