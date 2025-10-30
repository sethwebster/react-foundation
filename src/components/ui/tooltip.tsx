/**
 * Tooltip Primitive Component
 * Simple tooltip component - can be enhanced with Radix Tooltip later
 */

'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-border',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-border',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-border',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-border',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            sideClasses[side],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              "absolute h-0 w-0 border-4 border-transparent",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  );
}

