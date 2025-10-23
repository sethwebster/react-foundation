"use client";

import { useState } from 'react';

export function SlideDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      {/* Click to Expand Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-border bg-card p-4 text-left transition hover:bg-muted"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">Click to Expand</span>
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Slide Out Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="rounded-b-lg border border-border bg-card p-4 shadow-lg">
          <h3 className="mb-2 font-semibold">Expanded Content</h3>
          <p className="text-sm text-muted-foreground">
            This content slides out when you click the button above. 
            The animation should be smooth and natural.
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-8 rounded bg-muted"></div>
            <div className="h-8 rounded bg-muted"></div>
            <div className="h-8 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
