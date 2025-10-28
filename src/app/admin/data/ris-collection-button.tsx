/**
 * RIS Collection Button - Client Component
 */

'use client';

import { useState, useEffect } from 'react';

interface CollectionStatus {
  status: string;
  message: string;
  progress?: number;
  total?: number;
  startedAt?: string;
  completedAt?: string;
  rateLimitResetAt?: string;
}

export function RISCollectionButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<CollectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for status updates while collection is running
  useEffect(() => {
    if (!isRunning) return;

    const pollStatus = async () => {
      try {
        const response = await fetch('/api/ris/status');
        const data = await response.json();
        console.log('Status poll:', data);

        if (data.status) {
          setStatus(data.status);

          // Stop polling if completed or failed
          if (data.status.status === 'completed' || data.status.status === 'failed') {
            setIsRunning(false);

            // Refresh the page to show updated data
            if (data.status.status === 'completed') {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          }

          // For rate_limited, keep polling to check if we can auto-resume
          if (data.status.status === 'rate_limited') {
            setIsRunning(false); // Stop the "running" indicator
            // Don't stop polling - we'll check for auto-resume below
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    // Poll immediately
    pollStatus();

    return () => clearInterval(interval);
  }, [isRunning]);

  // Separate effect for auto-resuming after rate limit
  useEffect(() => {
    if (!status || status.status !== 'rate_limited' || !status.rateLimitResetAt) return;

    const checkAndResume = async () => {
      const resetTime = new Date(status.rateLimitResetAt!).getTime();
      const now = Date.now();

      // If reset time has passed, automatically restart collection
      if (now >= resetTime) {
        console.log('Rate limit has expired, auto-resuming collection...');
        setStatus(null);
        setError(null);
        await handleStartCollection(false);
      }
    };

    // Check every 30 seconds if we can resume
    const interval = setInterval(checkAndResume, 30000);

    // Check immediately in case reset time already passed
    checkAndResume();

    return () => clearInterval(interval);
  }, [status]);

  const handleStartCollection = async (forceRefresh = false) => {
    setError(null);
    setStatus(null);
    setIsRunning(true);

    try {
      const url = `/api/ris/collect${forceRefresh ? '?force=true' : ''}`;
      console.log('Starting collection:', url);

      const response = await fetch(url, { method: 'POST' });
      console.log('Collection response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('Collection failed:', data);
        throw new Error(data.error || 'Failed to start collection');
      }

      const data = await response.json();
      console.log('Collection started:', data);

      // Collection started successfully - polling will handle updates
    } catch (err) {
      console.error('Collection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRunning(false);
    }
  };

  const handleReleaseLock = async () => {
    if (!confirm('Release the collection lock? Only do this if a collection is truly stuck.')) {
      return;
    }

    try {
      const response = await fetch('/api/ris/release-lock', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to release lock');
      }
      setError(null);
      setStatus(null);
      setIsRunning(false);
      alert('Lock released. You can now start a new collection.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release lock');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleStartCollection(false)}
          disabled={isRunning}
          className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          title="Prioritizes new libraries first, then updates existing data"
        >
          {isRunning ? '🔄 Running...' : '▶️ Start Collection (Smart)'}
        </button>
        <button
          onClick={() => handleStartCollection(true)}
          disabled={isRunning}
          className="flex-1 rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
        >
          {isRunning ? '🔄 Running...' : '🔥 Force Full Refresh'}
        </button>
      </div>

      {status && (
        <div className={`rounded-lg border p-3 text-sm ${
          status.status === 'completed'
            ? 'border-success/50 bg-success/10 text-success-foreground'
            : status.status === 'failed'
            ? 'border-destructive/50 bg-destructive/10 text-destructive-foreground'
            : status.status === 'rate_limited'
            ? 'border-warning/50 bg-warning/10 text-warning-foreground'
            : 'border-primary/50 bg-primary/10 text-primary-foreground'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              {status.status === 'completed' ? '✅ Completed' :
               status.status === 'failed' ? '❌ Failed' :
               status.status === 'rate_limited' ? '⏸️  Rate Limited' :
               '⏳ Running'}
            </span>
            {status.progress !== undefined && status.total !== undefined && (
              <span className="text-xs">
                {status.progress}/{status.total} libraries
              </span>
            )}
          </div>
          <p className="text-xs mb-2">{status.message}</p>
          {status.progress !== undefined && status.total !== undefined && (
            <div className="w-full bg-muted-foreground/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(status.progress / status.total) * 100}%` }}
              />
            </div>
          )}
          {status.status === 'completed' && (
            <p className="text-xs mt-2 opacity-70">Page will refresh in 2 seconds...</p>
          )}
          {status.status === 'rate_limited' && status.rateLimitResetAt && (
            <div className="mt-2 pt-2 border-t border-warning/30">
              <p className="text-xs font-semibold">⏰ Automatic resumption at:</p>
              <p className="text-sm font-mono mt-1">
                {new Date(status.rateLimitResetAt).toLocaleTimeString()}
              </p>
              <p className="text-xs mt-1 opacity-70">
                Collection will automatically restart at this time. You can also manually click "Start Collection" after the reset time.
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            {error.includes('already in progress') && (
              <button
                onClick={handleReleaseLock}
                className="ml-2 text-xs underline hover:no-underline"
              >
                Release Lock
              </button>
            )}
          </div>
        </div>
      )}

      {isRunning && !status && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          ⏳ Starting collection... Prioritizing libraries with no data first, then updating existing libraries. This may take 10-30 minutes for all 54 libraries.
        </div>
      )}
    </div>
  );
}
