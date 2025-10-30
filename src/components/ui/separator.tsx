/**
 * Separator Primitive Component
 * Visual separator line component
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0 bg-border",
          orientation === 'horizontal' ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

