/**
 * Switch Primitive Component
 * Base switch/toggle component with semantic theming
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: 'default' | 'error';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, variant = 'default', checked, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          role="switch"
          className="sr-only peer"
          checked={checked}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary" : "bg-input",
            variant === 'error' && "focus-visible:ring-destructive",
            className
          )}
        >
          <span
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

