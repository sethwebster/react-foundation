/**
 * Requests Table Component - Client Component
 * Displays access requests in a table format with actions
 * Uses RFDS Table component for consistent styling
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RFDS, type TableColumn } from '@/components/rfds';
import type { AccessRequest } from '@/lib/admin/access-requests-service';
import {
  approveRequestAction,
  denyRequestAction,
  replyToRequestAction,
  resendAdminNotificationAction,
} from '@/app/admin/actions';
import { MessageSquare, CheckCircle, XCircle, Mail, Crown, User as UserIcon, Clock, Archive } from 'lucide-react';

export interface RequestsTableProps {
  requests: AccessRequest[];
  highlightId?: string | null;
}

export function RequestsTable({ requests, highlightId }: RequestsTableProps) {
  const router = useRouter();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<
    Record<string, { message: string; bucket: string }>
  >({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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

  const handleApprove = (id: string, role: 'user' | 'admin' = 'user') => {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await approveRequestAction(id, role);
        router.refresh();
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
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deny');
      }
    });
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
        router.refresh();
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

  const columns: TableColumn<AccessRequest>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_value: unknown, req: AccessRequest) => (
        <div>
          <div className="font-semibold text-foreground">{req.email}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(req.requestedAt).toLocaleDateString()}
          </div>
        </div>
      ),
      accessor: (req: AccessRequest) => req.email.toLowerCase(),
    },
    {
      key: 'message',
      label: 'Message',
      sortable: true,
      render: (_value: unknown, req: AccessRequest) => (
        <div className="max-w-md">
          <p className="text-sm text-foreground line-clamp-2">{req.message}</p>
        </div>
      ),
      accessor: (req: AccessRequest) => req.message.toLowerCase(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value: unknown, req: AccessRequest) => {
        const statusConfig = {
          pending: { 
            variant: 'warning' as const, 
            label: 'Pending', 
            Icon: Clock,
          },
          approved: { 
            variant: 'success' as const, 
            label: 'Approved', 
            Icon: CheckCircle,
          },
          denied: { 
            variant: 'destructive' as const, 
            label: 'Denied', 
            Icon: XCircle,
          },
          bucketed: { 
            variant: 'default' as const, 
            label: 'Bucketed', 
            Icon: Archive,
          },
        };
        const config = statusConfig[req.status] || statusConfig.pending;
        const { Icon } = config;
        return (
          <RFDS.SemanticBadge variant={config.variant} className="inline-flex items-center gap-1.5">
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </RFDS.SemanticBadge>
        );
      },
      accessor: (req: AccessRequest) => req.status,
    },
    {
      key: 'reviewed',
      label: 'Reviewed',
      sortable: true,
      render: (_value: unknown, req: AccessRequest) => {
        if (req.status === 'pending') {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        return (
          <div className="text-sm">
            <div className="text-foreground">
              {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '—'}
            </div>
            {req.reviewedBy && (
              <div className="text-muted-foreground text-xs">by {req.reviewedBy}</div>
            )}
          </div>
        );
      },
      accessor: (req: AccessRequest) => {
        if (!req.reviewedAt) return 0;
        return new Date(req.reviewedAt).getTime();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_value: unknown, req: AccessRequest) => {
        const isReplying = replyingTo === req.id;
        const isPendingRequest = req.status === 'pending';

        if (isReplying) {
          return (
            <div className="space-y-2 min-w-[300px]">
              <RFDS.Textarea
                className="w-full text-sm"
                rows={3}
                placeholder="Let them know what to expect next..."
                value={getDraft(req.id).message}
                onChange={(event) =>
                  updateDraft(req.id, { message: event.target.value })
                }
                disabled={isPending}
              />
              <RFDS.Input
                type="text"
                className="w-full text-sm"
                placeholder="e.g. Wave 2"
                value={getDraft(req.id).bucket}
                onChange={(event) =>
                  updateDraft(req.id, { bucket: event.target.value })
                }
                disabled={isPending}
              />
              <div className="flex gap-2">
                <RFDS.SemanticButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleReplySubmit(req.id)}
                  disabled={isPending}
                >
                  Send Reply
                </RFDS.SemanticButton>
                <RFDS.SemanticButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  disabled={isPending}
                >
                  Cancel
                </RFDS.SemanticButton>
              </div>
              {error && replyingTo === req.id && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          );
        }

        if (!isPendingRequest) {
          return (
            <div className="flex items-center gap-1 justify-end">
              {req.bucket && (
                <RFDS.SemanticBadge variant="outline" className="text-xs">
                  {req.bucket}
                </RFDS.SemanticBadge>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-2 items-end min-w-[200px]">
            <div className="flex gap-1">
              <RFDS.SemanticButton
                variant="success"
                size="sm"
                onClick={() => handleApprove(req.id, 'user')}
                disabled={isPending}
                className="h-8"
                title="Approve as User"
              >
                <UserIcon className="h-3 w-3" />
              </RFDS.SemanticButton>
              <RFDS.SemanticButton
                variant="secondary"
                size="sm"
                onClick={() => handleApprove(req.id, 'admin')}
                disabled={isPending}
                className="h-8"
                title="Approve as Admin"
              >
                <Crown className="h-3 w-3" />
              </RFDS.SemanticButton>
              <RFDS.SemanticButton
                variant="ghost"
                size="sm"
                onClick={() => handleReply(req.id)}
                disabled={isPending}
                className="h-8"
                title="Reply & Bucket"
              >
                <MessageSquare className="h-3 w-3" />
              </RFDS.SemanticButton>
              <RFDS.SemanticButton
                variant="destructive"
                size="sm"
                onClick={() => handleDeny(req.id)}
                disabled={isPending}
                className="h-8"
                title="Deny Request"
              >
                <XCircle className="h-3 w-3" />
              </RFDS.SemanticButton>
            </div>
            <RFDS.SemanticButton
              variant="ghost"
              size="sm"
              onClick={() => handleResendNotification(req.id)}
              disabled={isPending}
              className="h-7 text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Resend Email
            </RFDS.SemanticButton>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {error}
        </div>
      )}
      {status && !error && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success-foreground">
          {status}
        </div>
      )}
      <RFDS.Table
        data={requests}
        columns={columns}
        searchable
        searchPlaceholder="Search requests by email or message..."
        defaultSortKey="requestedAt"
        defaultSortDirection="desc"
        getRowKey={(req) => req.id}
      />
    </>
  );
}

