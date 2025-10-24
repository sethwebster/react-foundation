/**
 * Admin Reset Page
 * Dangerous reset operations
 */

'use client';

import { useState } from 'react';

export default function AdminResetPage() {
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/reset-communities', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Reset complete! Refresh to re-seed ${data.message}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`❌ Failed: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="bg-card border-2 border-destructive/30 rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-destructive/20 rounded-full flex items-center justify-center text-xl md:text-2xl">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-destructive mb-2">
            Reset Communities
          </h2>
          <p className="text-sm md:text-base text-foreground mb-4">
            This will clear all community data from Redis and force a re-seed from the source file.
            The page will automatically reload.
          </p>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 md:p-4 mb-4">
            <p className="text-sm font-medium text-foreground mb-2">
              ⚠️ WARNING: This action will:
            </p>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Delete all communities from Redis</li>
              <li>Clear the seeded flag</li>
              <li>Force re-seed from communities.ts</li>
              <li>Any runtime-added communities will be lost</li>
            </ul>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-destructive/90 transition"
            >
              Reset Communities
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-destructive/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    Resetting...
                  </>
                ) : (
                  <>⚠️ Confirm Reset</>
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
                className="w-full sm:w-auto bg-secondary text-secondary-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-secondary/90 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}

          {result && (
            <div className="mt-4 p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-sm md:text-base text-foreground font-medium">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
