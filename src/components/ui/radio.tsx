/**
 * Radio Primitive Component
 * Base radio component with semantic theming
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: 'default' | 'error';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = "h-4 w-4 rounded-full border border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";
    
    const variantClasses = {
      default: "",
      error: "border-destructive focus-visible:ring-destructive",
    };

    return (
      <input
        type="radio"
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

Radio.displayName = 'Radio';

