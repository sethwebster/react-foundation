/**
 * FormInput Component
 * Composition of Input + Label + Error/Helper text
 * Provides consistent form field styling
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';

export interface FormInputProps extends InputProps {
  /** Label text */
  label?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Error text (takes precedence over helperText) */
  errorText?: string;
  /** Whether field is required */
  required?: boolean;
  /** ID for the input (auto-generated if not provided) */
  id?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    helperText, 
    errorText, 
    required,
    id,
    className,
    variant,
    ...props 
  }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = !!errorText || variant === 'error';
    const displayVariant = hasError ? 'error' : variant;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <Input
          id={inputId}
          ref={ref}
          variant={displayVariant}
          className={className}
          aria-invalid={hasError}
          aria-describedby={
            errorText ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {errorText && (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {errorText}
          </p>
        )}
        {helperText && !errorText && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

