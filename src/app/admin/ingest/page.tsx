/**
 * Admin Content Ingestion Page
 * Crawl site and generate vector embeddings for chatbot
 */

'use client';

import { useState, useEffect } from 'react';

interface IngestionProgress {
  status: 'running' | 'completed' | 'failed';
  phase: 'crawling' | 'extracting' | 'files' | 'embedding' | 'storing' | 'swapping' | 'cleanup' | 'completed';
  crawledPages: number;
  totalPages: number;
  filesIngested: number;
  chunksCreated: number;
  chunksStored: number;
  currentUrl?: string;
  newIndexName?: string;
  oldIndexName?: string;
  logs: string[];
  errors: string[];
  startedAt: string;
  completedAt?: string;
}

export default function IngestPage() {
  const [clearExisting, setClearExisting] = useState(true);
  const [maxPages, setMaxPages] = useState(100);
  const [allowedPaths, setAllowedPaths] = useState('');
  const [excludePaths, setExcludePaths] = useState('/api,/admin,/_next');
  const [ingesting, setIngesting] = useState(false);
  const [ingestionId, setIngestionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<IngestionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Poll for progress updates
  useEffect(() => {
    if (!ingestionId || !ingesting) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/admin/ingest?ingestionId=${ingestionId}`
        );
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
    }, 1000);

    return () => clearInterval(interval);
  }, [ingestionId, ingesting]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && progress?.logs.length) {
      const logsContainer = document.getElementById('ingest-logs-container');
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
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteOldIndex: clearExisting,
          maxPages,
          allowedPaths: allowedPaths
            ? allowedPaths.split(',').map((p) => p.trim())
            : undefined,
          excludePaths: excludePaths
            ? excludePaths.split(',').map((p) => p.trim())
            : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIngestionId(data.ingestionId);
      } else {
        setError(data.error || 'Failed to start ingestion');
        setIngesting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIngesting(false);
    }
  };

  const phaseLabel = {
    crawling: '🕷️ Crawling Site',
    extracting: '📄 Extracting Content',
    files: '📁 Ingesting Files',
    embedding: '🧠 Generating Embeddings',
    storing: '💾 Storing Data',
    swapping: '🔄 Swapping Index',
    cleanup: '🗑️ Cleaning Up',
    completed: '✅ Completed',
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Chatbot Content Ingestion
            </h1>
            <p className="text-muted-foreground">
              Crawl your site and generate vector embeddings for the AI chatbot.
              This will enable the chatbot to answer questions about your content.
            </p>
            <a
              href="/admin/ingest/inspect"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              🔍 Inspect Vector Store
            </a>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {!progress && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Configuration
          </h2>

          <div className="space-y-4">
            {/* Delete Old Index */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <input
                id="clearExisting"
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <div>
                <label
                  htmlFor="clearExisting"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Delete Old Index After Swap
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Delete the old index after successfully swapping to the new one.
                  Recommended to save space. Ingestion uses blue-green deployment for zero downtime.
                </p>
              </div>
            </div>

            {/* Max Pages */}
            <div>
              <label
                htmlFor="maxPages"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Max Pages to Crawl
              </label>
              <input
                id="maxPages"
                type="number"
                min="1"
                max="1000"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value) || 100)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Limit the number of pages to crawl (1-1000). Higher numbers take longer.
              </p>
            </div>

            {/* Allowed Paths */}
            <div>
              <label
                htmlFor="allowedPaths"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Allowed Paths (optional)
              </label>
              <input
                id="allowedPaths"
                type="text"
                value={allowedPaths}
                onChange={(e) => setAllowedPaths(e.target.value)}
                placeholder="/docs,/blog,/about"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of path prefixes to include. Leave empty to include all paths.
              </p>
            </div>

            {/* Excluded Paths */}
            <div>
              <label
                htmlFor="excludePaths"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Excluded Paths
              </label>
              <input
                id="excludePaths"
                type="text"
                value={excludePaths}
                onChange={(e) => setExcludePaths(e.target.value)}
                placeholder="/api,/admin,/_next"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of path prefixes to exclude.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                ℹ️ Blue-Green Deployment (Zero Downtime)
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Creates new index with unique name</li>
                <li>Crawls public pages (static HTML via linkedom)</li>
                <li>Ingests files from public-context/ (server-side)</li>
                <li>Builds into new index (chatbot uses old)</li>
                <li>Atomic swap when complete (instant switchover)</li>
                <li>Optionally deletes old index after successful swap</li>
                <li>Chatbot always has data - zero downtime!</li>
              </ul>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleIngest}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              🚀 Start Ingestion
            </button>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {progress && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {progress.status === 'running' && '⏳ Ingestion in Progress'}
            {progress.status === 'completed' && '✅ Ingestion Completed'}
            {progress.status === 'failed' && '❌ Ingestion Failed'}
          </h2>

          {/* Current Phase */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {phaseLabel[progress.phase]}
              </span>
              <span className="text-sm text-muted-foreground">
                {progress.phase === 'crawling' &&
                  `${progress.crawledPages}/${progress.totalPages} pages`}
                {progress.phase === 'extracting' &&
                  `${progress.chunksCreated} chunks created`}
                {progress.phase === 'files' &&
                  `${progress.filesIngested} files ingested`}
                {progress.phase === 'embedding' &&
                  `${progress.chunksStored}/${progress.chunksCreated} stored`}
                {progress.phase === 'swapping' && progress.newIndexName &&
                  `Swapping to ${progress.newIndexName}`}
                {progress.phase === 'cleanup' && progress.oldIndexName &&
                  `Deleting ${progress.oldIndexName}`}
              </span>
            </div>

            {progress.currentUrl && (
              <p className="text-xs text-muted-foreground truncate">
                {progress.currentUrl}
              </p>
            )}

            {/* Index Info */}
            {progress.newIndexName && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  New Index: <code className="text-primary">{progress.newIndexName}</code>
                </p>
                {progress.oldIndexName && (
                  <p className="text-xs text-muted-foreground">
                    Old Index: <code className="text-yellow-600 dark:text-yellow-400">{progress.oldIndexName}</code>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox
              label="Pages Crawled"
              value={progress.crawledPages}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatBox
              label="Files Ingested"
              value={progress.filesIngested}
              color="text-cyan-600 dark:text-cyan-400"
            />
            <StatBox
              label="Chunks Stored"
              value={progress.chunksStored}
              color="text-purple-600 dark:text-purple-400"
            />
            <StatBox
              label="Errors"
              value={progress.errors.length}
              color="text-red-600 dark:text-red-400"
            />
          </div>

          {/* Live Logs */}
          {progress.logs.length > 0 && (
            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                <p className="text-sm font-medium text-foreground">
                  📝 Ingestion Logs ({progress.logs.length})
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
                id="ingest-logs-container"
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
                        : 'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {progress.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✅ Ingestion completed successfully!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The chatbot can now answer questions about your content.
              </p>
            </div>
          )}

          {/* Actions */}
          {progress.status !== 'running' && (
            <button
              onClick={() => {
                setProgress(null);
                setIngestionId(null);
                setIngesting(false);
              }}
              className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition mt-4"
            >
              Start New Ingestion
            </button>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-muted border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-3">
          How It Works
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Crawling:</strong> Discovers all pages by following internal links
          </p>
          <p>
            <strong className="text-foreground">2. Extraction:</strong> Removes navigation and extracts main content
          </p>
          <p>
            <strong className="text-foreground">3. Chunking:</strong> Breaks content into ~1000 character chunks with overlap
          </p>
          <p>
            <strong className="text-foreground">4. Embedding:</strong> Generates vector embeddings using OpenAI
          </p>
          <p>
            <strong className="text-foreground">5. Storage:</strong> Stores in Redis for fast semantic search
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-muted border border-border rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
