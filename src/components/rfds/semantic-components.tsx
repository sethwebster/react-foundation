/**
 * React Foundation Design System - Semantic Components
 *
 * Pre-built semantic components that use the theming system
 * These replace hardcoded colors with semantic, themeable alternatives
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

// Semantic Button Variants
export interface SemanticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

export function SemanticButton({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: SemanticButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-success text-success-foreground hover:bg-success/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
    ghost: "text-foreground hover:bg-muted",
    link: "text-primary underline-offset-4 hover:underline",
  };
  
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Semantic Card Component
export interface SemanticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  hover?: boolean;
}

export function SemanticCard({ 
  variant = 'default', 
  hover = false, 
  className, 
  children, 
  ...props 
}: SemanticCardProps) {
  const baseClasses = "rounded-lg transition-colors";
  
  const variantClasses = {
    default: "bg-card text-card-foreground",
    outlined: "bg-card text-card-foreground border border-border",
    elevated: "bg-card text-card-foreground shadow-md",
    glass: "bg-card/80 text-card-foreground backdrop-blur border border-border/20",
  };
  
  const hoverClasses = hover ? "hover:shadow-md hover:shadow-primary/10" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Semantic Badge Component
export interface SemanticBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
}

export function SemanticBadge({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: SemanticBadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    outline: "border border-border text-foreground",
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Semantic Input Component
export interface SemanticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  errorText?: string;
}

export function SemanticInput({ 
  variant = 'default', 
  label, 
  helperText, 
  errorText, 
  className, 
  ...props 
}: SemanticInputProps) {
  const baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  
  const variantClasses = {
    default: "border-input bg-background text-foreground",
    error: "border-destructive bg-background text-foreground focus-visible:ring-destructive",
    success: "border-success bg-background text-foreground focus-visible:ring-success",
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      />
      {errorText && (
        <p className="text-sm text-destructive">{errorText}</p>
      )}
      {helperText && !errorText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Semantic Alert Component
export interface SemanticAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
}

export function SemanticAlert({ 
  variant = 'default', 
  title, 
  className, 
  children, 
  ...props 
}: SemanticAlertProps) {
  const baseClasses = "relative w-full rounded-lg border p-4";
  
  const variantClasses = {
    default: "bg-background text-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    success: "bg-success/5 text-foreground border-success/10",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {title && (
        <h4 className="mb-1 font-medium leading-none tracking-tight">
          {title}
        </h4>
      )}
      <div className="text-sm [&_p]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// Semantic Avatar Component
export interface SemanticAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SemanticAvatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  className, 
  ...props 
}: SemanticAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || 'Avatar'}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback}
        </div>
      )}
    </div>
  );
}

// Semantic Separator Component
export interface SemanticSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function SemanticSeparator({
  orientation = 'horizontal',
  className,
  ...props
}: SemanticSeparatorProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === 'horizontal' ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
}

// Contributor Icon Component
export interface ContributorIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'code' | 'donate' | 'sponsor' | 'member';
  children: React.ReactNode;
}

export function ContributorIcon({
  variant,
  children,
  className,
  ...props
}: ContributorIconProps) {
  const gradientClasses = {
    code: '[background-image:var(--gradient-icon-code)]',
    donate: '[background-image:var(--gradient-icon-donate)]',
    sponsor: '[background-image:var(--gradient-icon-sponsor)]',
    member: '[background-image:var(--gradient-icon-member)]',
  };

  const glowClasses = {
    code: 'group-hover:[box-shadow:0_0_20px_rgba(52,211,153,0.3),0_0_40px_rgba(6,182,212,0.2)]',
    donate: 'group-hover:[box-shadow:0_0_20px_rgba(56,189,248,0.3),0_0_40px_rgba(99,102,241,0.2)]',
    sponsor: 'group-hover:[box-shadow:0_0_20px_rgba(253,224,71,0.3),0_0_40px_rgba(249,115,22,0.2)]',
    member: 'group-hover:[box-shadow:0_0_20px_rgba(251,146,60,0.3),0_0_40px_rgba(239,68,68,0.2)]',
  };

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
        "will-change-transform",
        "transition-[transform,box-shadow] duration-150 ease-in-out",
        "motion-reduce:transition-none",
        "group-hover:scale-110 group-hover:rotate-3",
        gradientClasses[variant],
        glowClasses[variant],
        className
      )}
      {...props}
    >
      <div className="text-foreground [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.1))]">
        {children}
      </div>
    </div>
  );
}

// Contributor Card Component
export interface ContributorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: React.ReactNode;
}

export function ContributorCard({
  icon,
  title,
  description,
  actions,
  className,
  ...props
}: ContributorCardProps) {
  return (
    <div
      className={cn(
        "group space-y-6 rounded-2xl",
        "border border-border/10 bg-muted",
        "p-8",
        "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.06))_drop-shadow(0_1px_2px_rgba(0,0,0,0.04))]",
        "dark:[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.2))_drop-shadow(0_1px_2px_rgba(0,0,0,0.15))]",
        "transition-[filter,background-color,border-color] duration-200 ease-out",
        "motion-reduce:transition-none",
        "hover:border-border/20 hover:bg-muted/95",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {actions}
      </div>
    </div>
  );
}
