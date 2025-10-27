/**
 * Library Detail Modal
 * Shows library details and allows triggering data collection
 */

'use client';

import { useState, useEffect } from 'react';
import { LibraryEligibilityEditor } from './LibraryEligibilityEditor';

interface Library {
  owner: string;
  repo: string;
  name: string;
  github: string;
}

interface LibraryDetailModalProps {
  library: Library;
  isOpen: boolean;
  onClose: () => void;
}

interface CollectionState {
  is_complete?: boolean;
  is_partial?: boolean;
  started_at?: string;
  last_attempt_at?: string;
  next_retry_at?: string;
  github_basic?: { status: string; collected_at?: string; error?: string };
  github_prs?: { status: string; items_collected?: number; error?: string };
  github_issues?: { status: string; items_collected?: number; error?: string };
  github_commits?: { status: string; items_collected?: number; error?: string };
  github_releases?: { status: string; items_collected?: number; error?: string };
  npm_metrics?: { status: string; error?: string };
  cdn_metrics?: { status: string; error?: string };
  ossf_metrics?: { status: string; error?: string };
}

export function LibraryDetailModal({ library, isOpen, onClose }: LibraryDetailModalProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionState, setCollectionState] = useState<CollectionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Fetch collection state when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCollectionState();
    }
  }, [isOpen, library.owner, library.repo]);

  const fetchCollectionState = async () => {
    setIsLoadingState(true);
    try {
      const response = await fetch(
        `/api/admin/ris/status?type=library&owner=${library.owner}&repo=${library.repo}`
      );
      if (response.ok) {
        const data = await response.json();
        setCollectionState(data.state);
      }
    } catch (err) {
      console.error('Failed to fetch collection state:', err);
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleKickOffCollection = async () => {
    setIsCollecting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/ris/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: library.owner,
          repo: library.repo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Collection failed');
      }

      // Refresh state after triggering collection
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchCollectionState();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start collection');
    } finally {
      setIsCollecting(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const sources = [
    { key: 'github_basic', label: 'GitHub Basic', icon: '⭐' },
    { key: 'github_prs', label: 'Pull Requests', icon: '🔀' },
    { key: 'github_issues', label: 'Issues', icon: '🐛' },
    { key: 'github_commits', label: 'Commits', icon: '📝' },
    { key: 'github_releases', label: 'Releases', icon: '🚀' },
    { key: 'npm_metrics', label: 'NPM Metrics', icon: '📦' },
    { key: 'cdn_metrics', label: 'CDN Metrics', icon: '🌐' },
    { key: 'ossf_metrics', label: 'OSSF Score', icon: '🔒' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{library.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {library.owner}/{library.repo}
            </p>
            <a
              href={library.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View on GitHub →
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition p-2 hover:bg-muted rounded-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Collection Controls */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Data Collection</h3>
              {collectionState && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  collectionState.is_complete
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : collectionState.is_partial
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {collectionState.is_complete ? 'Complete' : collectionState.is_partial ? 'Partial' : 'Not Started'}
                </span>
              )}
            </div>

            <button
              onClick={handleKickOffCollection}
              disabled={isCollecting}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {isCollecting ? '🔄 Collecting Data...' : '▶️ Kick Off Data Collection'}
            </button>

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {collectionState?.next_retry_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Next retry scheduled: {new Date(collectionState.next_retry_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Collection Status */}
          {isLoadingState ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading collection status...</p>
            </div>
          ) : collectionState ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Collection Status</h3>

              {/* Source Status Grid */}
              <div className="grid gap-3 md:grid-cols-2">
                {sources.map(({ key, label, icon }) => {
                  const source = collectionState[key as keyof CollectionState] as { status?: string; items_collected?: number; collected_at?: string; error?: string } | undefined;
                  const status = source?.status || 'pending';

                  return (
                    <div
                      key={key}
                      className="p-3 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span className="text-sm font-medium text-foreground">{label}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>

                      {source?.items_collected !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {source.items_collected} items collected
                        </p>
                      )}

                      {source?.collected_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(source.collected_at).toLocaleString()}
                        </p>
                      )}

                      {source?.error && (
                        <p className="text-xs text-destructive mt-1">
                          Error: {source.error}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Timing Info */}
              {collectionState.started_at && (
                <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-1">
                  <p>Started: {new Date(collectionState.started_at).toLocaleString()}</p>
                  {collectionState.last_attempt_at && (
                    <p>Last Attempt: {new Date(collectionState.last_attempt_at).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No collection data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Kick Off Data Collection" to start collecting data for this library
              </p>
            </div>
          )}

          {/* Eligibility Management */}
          <div className="border-t border-border pt-6">
            <LibraryEligibilityEditor
              owner={library.owner}
              repo={library.repo}
              libraryName={library.name}
              onUpdate={fetchCollectionState}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
