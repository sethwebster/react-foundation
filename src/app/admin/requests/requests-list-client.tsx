/**
 * Requests List Client Component
 * Handles interactive UI for access request management
 */

'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  approveRequestAction,
  denyRequestAction,
  resendAdminNotificationAction,
} from '../actions';
import type { AccessRequest } from '@/lib/admin/access-requests-service';

export function RequestsListClient({
  requests: initialRequests,
}: {
  requests: AccessRequest[];
}) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pendingRequests = initialRequests.filter(r => r.status === 'pending');
  const processedRequests = initialRequests.filter(r => r.status !== 'pending');

  const handleApprove = (id: string, role: 'user' | 'admin' = 'user') => {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await approveRequestAction(id, role);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to approve');
      }
    });
  };

  const handleDeny = (id: string) => {
    if (!confirm('Deny this request?')) return;

    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await denyRequestAction(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deny');
      }
    });
  };

  const handleResendNotification = (id: string) => {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await resendAdminNotificationAction(id);
        setStatus('Admin notification email sent again.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resend admin email');
      }
    });
  };

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-red-300">
          {error}
        </div>
      )}
      {status && !error && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          {status}
        </div>
      )}

      {/* Pending Requests */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Pending Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 && (
          <p className="text-center text-foreground/60">No pending requests</p>
        )}

        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className={`rounded-xl border p-6 ${
                req.id === highlightId
                  ? 'border-primary bg-primary/10'
                  : 'border-border/10 bg-foreground/30'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{req.email}</p>
                  <p className="text-sm text-foreground/50">
                    Requested {new Date(req.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-border/10 bg-foreground/50 p-4">
                  <p className="text-sm text-foreground/80">{req.message}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(req.id, 'user')}
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-success px-4 py-2 font-semibold text-foreground transition hover:bg-success/50 disabled:opacity-50"
                  >
                    ✅ Approve as User
                  </button>
                  <button
                    onClick={() => handleApprove(req.id, 'admin')}
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-accent px-4 py-2 font-semibold text-foreground transition hover:bg-accent/50 disabled:opacity-50"
                  >
                    👑 Approve as Admin
                  </button>
                  <button
                    onClick={() => handleDeny(req.id)}
                    disabled={isPending}
                    className="rounded-lg bg-destructive/20 px-4 py-2 font-semibold text-red-300 transition hover:bg-destructive/30 disabled:opacity-50"
                  >
                    ❌ Deny
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleResendNotification(req.id)}
                    disabled={isPending}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border/30 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/20 disabled:opacity-50"
                  >
                    📧 Resend Admin Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processed Requests */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Processed Requests ({processedRequests.length})
        </h2>

        <div className="space-y-2">
          {processedRequests.slice(0, 20).map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-lg border border-border/10 bg-foreground/20 p-4"
            >
              <div>
                <p className="font-medium text-foreground">{req.email}</p>
                <p className="text-sm text-foreground/50">
                  {req.status === 'approved' ? '✅ Approved' : '❌ Denied'} on{' '}
                  {new Date(req.reviewedAt!).toLocaleDateString()}
                  {req.reviewedBy && ` by ${req.reviewedBy}`}
                </p>
              </div>
              <span
                className={`rounded px-3 py-1 text-sm font-semibold ${
                  req.status === 'approved'
                    ? 'bg-success/20 text-green-300'
                    : 'bg-destructive/20 text-red-300'
                }`}
              >
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
