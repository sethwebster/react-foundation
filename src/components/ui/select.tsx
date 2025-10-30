/**
 * Select Primitive Component
 * Base select component with semantic theming
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'error' | 'success';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground";
    
    const variantClasses = {
      default: "border-input bg-background text-foreground",
      error: "border-destructive bg-background text-foreground focus-visible:ring-destructive",
      success: "border-success bg-background text-foreground focus-visible:ring-success",
    };

    return (
      <select
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

