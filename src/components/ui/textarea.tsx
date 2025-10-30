/**
 * Textarea Primitive Component
 * Base textarea component with semantic theming
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    const variantClasses = {
      default: "border-input bg-background text-foreground",
      error: "border-destructive bg-background text-foreground focus-visible:ring-destructive",
      success: "border-success bg-background text-foreground focus-visible:ring-success",
    };

    return (
      <textarea
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

Textarea.displayName = 'Textarea';

