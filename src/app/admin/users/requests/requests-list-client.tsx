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
  replyToRequestAction,
  resendAdminNotificationAction,
} from '../../actions';
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<
    Record<string, { message: string; bucket: string }>
  >({});

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
    if (!confirm('Are you sure you want to deny this request? This will send a denial email to the requester.')) {
      return;
    }

    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await denyRequestAction(id);
        setStatus('Request denied and denial email sent.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deny');
      }
    });
  };

  const getDraft = (id: string) => {
    const draft = replyDrafts[id];
    if (draft) return draft;
    return { message: '', bucket: '' };
  };

  const updateDraft = (id: string, updates: Partial<{ message: string; bucket: string }>) => {
    setReplyDrafts(prev => ({
      ...prev,
      [id]: {
        ...getDraft(id),
        ...updates,
      },
    }));
  };

  const handleReply = (id: string) => {
    setError(null);
    setStatus(null);
    setReplyingTo(prev => (prev === id ? null : id));
  };

  const handleReplySubmit = (id: string) => {
    const draft = getDraft(id);
    if (!draft.message.trim()) {
      setError('Reply message is required');
      return;
    }

    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await replyToRequestAction(id, draft.message, draft.bucket);
        setStatus('Reply sent and requester bucketed.');
        setReplyingTo(null);
        setReplyDrafts(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reply');
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
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive-foreground">
          {error}
        </div>
      )}
      {status && !error && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-success-foreground">
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
                  : 'border-border bg-card'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{req.email}</p>
                  <p className="text-sm text-foreground/50">
                    Requested {new Date(req.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">{req.message}</p>
                </div>

                <div className="flex flex-col gap-3">
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
                      className="flex-1 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground transition hover:bg-accent/80 disabled:opacity-50"
                    >
                      👑 Approve as Admin
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReply(req.id)}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-muted px-4 py-2 font-semibold text-foreground transition hover:bg-muted/70 disabled:opacity-50"
                    >
                      ✉️ Reply &amp; Bucket
                    </button>
                    <button
                      onClick={() => handleDeny(req.id)}
                      disabled={isPending}
                      className="flex-1 rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition hover:bg-destructive/80 disabled:opacity-50"
                    >
                      ❌ Deny Request
                    </button>
                  </div>
                </div>
                {replyingTo === req.id && (
                  <div className="rounded-xl border border-border bg-card/70 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-foreground">
                          Reply Message
                        </label>
                        <textarea
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                          rows={4}
                          placeholder="Let them know what to expect next..."
                          value={getDraft(req.id).message}
                          onChange={(event) =>
                            updateDraft(req.id, { message: event.target.value })
                          }
                          disabled={isPending}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground">
                          Bucket
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                          placeholder="e.g. Wave 2"
                          value={getDraft(req.id).bucket}
                          onChange={(event) =>
                            updateDraft(req.id, { bucket: event.target.value })
                          }
                          disabled={isPending}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReplySubmit(req.id)}
                          disabled={isPending}
                          className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:opacity-50"
                        >
                          Send Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          disabled={isPending}
                          className="rounded-lg border border-border px-4 py-2 font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleResendNotification(req.id)}
                    disabled={isPending}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
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
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="font-medium text-foreground">{req.email}</p>
                <p className="text-sm text-foreground/50">
                  {req.status === 'approved'
                    ? '✅ Approved'
                    : req.status === 'bucketed'
                      ? `🪣 Bucketed${req.bucket ? ` (${req.bucket})` : ''}`
                      : '❌ Denied'}{' '}
                  on{' '}
                  {new Date(req.reviewedAt!).toLocaleDateString()}
                  {req.reviewedBy && ` by ${req.reviewedBy}`}
                </p>
                {req.status === 'bucketed' && req.replyMessage && (
                  <p className="text-sm text-foreground/60">
                    Reply sent: {req.replyMessage}
                  </p>
                )}
              </div>
              <span
                className={`rounded px-3 py-1 text-sm font-semibold ${
                  req.status === 'approved'
                    ? 'bg-success/20 text-success-foreground'
                    : req.status === 'bucketed'
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'bg-destructive/20 text-destructive-foreground'
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
