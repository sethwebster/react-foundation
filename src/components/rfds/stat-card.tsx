/**
 * StatCard Component
 * Unified stat/info/metric card component
 * Replaces duplicate StatCard, InfoCard, MetricCard implementations
 */

import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SemanticCard } from './semantic-components';

export interface StatCardProps {
  /** Main value/stat to display */
  value: string | number;
  /** Label for the stat */
  label: string;
  /** Optional detail/subtext below value */
  detail?: string;
  /** Optional icon (emoji or ReactNode) */
  icon?: string | ReactNode;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Highlight variant for emphasis */
  highlight?: boolean;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Color scheme */
  color?: 'primary' | 'success' | 'destructive' | 'warning';
  /** Custom className */
  className?: string;
}

export function StatCard({
  value,
  label,
  detail,
  icon,
  trend,
  highlight = false,
  variant = 'outlined',
  color = 'primary',
  className,
}: StatCardProps) {
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const colorClasses = {
    primary: highlight ? 'border-primary/30 bg-primary/10' : '',
    success: highlight ? 'border-success/30 bg-success/10' : '',
    destructive: highlight ? 'border-destructive/30 bg-destructive/10' : '',
    warning: highlight ? 'border-warning/30 bg-warning/10' : '',
  };

  const valueColorClasses = {
    primary: highlight ? 'text-primary' : 'text-foreground',
    success: highlight ? 'text-success-foreground' : 'text-foreground',
    destructive: highlight ? 'text-destructive-foreground' : 'text-foreground',
    warning: highlight ? 'text-warning-foreground' : 'text-foreground',
  };

  return (
    <SemanticCard
      variant={variant}
      hover={!highlight}
      className={cn(
        'p-4',
        highlight && colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {icon && (
            <div className="text-2xl mb-2">
              {typeof icon === 'string' ? icon : icon}
            </div>
          )}
          <div className={cn(
            'text-2xl md:text-3xl font-bold mb-1',
            valueColorClasses[color]
          )}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {detail && (
            <div className="text-xs text-muted-foreground mt-1">{detail}</div>
          )}
        </div>
        {trend && (
          <div className={cn('text-2xl', trendColors[trend])}>
            {trendIcons[trend]}
          </div>
        )}
      </div>
    </SemanticCard>
  );
}

