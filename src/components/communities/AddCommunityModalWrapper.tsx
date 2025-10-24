/**
 * Add Community Modal Wrapper
 * Modal overlay for the intercepting route
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AddCommunityForm } from './AddCommunityForm';

export function AddCommunityModalWrapper() {
  const router = useRouter();

  // Prevent body scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={() => router.back()}
    >
      <div
        className="bg-card border-2 border-border rounded-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Add Your Community</h2>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <AddCommunityForm onSuccess={() => router.back()} />
        </div>
      </div>
    </div>
  );
}
