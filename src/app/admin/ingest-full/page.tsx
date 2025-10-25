/**
 * Full Ingestion Admin Page
 * Trigger complete content ingestion using loader architecture
 */

'use client';

import { useState, useEffect } from 'react';

interface IngestionResult {
  success: boolean;
  duration_ms: number;
  loaders: Array<{
    loader: string;
    records: number;
    duration_ms: number;
    error?: string;
  }>;
  ingestion: {
    records_processed: number;
    items_created: number;
    chunks_created: number;
    embeddings_generated: number;
    errors: number;
  };
  content_map: {
    sections: number;
  };
  error?: string;
}

interface IngestionProgress {
  status: 'running' | 'completed' | 'failed';
  logs: string[];
  result?: IngestionResult;
  error?: string;
}

interface IndexStats {
  index_name: string;
  num_docs: number;
  num_records: number;
  indexing: number;
}

export default function IngestFullPage() {
  const [ingesting, setIngesting] = useState(false);
  const [ingestionId, setIngestionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<IngestionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [indexStats, setIndexStats] = useState<IndexStats | null>(null);

  // Load current index stats on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/ingest/full/stats');
        if (response.ok) {
          const data = await response.json();
          setIndexStats(data);
        }
      } catch (err) {
        // Ignore errors - stats are optional
      }
    }
    loadStats();
  }, []);

  // Load latest ingestion from Redis on mount (shared across all admins)
  useEffect(() => {
    async function loadLatest() {
      try {
        // Get latest ingestion ID
        const latestResponse = await fetch('/api/ingest/full/latest');
        const latestData = await latestResponse.json();

        if (latestData.ingestionId) {
          // Load that ingestion's progress
          const progressResponse = await fetch(`/api/ingest/full?ingestionId=${latestData.ingestionId}`);
          const progressData = await progressResponse.json();

          if (progressData.status) {
            setProgress(progressData);
            setIngestionId(latestData.ingestionId);
            // If still running, start polling
            if (progressData.status === 'running') {
              setIngesting(true);
            }
          }
        }
      } catch (err) {
        // No previous ingestion or error loading - that's ok
      }
    }
    loadLatest();
  }, []);

  // Poll for progress updates
  useEffect(() => {
    if (!ingestionId || !ingesting) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ingest/full?ingestionId=${ingestionId}`);
        const data = await response.json();

        if (response.ok) {
          setProgress(data);

          // Stop polling if completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            setIngesting(false);
          }
        } else {
          setError(data.error || 'Failed to get ingestion status');
          setIngesting(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIngesting(false);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [ingestionId, ingesting]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && progress?.logs.length) {
      const logsContainer = document.getElementById('ingest-full-logs');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }
  }, [progress?.logs, autoScroll]);

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setProgress(null);
    setIngestionId(null);

    try {
      const response = await fetch('/api/ingest/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setIngestionId(data.ingestionId);
        // Latest ID is stored in Redis by the API
      } else {
        setError(data.error || 'Failed to start ingestion');
        setIngesting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIngesting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
            🚀
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Full Content Ingestion (Loader Architecture)
            </h1>
            <p className="text-muted-foreground">
              Ingest content from all sources using the new push-based loader architecture.
              This runs all loaders (MDX, Communities, Libraries) and generates embeddings.
            </p>
          </div>
        </div>
      </div>

      {/* Current Index Stats */}
      {indexStats && indexStats.num_docs > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Current Index Statistics</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Index: <code className="bg-muted px-1.5 py-0.5 rounded">{indexStats.index_name}</code>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">{indexStats.num_docs.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Chunks Indexed</div>
            </div>
            <div className="text-center bg-muted rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">
                {indexStats.indexing === 0 ? '✅ Ready' : '⏳ Indexing'}
              </div>
              <div className="text-xs text-muted-foreground">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-2">
          ℹ️ Blue-Green Deployment (Zero Downtime)
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><strong>Creates new index</strong> with unique timestamp</li>
          <li><strong>MDX Loader:</strong> 12 docs from public-context/</li>
          <li><strong>Communities Loader:</strong> ~65 React communities from Redis</li>
          <li><strong>Libraries Loader:</strong> 54 tracked React ecosystem libraries</li>
          <li><strong>Atomic swap</strong> when complete (instant switchover)</li>
          <li><strong>Deletes old index</strong> after successful swap</li>
          <li><strong>Total:</strong> ~400-500 chunks of comprehensive knowledge</li>
          <li><strong>No crawling:</strong> All content loaded from structured sources</li>
          <li><strong>Fast:</strong> Completes in 30-90 seconds</li>
        </ul>
      </div>

      {/* Action Button */}
      {!progress && (
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {ingesting ? '⏳ Running Ingestion...' : '🚀 Start Full Ingestion'}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-destructive">❌ {error}</p>
        </div>
      )}

      {/* Live Logs (while running or after completion) */}
      {progress && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {progress.status === 'running' && '⏳ Ingestion in Progress'}
              {progress.status === 'completed' && '✅ Ingestion Completed'}
              {progress.status === 'failed' && '❌ Ingestion Failed'}
            </h2>
            {progress.status === 'running' && (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            )}
          </div>

          {/* Live Logs */}
          {progress.logs.length > 0 && (
            <div className="bg-muted border border-border rounded-lg overflow-hidden mb-4">
              <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                <p className="text-sm font-medium text-foreground">
                  📝 Live Logs ({progress.logs.length})
                </p>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  Auto-scroll
                </label>
              </div>
              <div
                id="ingest-full-logs"
                className="max-h-96 overflow-y-auto p-3 space-y-1 font-mono text-xs bg-background"
              >
                {progress.logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('❌')
                        ? 'text-red-600 dark:text-red-400'
                        : log.includes('⚠️')
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : log.includes('✅')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {progress?.result && (
        <div className="space-y-4">
          {/* Success Banner */}
          {progress.result?.success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✅ Ingestion completed successfully in {(progress.result.duration_ms / 1000).toFixed(1)}s
              </p>
            </div>
          )}

          {/* Stats Grid */}
          {progress.result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Records" value={progress.result.ingestion.records_processed} />
              <StatBox label="Items" value={progress.result.ingestion.items_created} />
              <StatBox label="Chunks" value={progress.result.ingestion.chunks_created} />
              <StatBox label="Embeddings" value={progress.result.ingestion.embeddings_generated} />
            </div>
          )}

          {/* Loader Results */}
          {progress.result && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Loader Results</h2>
              <div className="space-y-2">
                {progress.result.loaders.map((loader, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{loader.loader}</p>
                    <p className="text-xs text-muted-foreground">
                      {loader.duration_ms}ms
                      {loader.error && ` • Error: ${loader.error}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{loader.records}</p>
                    <p className="text-xs text-muted-foreground">records</p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}

          {/* Content Map */}
          {progress.result && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Content Map</h2>
                <p className="text-sm text-muted-foreground">
                  Generated navigation graph with {progress.result.content_map.sections} sections
                </p>
                <a
                  href="/api/content-map"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-primary hover:underline"
                >
                  View Content Map →
                </a>
              </div>
          )}

          {/* Errors */}
          {progress.result && progress.result.ingestion.errors > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                ⚠️ {progress.result.ingestion.errors} errors occurred during ingestion
              </p>
            </div>
          )}

          {/* Actions */}
          {progress.status !== 'running' && (
            <button
              onClick={() => {
                setProgress(null);
                setIngestionId(null);
                setError(null);
                setIngesting(false);
              }}
              className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition mt-4"
            >
              Run Another Ingestion
            </button>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-muted border border-border rounded-xl p-6 mt-6">
        <h3 className="text-lg font-bold text-foreground mb-3">
          How It Works
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Load:</strong> Run all content loaders (MDX, Communities, Libraries)
          </p>
          <p>
            <strong className="text-foreground">2. Chunk:</strong> Break content into ~950 word chunks with 100 word overlap
          </p>
          <p>
            <strong className="text-foreground">3. Embed:</strong> Generate vector embeddings via OpenAI (batch of 2048)
          </p>
          <p>
            <strong className="text-foreground">4. Store:</strong> Save canonical items + chunks in Redis with RediSearch index
          </p>
          <p>
            <strong className="text-foreground">5. Map:</strong> Generate navigation graph for chatbot
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted border border-border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
