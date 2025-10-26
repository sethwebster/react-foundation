/**
 * RIS Collection Button - Client Component
 */

'use client';

import { useState, useTransition } from 'react';
import { startRISCollectionAction } from './actions';

export function RISCollectionButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartCollection = (forceRefresh = false) => {
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await startRISCollectionAction(forceRefresh);

        if (response.success) {
          setResult(
            `✅ Collection ${response.mode}: ${response.collected} full, ${response.cached} cached, ${response.failed} failed / ${response.total} total`
          );
        } else {
          setError(response.error || 'Collection failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleStartCollection(false)}
          disabled={isPending}
          className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? '🔄 Running...' : '▶️ Start Collection (Incremental)'}
        </button>
        <button
          onClick={() => handleStartCollection(true)}
          disabled={isPending}
          className="flex-1 rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? '🔄 Running...' : '🔥 Force Full Refresh'}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-success/50 bg-success/10 p-3 text-sm text-success-foreground">
          {result}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          ❌ {error}
        </div>
      )}

      {isPending && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          ⏳ Collection in progress... This may take up to 5 minutes. You can refresh the page to see updated status.
        </div>
      )}
    </div>
  );
}
