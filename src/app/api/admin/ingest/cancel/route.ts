/**
 * Cancel/Clear Stuck Ingestion API
 * Forces clearing of Redis-based ingestion lock
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { getRedisClient } from '@/lib/redis';
import { IngestionLockService } from '@/lib/chatbot/ingestion-lock';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const redis = getRedisClient();
    const lockService = new IngestionLockService(redis);

    // Get current lock status
    const status = await lockService.getStatus();

    if (!status.locked) {
      return NextResponse.json({
        message: 'No ingestion lock currently held',
        cleared: false,
      });
    }

    // Force clear the lock
    const cleared = await lockService.forceClear();

    logger.warn(
      `Admin ${session.user.email} force-cleared ingestion lock: ${status.lock?.ingestionId}`,
      {
        ageMs: status.ageMs,
        stale: status.stale,
      }
    );

    return NextResponse.json({
      message: 'Ingestion lock cleared successfully',
      cleared: true,
      previousLock: {
        ingestionId: status.lock?.ingestionId,
        startedAt: new Date(status.lock!.startedAt).toISOString(),
        ageMs: status.ageMs,
        wasStale: status.stale,
      },
    });
  } catch (error) {
    logger.error('Error clearing ingestion lock:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to clear ingestion lock',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const redis = getRedisClient();
    const lockService = new IngestionLockService(redis);

    const status = await lockService.getStatus();

    return NextResponse.json(status);
  } catch (error) {
    logger.error('Error getting ingestion lock status:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get ingestion lock status',
      },
      { status: 500 }
    );
  }
}
