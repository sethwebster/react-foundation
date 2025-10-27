/**
 * Admin Users Tab - Server Component
 * Displays and manages user access and roles
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { UsersListClient } from './users-list-client';
import { Suspense } from 'react';

async function UsersContent() {
  const session = await getServerSession(authOptions);
  const users = await UserManagementService.getAllUsers();

  return (
    <UsersListClient
      users={users}
      currentUserEmail={session?.user?.email ?? ''}
    />
  );
}

export default async function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersLoadingFallback />}>
      <UsersContent />
    </Suspense>
  );
}

function UsersLoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
