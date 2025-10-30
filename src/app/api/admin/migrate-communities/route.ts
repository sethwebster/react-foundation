/**
 * Admin API: Migrate Communities
 * POST /api/admin/migrate-communities
 * Migrates communities from old single-key format to new individual-key format
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { migrateFromOldFormat } from '@/lib/redis-communities';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔄 Manual migration triggered by admin...');
    const communities = await migrateFromOldFormat();

    if (!communities) {
      return NextResponse.json({
        success: false,
        error: 'No old format data found or migration failed',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${communities.length} communities to new format`,
      count: communities.length,
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    );
  }
}
