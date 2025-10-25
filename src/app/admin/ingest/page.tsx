/**
 * Admin Content Ingestion Page (DEPRECATED)
 * Redirects to new loader-based ingestion at /admin/ingest-full
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IngestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new loader-based ingestion
    router.push('/admin/ingest-full');
  }, [router]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Redirecting to New Ingestion System
        </h1>
        <p className="text-muted-foreground mb-4">
          The old crawler-based ingestion has been replaced with a faster, more reliable loader architecture.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          New features:
        </p>
        <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
          <li>✅ Push-based loaders (no crawling)</li>
          <li>✅ Loads docs + communities + libraries</li>
          <li>✅ 400-500 chunks of knowledge</li>
          <li>✅ Fast and reliable (60-90s)</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          If you're not redirected automatically,{' '}
          <a href="/admin/ingest-full" className="text-primary hover:underline">
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
