/**
 * Checkbox Primitive Component
 * Base checkbox component with semantic theming
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: 'default' | 'error';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = "h-4 w-4 rounded border border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";
    
    const variantClasses = {
      default: "",
      error: "border-destructive focus-visible:ring-destructive",
    };

    return (
      <input
        type="checkbox"
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

Checkbox.displayName = 'Checkbox';

