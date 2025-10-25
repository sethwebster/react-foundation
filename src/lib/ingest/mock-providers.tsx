/**
 * Mock Providers for Server-Side Rendering
 * Provides stub implementations of client components needed by pages
 * These are NOT marked 'use client' so they can be used in server rendering
 */

import React from 'react';

/**
 * Simple passthrough wrapper
 * Used in place of client providers during content extraction
 */
export function MockProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
