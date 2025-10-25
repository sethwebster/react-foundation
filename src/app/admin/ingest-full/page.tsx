/**
 * Full Ingestion Admin Page
 * Trigger complete content ingestion using loader architecture
 */

'use client';

import { useState } from 'react';

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

export default function IngestFullPage() {
  const [ingesting, setIngesting] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ingest/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to run ingestion');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
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

      {/* Info Box */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-2">
          ℹ️ Loader Architecture (Push-Based)
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><strong>MDX Loader:</strong> 12 docs from public-context/</li>
          <li><strong>Communities Loader:</strong> ~65 React communities from Redis</li>
          <li><strong>Libraries Loader:</strong> 54 tracked React ecosystem libraries</li>
          <li><strong>Total:</strong> ~400-500 chunks of comprehensive knowledge</li>
          <li><strong>No crawling:</strong> All content loaded from structured sources</li>
          <li><strong>Fast:</strong> Completes in 30-90 seconds</li>
        </ul>
      </div>

      {/* Action Button */}
      {!result && !ingesting && (
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

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Success Banner */}
          {result.success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✅ Ingestion completed successfully in {(result.duration_ms / 1000).toFixed(1)}s
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Records" value={result.ingestion.records_processed} />
            <StatBox label="Items" value={result.ingestion.items_created} />
            <StatBox label="Chunks" value={result.ingestion.chunks_created} />
            <StatBox label="Embeddings" value={result.ingestion.embeddings_generated} />
          </div>

          {/* Loader Results */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Loader Results</h2>
            <div className="space-y-2">
              {result.loaders.map((loader, i) => (
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

          {/* Content Map */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Content Map</h2>
            <p className="text-sm text-muted-foreground">
              Generated navigation graph with {result.content_map.sections} sections
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

          {/* Errors */}
          {result.ingestion.errors > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                ⚠️ {result.ingestion.errors} errors occurred during ingestion
              </p>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition"
          >
            Run Another Ingestion
          </button>
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
