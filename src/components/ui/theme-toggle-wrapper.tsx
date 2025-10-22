"use client";

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';

interface ThemeToggleWrapperProps {
  withLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggleWrapper({ withLabel = false, size = 'sm' }: ThemeToggleWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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
