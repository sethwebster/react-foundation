/**
 * Admin Import Page
 * Simple UI to import communities from JSON
 */

'use client';

import { useState } from 'react';

export default function AdminImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/import-communities', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Import Communities
        </h1>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <p className="text-foreground">
            This will merge all community data sources and seed Redis with the complete list.
          </p>

          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground space-y-2">
            <p><strong>Sources:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Manual data: ~33 communities (best structure)</li>
              <li>JSON data: 43 communities from react.dev</li>
              <li>Deduplicates and merges → ~65 total</li>
            </ul>
          </div>

          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              setResult(null);
              try {
                const response = await fetch('/api/admin/merge-communities', {
                  method: 'POST',
                });
                const data = await response.json();
                if (data.success) {
                  setResult(data);
                } else {
                  setError(data.error || 'Merge failed');
                }
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Merging & Seeding...' : 'Merge All Data & Seed Redis'}
          </button>

          {result && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-bold text-green-600 dark:text-green-400 mb-2">
                ✅ Import Successful!
              </h3>
              <div className="text-sm text-foreground space-y-1">
                <p>Total: {result.stats.total}</p>
                <p>Active: {result.stats.active}</p>
                <p>Inactive: {result.stats.inactive}</p>
                <p>Countries: {result.stats.countries}</p>
                <p>Total Members: {result.stats.totalMembers.toLocaleString()}</p>
              </div>
              <a
                href="/communities"
                className="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                View Communities →
              </a>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <h3 className="font-bold text-destructive mb-2">❌ Import Failed</h3>
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
