/**
 * Admin User Management API
 * Manage users and roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';

/**
 * GET /api/admin/users - List all users
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await UserManagementService.getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Add or update user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "user"' },
        { status: 400 }
      );
    }

    await UserManagementService.addUser(email, role, session.user.email);

    return NextResponse.json({
      success: true,
      message: `User ${email} added with role: ${role}`,
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Failed to add user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users - Remove user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Prevent removing yourself
    if (email.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      );
    }

    await UserManagementService.removeUser(email);

    return NextResponse.json({
      success: true,
      message: `User ${email} removed`,
    });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    );
  }
}
