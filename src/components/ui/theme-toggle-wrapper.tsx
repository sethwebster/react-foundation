"use client";

import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { useHasMounted } from '@/lib/hooks/use-has-mounted';

interface ThemeToggleWrapperProps {
  withLabel?: boolean;
}

export function ThemeToggleWrapper({ withLabel = false }: ThemeToggleWrapperProps) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    // Return a placeholder during SSR
    return (
      <div className="inline-flex items-center rounded-lg bg-muted p-1 animate-pulse">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-muted-foreground/20"></div>
          <div className="h-4 w-4 rounded bg-muted-foreground/20"></div>
          <div className="h-4 w-4 rounded bg-muted-foreground/20"></div>
        </div>
      </div>
    );
  }

  return withLabel ? <ThemeToggle /> : <ThemeToggle />;
}
