/**
 * Requests List Client Component
 * Handles interactive UI for access request management
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { RequestsTable } from '@/components/admin/RequestsTable';
import type { AccessRequest } from '@/lib/admin/access-requests-service';

export function RequestsListClient({
  requests: initialRequests,
}: {
  requests: AccessRequest[];
}) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const pendingRequests = initialRequests.filter(r => r.status === 'pending');
  const processedRequests = initialRequests.filter(r => r.status !== 'pending');

  return (
    <>
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Pending Requests ({pendingRequests.length})
          </h2>
          <RequestsTable requests={pendingRequests} highlightId={highlightId} />
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Processed Requests ({processedRequests.length})
          </h2>
          <RequestsTable requests={processedRequests} highlightId={highlightId} />
        </div>
      )}

      {initialRequests.length === 0 && (
        <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
          <p className="text-center text-foreground/60">No requests</p>
        </div>
      )}
    </>
  );
}
