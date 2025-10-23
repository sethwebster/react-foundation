/**
 * Admin Access Requests Page - Server Component
 * Review and manage pending access requests with Server Actions
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { RequestsListClient } from './requests-list-client';

export default async function AdminRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-red-400">Access Denied - Admin role required</p>
        </div>
      </div>
    );
  }

  // Fetch requests server-side
  const allRequests = await AccessRequestsService.getAllRequests();

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12 mt-20">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Access Requests</h1>
          <p className="mt-2 text-foreground/70">Review and manage early access requests</p>
        </div>

        {/* Client component handles interactivity */}
        <RequestsListClient requests={allRequests} />
      </div>
    </div>
  );
}
