/**
 * Comprehensive Theme Configuration
 * 
 * This file defines all semantic colors and design tokens for the React Foundation Store.
 * All hardcoded colors should be replaced with these semantic tokens.
 */

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Surface colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Interactive colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Border and input
  border: string;
  input: string;
  
  // Status colors
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  
  // Special colors
  ring: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Brand colors
  ratingsGold: string;
  
  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
  gradientAccent: string;
  
  // Shadows
  shadow: string;
  shadowColored: string;
}

export const lightTheme: ThemeColors = {
  // Base colors
  background: '#ffffff',
  foreground: '#0f172a',
  
  // Surface colors
  card: '#ffffff',
  cardForeground: '#0f172a',
  popover: '#ffffff',
  popoverForeground: '#0f172a',
  
  // Interactive colors
  primary: '#0ea5e9',
  primaryForeground: '#ffffff',
  secondary: '#f1f5f9',
  secondaryForeground: '#0f172a',
  accent: '#f1f5f9',
  accentForeground: '#0f172a',
  
  // Muted colors
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  
  // Border and input
  border: '#e2e8f0',
  input: '#e2e8f0',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  
  // Special colors
  ring: '#0ea5e9',
  
  // Chart colors
  chart1: '#0ea5e9',
  chart2: '#8b5cf6',
  chart3: '#10b981',
  chart4: '#f59e0b',
  chart5: '#ef4444',
  
  // Brand colors
  ratingsGold: '#f6c65b',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  gradientSecondary: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  gradientAccent: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  
  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowColored: '0 4px 6px -1px rgb(14 165 233 / 0.1), 0 2px 4px -2px rgb(14 165 233 / 0.1)',
};

export const darkTheme: ThemeColors = {
  // Base colors
  background: '#0a0a0a',
  foreground: '#ededed',
  
  // Surface colors
  card: '#0a0a0a',
  cardForeground: '#ededed',
  popover: '#0a0a0a',
  popoverForeground: '#ededed',
  
  // Interactive colors
  primary: '#0ea5e9',
  primaryForeground: '#ffffff',
  secondary: '#1a1a1a',
  secondaryForeground: '#ededed',
  accent: '#1a1a1a',
  accentForeground: '#ededed',
  
  // Muted colors
  muted: '#1a1a1a',
  mutedForeground: '#a1a1aa',
  
  // Border and input
  border: '#27272a',
  input: '#27272a',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  
  // Special colors
  ring: '#0ea5e9',
  
  // Chart colors
  chart1: '#0ea5e9',
  chart2: '#8b5cf6',
  chart3: '#10b981',
  chart4: '#f59e0b',
  chart5: '#ef4444',
  
  // Brand colors
  ratingsGold: '#f6c65b',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  gradientSecondary: 'linear-gradient(135deg, #1a1a1a 0%, #27272a 100%)',
  gradientAccent: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  
  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  shadowColored: '0 4px 6px -1px rgb(14 165 233 / 0.2), 0 2px 4px -2px rgb(14 165 233 / 0.2)',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Get theme colors for a specific theme
 */
export function getThemeColors(theme: 'light' | 'dark'): ThemeColors {
  return themes[theme];
}

/**
 * Apply theme colors to the document
 */
export function applyThemeColors(colors: ThemeColors) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply all color properties
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

