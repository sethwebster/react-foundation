/**
 * Vector Store Inspection Page
 * Debug tool to see what's stored in Redis
 */

'use client';

import { useState } from 'react';

interface IndexMetadata {
  indexName: string;
  prefix: string;
  createdAt: string;
  chunkCount?: number;
  status: 'building' | 'active' | 'inactive';
}

interface VectorInspection {
  currentIndex: string | null;
  totalChunks: number;
  samples: Array<{
    key: string;
    id: string;
    source: string;
    contentPreview: string;
    hasEmbedding: boolean;
    embeddingSize: number;
  }>;
  allIndices: IndexMetadata[];
  config: {
    defaultPrefix: string;
    defaultIndex: string;
    embeddingModel: string;
  };
  index: {
    exists: boolean;
    info: unknown;
  };
}

export default function InspectPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VectorInspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/ingest/inspect');
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || 'Failed to inspect vector store');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
            🔍
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vector Store Inspector
            </h1>
            <p className="text-muted-foreground">
              Debug tool to inspect what content is stored in the vector database.
            </p>
          </div>
        </div>
      </div>

      {/* Inspect Button */}
      {!data && (
        <button
          onClick={handleInspect}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? '🔄 Inspecting...' : '🔍 Inspect Vector Store'}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-destructive">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Current Index */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Active Index
            </h2>
            {data.currentIndex ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-3xl">✓</span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Current Index</p>
                    <p className="text-lg font-mono text-foreground">{data.currentIndex}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox
                    label="Total Chunks"
                    value={data.totalChunks}
                    color="text-blue-600 dark:text-blue-400"
                  />
                  <StatBox
                    label="All Indices"
                    value={data.allIndices.length}
                    color="text-purple-600 dark:text-purple-400"
                  />
                  <StatBox
                    label="Model"
                    value={data.config.embeddingModel.split('-').pop() || '?'}
                    color="text-cyan-600 dark:text-cyan-400"
                  />
                  <StatBox
                    label="Samples"
                    value={data.samples.length}
                    color="text-yellow-600 dark:text-yellow-400"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ No active index set. Run an ingestion to create one.
                </p>
              </div>
            )}
          </div>

          {/* All Indices */}
          {data.allIndices.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                All Indices ({data.allIndices.length})
              </h2>
              <div className="space-y-2">
                {data.allIndices.map((index) => (
                  <div
                    key={index.indexName}
                    className={`p-4 rounded-lg border ${
                      index.status === 'active'
                        ? 'bg-green-500/10 border-green-500/20'
                        : index.status === 'building'
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-mono text-foreground mb-1">
                          {index.indexName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(index.createdAt).toLocaleString()}
                        </p>
                        {index.chunkCount !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Chunks: {index.chunkCount}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          index.status === 'active'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : index.status === 'building'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Configuration
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Default Prefix:</span>
                <span className="text-foreground">{data.config.defaultPrefix}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Default Index:</span>
                <span className="text-foreground">{data.config.defaultIndex}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Embedding Model:</span>
                <span className="text-foreground">{data.config.embeddingModel}</span>
              </div>
            </div>
          </div>

          {/* Sample Chunks */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Sample Chunks (First 10)
            </h2>
            <div className="space-y-4">
              {data.samples.map((sample, i) => (
                <div
                  key={i}
                  className="bg-muted border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {sample.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: <code className="text-primary">{sample.source}</code>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {sample.hasEmbedding && (
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded">
                          ✓ Embedded
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        {sample.embeddingSize} bytes
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-background p-2 rounded mt-2">
                    {sample.contentPreview}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => {
              setData(null);
              setError(null);
            }}
            className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-muted border border-border rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
