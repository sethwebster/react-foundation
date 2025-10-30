/**
 * Dialog Primitive Component
 * Modal dialog component with semantic theming
 * Simple implementation - can be enhanced with Radix Dialog later
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 h-8 w-8 p-0"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Content */}
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

