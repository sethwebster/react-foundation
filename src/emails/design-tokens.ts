/**
 * Design Tokens for Emails
 * Extracted from the React Foundation Design System
 * Ensures visual consistency between web and email
 */

import { darkTheme } from '@/lib/theme-config';

// Use dark theme colors for emails (better for most email clients)
export const emailColors = {
  // Base
  background: darkTheme.background,          // #0a0a0a
  foreground: darkTheme.foreground,          // #ededed

  // Surface
  card: '#111111',                           // Slightly lighter than background for contrast
  cardBorder: darkTheme.border,              // #27272a

  // Interactive
  primary: darkTheme.primary,                // #0ea5e9
  primaryForeground: darkTheme.primaryForeground, // #ffffff

  // Status
  success: darkTheme.success,                // #10b981
  successForeground: darkTheme.successForeground, // #ffffff
  destructive: darkTheme.destructive,        // #ef4444
  destructiveForeground: darkTheme.destructiveForeground, // #ffffff
  warning: darkTheme.warning,                // #f59e0b
  warningForeground: darkTheme.warningForeground, // #ffffff

  // Muted
  muted: darkTheme.muted,                    // #1a1a1a
  mutedForeground: darkTheme.mutedForeground, // #a1a1aa

  // Accent
  accent: '#a855f7',                         // Purple for special highlights

  // Gradients
  brandGradient: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)',
};

export const emailSpacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
};

export const emailTypography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',

  // Font sizes
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',

  // Line heights
  lineHeightTight: '1.3',
  lineHeightNormal: '1.5',
  lineHeightRelaxed: '1.6',

  // Font weights
  weightNormal: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
};

export const emailBorders = {
  radius: '8px',
  radiusLg: '12px',
  radiusXl: '16px',
  radiusFull: '9999px',
  width: '1px',
};
