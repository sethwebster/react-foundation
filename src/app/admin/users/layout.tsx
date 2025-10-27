/**
 * Admin User Management Layout
 * Provides tab navigation between Users and Requests
 * Auth is handled by parent /admin layout
 */

import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { TabNavigation } from './tab-navigation';

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is already handled by /admin layout, no need to duplicate checks

  // Get pending request count for tab badge
  const pendingRequests = await AccessRequestsService.getPendingRequests();
  const pendingCount = pendingRequests.length;

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12 mt-20">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">User Management</h1>
          <p className="mt-2 text-foreground/70">Manage users and access requests</p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation pendingCount={pendingCount} />

        {/* Tab Content */}
        {children}
      </div>
    </div>
  );
}
