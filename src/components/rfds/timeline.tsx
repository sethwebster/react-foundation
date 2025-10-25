/**
 * RFDS Timeline Component
 * A gorgeous, pixel-perfect vertical timeline for roadmaps, milestones, and progress tracking
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

// Timeline Container
interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={cn('space-y-8', className)}>
      {childArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ isLast?: boolean }>, {
            isLast: index === childArray.length - 1,
          });
        }
        return child;
      })}
    </div>
  );
}

// Timeline Item Types
type TimelineVariant = 'completed' | 'current' | 'upcoming' | 'default';

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  items?: string[];
  variant?: TimelineVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export function TimelineItem({
  title,
  subtitle,
  date,
  description,
  items,
  variant = 'default',
  icon,
  children,
  className,
  isLast = false,
}: TimelineItemProps) {
  // Variant-specific styles
  const dotStyles = {
    completed: {
      dot: 'bg-success border-success shadow-lg shadow-success/30',
      ring: 'ring-success/20',
      badge: 'bg-success/10 text-success border-success/30',
      card: 'border-success/30 bg-success/5',
    },
    current: {
      dot: 'bg-primary border-primary shadow-lg shadow-primary/40 animate-pulse',
      ring: 'ring-primary/30 ring-4',
      badge: 'bg-primary/10 text-primary border-primary/50',
      card: 'border-primary/50 bg-primary/5',
    },
    upcoming: {
      dot: 'bg-muted-foreground/30 border-muted-foreground/50',
      ring: '',
      badge: 'bg-muted/50 text-muted-foreground border-border',
      card: 'border-border/50 bg-muted/30',
    },
    default: {
      dot: 'bg-primary border-primary/50 shadow-md shadow-primary/20',
      ring: '',
      badge: 'bg-muted text-foreground border-border',
      card: 'border-border bg-card',
    },
  };

  const styles = dotStyles[variant];

  return (
    <div className={cn('relative flex gap-6 group', className)}>
      {/* Timeline Dot with connecting line */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-3 border-background transition-all duration-300',
            styles.dot,
            styles.ring,
            'group-hover:scale-110'
          )}
        >
          {icon && (
            <div className="text-base leading-none">
              {icon}
            </div>
          )}
        </div>
        {/* Vertical line extending down - only shown if not last item */}
        {/* Line extends from dot center through content and gap to next dot center */}
        {/* Extends from 16px (dot center) down, through space-y-8 (32px), to next dot center (+16px) = -48px from bottom */}
        {!isLast && (
          <div className="absolute left-[15px] top-4 w-[2px] bg-gradient-to-b from-primary/60 to-primary/30"
               style={{ bottom: '-48px' }} />
        )}
      </div>

      {/* Content Card */}
      <div
        className={cn(
          'flex-1 rounded-xl border-2 p-6 transition-all duration-300',
          styles.card,
          'group-hover:shadow-lg group-hover:scale-[1.02] group-hover:border-primary/40'
        )}
      >
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {date && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    styles.badge
                  )}
                >
                  {date}
                </span>
              )}
              {subtitle && (
                <span className="text-sm font-medium text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="mb-4 text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Items List */}
        {items && items.length > 0 && (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                    variant === 'completed' ? 'bg-success' :
                    variant === 'current' ? 'bg-primary' :
                    'bg-muted-foreground/50'
                  )}
                />
                <span className="text-foreground/80 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Custom Children */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact Timeline Item (for simpler use cases)
interface TimelineStepProps {
  title: string;
  description?: string;
  variant?: TimelineVariant;
  icon?: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export function TimelineStep({
  title,
  description,
  variant = 'default',
  icon,
  className,
  isLast = false,
}: TimelineStepProps) {
  const dotStyles = {
    completed: 'bg-success border-success shadow-success/30',
    current: 'bg-primary border-primary shadow-primary/40 animate-pulse ring-4 ring-primary/30',
    upcoming: 'bg-muted-foreground/30 border-muted-foreground/50',
    default: 'bg-primary border-primary/50 shadow-primary/20',
  };

  return (
    <div className={cn('relative flex gap-4 group', className)}>
      {/* Timeline Dot with connecting line */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-3 border-background shadow-md transition-all duration-300',
            dotStyles[variant],
            'group-hover:scale-110'
          )}
        >
          {icon && (
            <div className="text-sm leading-none">
              {icon}
            </div>
          )}
        </div>
        {/* Vertical line extending down - only shown if not last item */}
        {/* Line extends from dot center through content and gap to next dot center */}
        {/* Extends from 16px (dot center) down, through space-y-8 (32px), to next dot center (+16px) = -48px from bottom */}
        {!isLast && (
          <div className="absolute left-[15px] top-4 w-[2px] bg-gradient-to-b from-primary/60 to-primary/30"
               style={{ bottom: '-48px' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Progress Timeline (shows completion percentage)
interface TimelineProgressProps {
  steps: {
    title: string;
    completed: boolean;
  }[];
  className?: string;
}

export function TimelineProgress({ steps, className }: TimelineProgressProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className={cn('relative', className)}>
      {/* Progress Line */}
      <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-muted">
        <div
          className="w-full bg-gradient-to-b from-success via-primary to-primary transition-all duration-500"
          style={{ height: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <TimelineStep
            key={i}
            title={step.title}
            variant={step.completed ? 'completed' : 'upcoming'}
            icon={step.completed ? '✓' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
