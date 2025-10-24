"use client";

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Returns true once the component has mounted on the client.
 * Uses useSyncExternalStore to avoid setState calls inside effects.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    useCallback((callback: () => void) => {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const rafId = window.requestAnimationFrame(() => {
        callback();
      });

      return () => window.cancelAnimationFrame(rafId);
    }, []),
    () => true,
    () => false
  );
}
