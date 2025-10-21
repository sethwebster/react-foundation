/**
 * Admin User Management Page - Server Component
 * Manages user access and roles with Server Actions
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { UsersListClient } from './users-list-client';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">Access Denied - Admin role required</p>
        </div>
      </div>
    );
  }

  // Fetch users server-side
  const users = await UserManagementService.getAllUsers();

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12 mt-20">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">User Management</h1>
          <p className="mt-2 text-white/70">Manage user access and roles</p>
        </div>

        {/* Client component handles interactivity */}
        <UsersListClient users={users} currentUserEmail={session.user.email} />
      </div>
    </div>
  );
}
