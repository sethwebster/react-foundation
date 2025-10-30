/**
 * Community Guide Components
 * Beautiful, interactive components for the community organizer guide
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { RFDS } from '@/components/rfds';

// Timeline Component
export interface TimelineItemProps {
  month: string;
  title: string;
  items: string[];
  variant?: 'default' | 'current' | 'upcoming';
}

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose relative space-y-8">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />
      {children}
    </div>
  );
}

export function TimelineItem({ month, title, items, variant = 'default' }: TimelineItemProps) {
  const dotColors = {
    default: 'bg-primary border-primary/20',
    current: 'bg-secondary border-secondary/20 ring-4 ring-secondary/20',
    upcoming: 'bg-muted border-border',
  };

  return (
    <div className="relative flex gap-6">
      <div className={cn(
        "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-background",
        dotColors[variant]
      )} />
      <RFDS.SemanticCard variant="outlined" hover className="not-prose flex-1 p-6">
        <div className="mb-2 flex items-center gap-3">
          <RFDS.SemanticBadge variant={variant === 'current' ? 'default' : 'outline'}>
            {month}
          </RFDS.SemanticBadge>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </RFDS.SemanticCard>
    </div>
  );
}

// Feature Card Component
export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export function FeatureGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function FeatureCard({ icon, title, description, highlight = false }: FeatureCardProps) {
  return (
    <RFDS.SemanticCard
      variant={highlight ? "elevated" : "outlined"}
      hover
      className={cn(
        "not-prose p-6 transition-all",
        highlight && "border-primary/50"
      )}
    >
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </RFDS.SemanticCard>
  );
}

// Checklist Component
export interface ChecklistProps {
  items: string[];
  title?: string;
}

export function Checklist({ items, title }: ChecklistProps) {
  return (
    <RFDS.SemanticCard variant="glass" className="not-prose p-6">
      {title && (
        <h4 className="mb-4 font-semibold text-foreground">{title}</h4>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <RFDS.Checkbox
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </RFDS.SemanticCard>
  );
}

// Step Card Component
export interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function StepCard({ number, title, description, children }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <RFDS.SemanticCard variant="elevated" className="not-prose overflow-hidden">
      <div className="flex gap-6 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-primary-foreground">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          {children && (
            <RFDS.SemanticButton
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-sm"
            >
              {isExpanded ? '↑ Show less' : '↓ Learn more'}
            </RFDS.SemanticButton>
          )}
        </div>
      </div>
      {children && (
        <RFDS.AccordionContent isOpen={isExpanded}>
          <div className="border-t border-border bg-muted/30 px-6 py-4">
            <div className="pl-[4.5rem]">{children}</div>
          </div>
        </RFDS.AccordionContent>
      )}
    </RFDS.SemanticCard>
  );
}

// Callout Component
export interface CalloutProps {
  variant?: 'info' | 'success' | 'warning' | 'tip';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const icons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    tip: '💎',
  };

  const variants = {
    info: 'default' as const,
    success: 'success' as const,
    warning: 'warning' as const,
    tip: 'default' as const,
  };

  return (
    <RFDS.SemanticAlert variant={variants[variant]} className="not-prose my-6">
      <div className="flex gap-3">
        <span className="text-2xl shrink-0">{icons[variant]}</span>
        <div className="flex-1">
          {title && <h4 className="mb-2 font-semibold">{title}</h4>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </RFDS.SemanticAlert>
  );
}

// Stat Card Component
export interface StatCardProps {
  value: string;
  label: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function StatCard({ value, label, icon, trend }: StatCardProps) {
  return (
    <RFDS.StatCard
      value={value}
      label={label}
      icon={icon}
      trend={trend}
      variant="outlined"
      className="not-prose"
    />
  );
}

// Format Comparison Component
export interface FormatOption {
  name: string;
  icon: string;
  best: string;
  frequency: string;
  duration: string;
  size: string;
  format: string;
}

export function FormatComparison({ formats }: { formats: FormatOption[] }) {
  return (
    <div className="not-prose grid gap-6 md:grid-cols-2">
      {formats.map((format, i) => (
        <RFDS.SemanticCard key={i} variant="outlined" hover className="not-prose p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{format.icon}</span>
            <h3 className="text-xl font-semibold text-foreground">{format.name}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Best for</dt>
              <dd className="mt-1 text-sm text-foreground">{format.best}</dd>
            </div>
            <RFDS.SemanticSeparator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Frequency</dt>
                <dd className="mt-0.5 font-medium text-foreground">{format.frequency}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="mt-0.5 font-medium text-foreground">{format.duration}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Size</dt>
                <dd className="mt-0.5 font-medium text-foreground">{format.size}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Format</dt>
                <dd className="mt-0.5 font-medium text-foreground">{format.format}</dd>
              </div>
            </div>
          </div>
        </RFDS.SemanticCard>
      ))}
    </div>
  );
}

// Resource Link Component
export interface ResourceLinkProps {
  title: string;
  description: string;
  url: string;
  category: string;
}

export function ResourceGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose space-y-3">
      {children}
    </div>
  );
}

export function ResourceLink({ title, description, url, category }: ResourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <RFDS.SemanticCard variant="outlined" hover className="not-prose p-4 transition-all group-hover:border-primary/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <RFDS.SemanticBadge variant="outline" className="text-xs">
                {category}
              </RFDS.SemanticBadge>
            </div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            →
          </span>
        </div>
      </RFDS.SemanticCard>
    </a>
  );
}

// Hero Section Component
export function GuideHero({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="not-prose relative mb-16 text-center">
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-secondary/10 to-background" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl" />
      </div>

      <RFDS.SemanticBadge variant="outline" className="mb-6">
        Community Organizer Guide
      </RFDS.SemanticBadge>

      <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
        {title}
      </h1>

      <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground leading-relaxed">
        {description}
      </p>

      {children}
    </div>
  );
}

// Section Header Component
export function SectionHeader({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mt-16 mb-6 not-prose">
      <h2 className="mb-2 text-3xl font-bold text-foreground">{title}</h2>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      )}
      <RFDS.SemanticSeparator className="mt-4" />
    </div>
  );
}

// Quote Component
export function Quote({
  children,
  author,
  role
}: {
  children: React.ReactNode;
  author: string;
  role: string;
}) {
  return (
    <RFDS.SemanticCard variant="glass" className="not-prose my-8 border-l-4 border-primary p-6">
      <blockquote className="text-lg italic text-foreground leading-relaxed">
        "{children}"
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <div className="text-right">
          <div className="font-semibold text-foreground">{author}</div>
          <div className="text-sm text-muted-foreground">{role}</div>
        </div>
      </div>
    </RFDS.SemanticCard>
  );
}
