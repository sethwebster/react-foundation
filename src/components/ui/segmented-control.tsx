"use client";

import React from 'react';
import { cn } from '@/lib/cn';

export interface SegmentedControlOption {
  value: string;
  label?: string;
  icon?: React.ReactNode;
  title?: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  size = 'sm',
  variant = 'default',
  className,
}: SegmentedControlProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const paddingClasses = {
    sm: variant === 'compact' ? 'px-2' : 'px-3',
    md: variant === 'compact' ? 'px-3' : 'px-4',
    lg: variant === 'compact' ? 'px-4' : 'px-6',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-muted p-1',
        sizeClasses[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'relative flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 cursor-pointer',
              paddingClasses[size],
              isSelected
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
              variant === 'compact' && 'gap-1'
            )}
            title={option.title || option.label}
          >
            {option.icon && (
              <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
                {option.icon}
              </span>
            )}
            {option.label && variant !== 'compact' && (
              <span className="whitespace-nowrap">{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
