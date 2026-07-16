"use client";

import React from 'react';
import { ThemeToggle, ThemeToggleWithLabel } from './theme-toggle';
import { useHasMounted } from '@/lib/hooks/use-has-mounted';

interface ThemeToggleWrapperProps {
  withLabel?: boolean;
}

export function ThemeToggleWrapper({ withLabel = false }: ThemeToggleWrapperProps) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return <div className={withLabel ? "h-11 w-full" : "h-11 w-11"} aria-hidden />;
  }

  return withLabel ? <ThemeToggleWithLabel /> : <ThemeToggle />;
}
