/**
 * Admin Redis Migration Page
 * Migrate data from old Redis instance to new one
 */

'use client';

import { useState, useEffect } from 'react';

interface MigrationProgress {
  status: 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  currentKey?: string;
  migratedKeys: number;
  skippedKeys: number;
  failedKeys: number;
  errors: string[];
  logs: string[];
  startedAt: string;
  completedAt?: string;
}

export default function MigrateRedisPage() {
  const [oldRedisUrl, setOldRedisUrl] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationId, setMigrationId] = useState<string | null>(null);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Poll for progress updates
  useEffect(() => {
    if (!migrationId || !migrating) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/admin/migrate-redis?migrationId=${migrationId}`
        );
        const data = await response.json();

        if (response.ok) {
          setProgress(data);

          // Stop polling if completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            setMigrating(false);
          }
        } else {
          setError(data.error || 'Failed to get migration status');
          setMigrating(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setMigrating(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [migrationId, migrating]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (autoScroll && progress?.logs.length) {
      const logsContainer = document.getElementById('logs-container');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }
  }, [progress?.logs, autoScroll]);

  const handleMigrate = async () => {
    if (!oldRedisUrl.trim()) {
      setError('Please enter the old Redis URL');
      return;
    }

    setMigrating(true);
    setError(null);
    setProgress(null);
    setMigrationId(null);

    try {
      const response = await fetch('/api/admin/migrate-redis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldRedisUrl, dryRun }),
      });

      const data = await response.json();

      if (response.ok) {
        setMigrationId(data.migrationId);
      } else {
        setError(data.error || 'Failed to start migration');
        setMigrating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMigrating(false);
    }
  };

  const progressPercent = progress
    ? Math.round((progress.progress / progress.total) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
            🔄
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Redis Migration
            </h1>
            <p className="text-muted-foreground">
              Migrate all data from your old Redis instance to the new one.
              This will copy all keys while preserving types and TTLs.
            </p>
          </div>
        </div>
      </div>

      {/* Migration Form */}
      {!migrating && !progress && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Configuration
          </h2>

          <div className="space-y-4">
            {/* Old Redis URL */}
            <div>
              <label
                htmlFor="oldRedisUrl"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Old Redis URL
              </label>
              <input
                id="oldRedisUrl"
                type="text"
                value={oldRedisUrl}
                onChange={(e) => setOldRedisUrl(e.target.value)}
                placeholder="redis://username:password@host:port"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: redis://[username:password@]host:port[/database]
              </p>
            </div>

            {/* Dry Run Option */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <input
                id="dryRun"
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <div>
                <label
                  htmlFor="dryRun"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Dry Run (Recommended)
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Test the migration without actually copying data. This will
                  show you what would be migrated without making any changes.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                ℹ️ Migration Details
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Scans all keys from the old Redis instance</li>
                <li>Preserves key types (string, hash, list, set, zset)</li>
                <li>Maintains TTL (expiration) values</li>
                <li>Skips keys that already exist in the new instance</li>
                <li>Provides real-time progress updates</li>
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

            {/* Start Migration Button */}
            <button
              onClick={handleMigrate}
              disabled={!oldRedisUrl.trim()}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dryRun ? '🔍 Start Dry Run' : '🚀 Start Migration'}
            </button>
          </div>
        </div>
      )}

      {/* Migration Progress */}
      {migrating && progress && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {progress.status === 'running' && '⏳ Migration in Progress'}
            {progress.status === 'completed' && '✅ Migration Completed'}
            {progress.status === 'failed' && '❌ Migration Failed'}
          </h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {progress.progress} / {progress.total} keys
              </span>
              <span className="text-sm font-medium text-foreground">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progress.currentKey && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Current: {progress.currentKey}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatBox
              label="Migrated"
              value={progress.migratedKeys}
              color="text-green-600 dark:text-green-400"
            />
            <StatBox
              label="Skipped"
              value={progress.skippedKeys}
              color="text-yellow-600 dark:text-yellow-400"
            />
            <StatBox
              label="Failed"
              value={progress.failedKeys}
              color="text-red-600 dark:text-red-400"
            />
          </div>

          {/* Live Logs */}
          {progress.logs.length > 0 && (
            <div className="bg-muted border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                <p className="text-sm font-medium text-foreground">
                  📝 Migration Logs ({progress.logs.length})
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
                id="logs-container"
                className="max-h-64 overflow-y-auto p-3 space-y-1 font-mono text-xs bg-background"
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

          {/* Errors Summary */}
          {progress.errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-2">
                ❌ Error Summary ({progress.errors.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {progress.errors.map((err, i) => (
                  <p key={i} className="text-xs text-muted-foreground font-mono">
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {progress.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✅ Migration completed successfully!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Started: {new Date(progress.startedAt).toLocaleString()}
                <br />
                Completed: {progress.completedAt && new Date(progress.completedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          {progress.status !== 'running' && (
            <button
              onClick={() => {
                setProgress(null);
                setMigrationId(null);
                setMigrating(false);
                setOldRedisUrl('');
              }}
              className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition mt-4"
            >
              Start New Migration
            </button>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-muted border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-3">
          Migration Guide
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Test First:</strong> Always
            run a dry run first to see what will be migrated.
          </p>
          <p>
            <strong className="text-foreground">2. Check Results:</strong>{' '}
            Review the dry run results for any errors or unexpected keys.
          </p>
          <p>
            <strong className="text-foreground">3. Live Migration:</strong>{' '}
            Once satisfied, uncheck "Dry Run" and migrate for real.
          </p>
          <p>
            <strong className="text-foreground">4. Verification:</strong> After
            migration, verify your application is working correctly.
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
