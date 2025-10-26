'use client';

/**
 * Library Approval Queue Component
 * Displays pending library installations awaiting admin approval
 */

import { useState, useEffect } from 'react';
import type { PendingLibrary, ApprovedLibrary, RejectedLibrary } from '@/lib/ris/library-approval';

interface ApprovalResponse {
  pending: PendingLibrary[];
  approved: ApprovedLibrary[];
  rejected: RejectedLibrary[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function LibraryApprovalQueue() {
  const [data, setData] = useState<ApprovalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [processingLibrary, setProcessingLibrary] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/libraries/pending');
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (error) {
      console.error('Error fetching library approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (owner: string, repo: string) => {
    const key = `${owner}/${repo}`;
    setProcessingLibrary(key);

    try {
      const response = await fetch('/api/admin/libraries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        alert(`✅ ${key} has been approved and added to the RIS system`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error approving library:', error);
      alert('Failed to approve library');
    } finally {
      setProcessingLibrary(null);
    }
  };

  const handleReject = async (owner: string, repo: string) => {
    const key = `${owner}/${repo}`;
    const reason = rejectReason[key];

    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessingLibrary(key);

    try {
      const response = await fetch('/api/admin/libraries/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, reason }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        setRejectReason({ ...rejectReason, [key]: '' }); // Clear reason
        alert(`❌ ${key} has been rejected`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting library:', error);
      alert('Failed to reject library');
    } finally {
      setProcessingLibrary(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load library approvals
      </div>
    );
  }

  const currentList =
    activeTab === 'pending' ? data.pending :
    activeTab === 'approved' ? data.approved :
    data.rejected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Library Approval Queue</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve libraries that have installed the GitHub App
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending
          {data.counts.pending > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
              {data.counts.pending}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'approved'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Approved ({data.counts.approved})
          {activeTab === 'approved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'rejected'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Rejected ({data.counts.rejected})
          {activeTab === 'rejected' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {/* Content */}
      {currentList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No {activeTab} libraries
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((lib) => {
            const key = `${lib.owner}/${lib.repo}`;
            const isProcessing = processingLibrary === key;

            return (
              <div
                key={key}
                className="border border-border rounded-lg p-6 bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        <a
                          href={lib.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {key}
                        </a>
                      </h3>
                      {lib.stars !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          ⭐ {lib.stars.toLocaleString()}
                        </span>
                      )}
                      {lib.language && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {lib.language}
                        </span>
                      )}
                    </div>

                    {lib.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {lib.description}
                      </p>
                    )}

                    {lib.topics && lib.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {lib.topics.map((topic) => (
                          <span
                            key={topic}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground">
                      {'installedAt' in lib && `Installed: ${new Date(lib.installedAt).toLocaleDateString()}`}
                      {'approvedAt' in lib && ` • Approved: ${new Date((lib as ApprovedLibrary).approvedAt).toLocaleDateString()} by ${(lib as ApprovedLibrary).approvedBy}`}
                      {'rejectedAt' in lib && ` • Rejected: ${new Date((lib as RejectedLibrary).rejectedAt).toLocaleDateString()} by ${(lib as RejectedLibrary).rejectedBy}`}
                    </div>

                    {'reason' in lib && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded">
                        <p className="text-sm text-destructive-foreground">
                          <strong>Rejection reason:</strong> {(lib as RejectedLibrary).reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {activeTab === 'pending' && (
                    <div className="ml-6 space-y-3 min-w-[200px]">
                      <button
                        onClick={() => handleApprove(lib.owner, lib.repo)}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isProcessing ? 'Processing...' : '✅ Approve'}
                      </button>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Rejection reason..."
                          value={rejectReason[key] || ''}
                          onChange={(e) =>
                            setRejectReason({ ...rejectReason, [key]: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleReject(lib.owner, lib.repo)}
                          disabled={isProcessing || !rejectReason[key]}
                          className="w-full px-4 py-2 rounded bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {isProcessing ? 'Processing...' : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
