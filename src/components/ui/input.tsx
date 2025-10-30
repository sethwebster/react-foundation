/**
 * Input Primitive Component
 * Base input component with semantic theming
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', type = 'text', ...props }, ref) => {
    const baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    const variantClasses = {
      default: "border-input bg-background text-foreground",
      error: "border-destructive bg-background text-foreground focus-visible:ring-destructive",
      success: "border-success bg-background text-foreground focus-visible:ring-success",
    };

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

