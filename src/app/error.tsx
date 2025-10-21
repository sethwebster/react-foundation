/**
 * Global Error Page
 * Inspired by 404 page with 3D React logo
 */

'use client';

import { useEffect } from 'react';
import { ReactLogo3D } from '@/components/ui/react-logo-3d';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <main className="relative h-screen overflow-hidden">
      <BackgroundGlow />

      {/* Full screen 3D React Logo */}
      <div className="fixed inset-0 z-0">
        <ReactLogo3D />
      </div>

      {/* Error Message - Overlay */}
      <div className="fixed z-10 flex items-center justify-center px-6 text-center" style={{ bottom: '6rem', left: '0', right: '0' }}>
        <div className="max-w-2xl space-y-8">
          {/* Error message */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Something tangled the{' '}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              React Fiber
            </span>
          </h1>

          <p className="text-lg text-white/70">
            Don't worry, it happens to the best of us. Let's get you back on track.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
              <summary className="cursor-pointer font-mono text-sm text-red-300">
                Error Details (Dev Only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-200">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="min-w-[200px] rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-bold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-400"
            >
              Try Again
            </button>
            <a
              href="/"
              className="min-w-[200px] rounded-lg border-2 border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-slate-900">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.08),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,_rgba(251,146,60,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_rgba(236,72,153,0.12),_transparent_45%)]" />
    </div>
  );
}
