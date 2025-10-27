/**
 * Admin Access Requests Tab - Server Component
 * Review and manage pending access requests
 */

import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { RequestsListClient } from './requests-list-client';
import { Suspense } from 'react';

async function RequestsContent() {
  const allRequests = await AccessRequestsService.getAllRequests();
  return <RequestsListClient requests={allRequests} />;
}

export default async function AdminRequestsPage() {
  return (
    <Suspense fallback={<RequestsLoadingFallback />}>
      <RequestsContent />
    </Suspense>
  );
}

function RequestsLoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
