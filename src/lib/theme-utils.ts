/**
 * Theme Utilities
 * 
 * Provides semantic color classes and utilities to replace hardcoded colors
 * throughout the application. This ensures all colors are themeable.
 */

import { cn } from '@/lib/cn';

/**
 * Semantic color classes that replace hardcoded Tailwind colors
 */
export const themeColors = {
  // Background colors
  bg: 'bg-background',
  bgCard: 'bg-card',
  bgMuted: 'bg-muted',
  bgPrimary: 'bg-primary',
  bgSecondary: 'bg-secondary',
  bgAccent: 'bg-accent',
  bgDestructive: 'bg-destructive',
  bgSuccess: 'bg-success',
  bgWarning: 'bg-warning',
  
  // Text colors
  text: 'text-foreground',
  textMuted: 'text-muted-foreground',
  textPrimary: 'text-primary',
  textSecondary: 'text-secondary-foreground',
  textAccent: 'text-accent-foreground',
  textDestructive: 'text-destructive-foreground',
  textSuccess: 'text-success-foreground',
  textWarning: 'text-warning-foreground',
  
  // Border colors
  border: 'border-border',
  borderPrimary: 'border-primary',
  borderSecondary: 'border-secondary',
  borderAccent: 'border-accent',
  borderDestructive: 'border-destructive',
  borderSuccess: 'border-success',
  borderWarning: 'border-warning',
  
  // Ring colors
  ring: 'ring-ring',
  ringPrimary: 'ring-primary',
  ringSecondary: 'ring-secondary',
  ringAccent: 'ring-accent',
  ringDestructive: 'ring-destructive',
  ringSuccess: 'ring-success',
  ringWarning: 'ring-warning',
  
  // Shadow colors
  shadow: 'shadow-lg',
  shadowColored: 'shadow-lg shadow-primary/20',
  shadowDestructive: 'shadow-lg shadow-destructive/20',
  shadowSuccess: 'shadow-lg shadow-success/20',
  shadowWarning: 'shadow-lg shadow-warning/20',
} as const;

/**
 * Semantic gradient classes
 */
export const themeGradients = {
  primary: 'bg-gradient-to-br from-primary to-primary/80',
  secondary: 'bg-gradient-to-br from-secondary to-secondary/80',
  accent: 'bg-gradient-to-br from-accent to-accent/80',
  muted: 'bg-gradient-to-br from-muted to-muted/80',
  destructive: 'bg-gradient-to-br from-destructive to-destructive/80',
  success: 'bg-gradient-to-br from-success to-success/80',
  warning: 'bg-gradient-to-br from-warning to-warning/80',
} as const;

/**
 * Semantic button variants that replace hardcoded colors
 */
export const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  outline: 'border border-border bg-background text-foreground hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

/**
 * Semantic input variants
 */
export const inputVariants = {
  default: 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary',
  error: 'border-destructive bg-background text-foreground placeholder:text-muted-foreground focus:border-destructive focus:ring-destructive',
  success: 'border-success bg-background text-foreground placeholder:text-muted-foreground focus:border-success focus:ring-success',
} as const;

/**
 * Semantic status colors
 */
export const statusColors = {
  info: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    icon: 'text-primary',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    icon: 'text-warning',
  },
  error: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    icon: 'text-destructive',
  },
} as const;

/**
 * Utility function to combine theme colors with additional classes
 */
export function themeClass(baseClass: string, additionalClasses?: string) {
  return cn(baseClass, additionalClasses);
}

/**
 * Common semantic class combinations
 */
export const semanticClasses = {
  // Cards
  card: 'bg-card text-card-foreground border border-border rounded-lg shadow',
  cardHover: 'bg-card text-card-foreground border border-border rounded-lg shadow hover:shadow-md transition-shadow',
  
  // Buttons
  buttonPrimary: themeClass(buttonVariants.default, 'px-4 py-2 rounded-md font-medium transition-colors'),
  buttonSecondary: themeClass(buttonVariants.secondary, 'px-4 py-2 rounded-md font-medium transition-colors'),
  buttonGhost: themeClass(buttonVariants.ghost, 'px-4 py-2 rounded-md font-medium transition-colors'),
  
  // Inputs
  input: themeClass(inputVariants.default, 'px-3 py-2 rounded-md border transition-colors'),
  inputError: themeClass(inputVariants.error, 'px-3 py-2 rounded-md border transition-colors'),
  
  // Status indicators
  statusInfo: themeClass("px-3 py-2 rounded-md border", statusColors.info.bg),
  statusSuccess: themeClass("px-3 py-2 rounded-md border", statusColors.success.bg),
  statusWarning: themeClass("px-3 py-2 rounded-md border", statusColors.warning.bg),
  statusError: themeClass("px-3 py-2 rounded-md border", statusColors.error.bg),
} as const;

