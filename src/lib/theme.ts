/**
 * Theme configuration and utilities for the React Foundation Store
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  light: {
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    popover: string;
    popoverForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    ring: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
  };
  dark: {
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    popover: string;
    popoverForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    ring: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
  };
}

export const themeConfig: ThemeConfig = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',        // slate-900 - dark for readability
    muted: '#f1f5f9',
    mutedForeground: '#475569',   // slate-600 - darker for better contrast
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    border: '#e2e8f0',
    input: '#e2e8f0',
    primary: '#0ea5e9',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    ring: '#0ea5e9',
    chart1: '#0ea5e9',
    chart2: '#8b5cf6',
    chart3: '#10b981',
    chart4: '#f59e0b',
    chart5: '#ef4444',
  },
  dark: {
    background: '#0f172a',  // slate-900 to match react.foundation
    foreground: '#f8fafc',  // slate-50 for better contrast
    muted: '#1e293b',       // slate-800
    mutedForeground: '#94a3b8',  // slate-400
    popover: '#1e293b',     // slate-800
    popoverForeground: '#f8fafc',
    card: '#1e293b',        // slate-800
    cardForeground: '#f8fafc',
    border: '#334155',      // slate-700 - subtle but visible when needed
    input: '#334155',
    primary: '#0ea5e9',     // sky-500
    primaryForeground: '#ffffff',
    secondary: '#334155',   // slate-700
    secondaryForeground: '#f8fafc',
    accent: '#334155',      // slate-700
    accentForeground: '#f8fafc',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    ring: '#0ea5e9',
    chart1: '#0ea5e9',
    chart2: '#8b5cf6',
    chart3: '#10b981',
    chart4: '#f59e0b',
    chart5: '#ef4444',
  },
};

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') {
      // Default to light during SSR
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') {
    return; // Skip during SSR
  }

  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;

  // Set data attribute for reference
  root.setAttribute('data-theme', effectiveTheme);

  // Toggle dark class - CSS handles all color changes
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const bgColor = effectiveTheme === 'dark' ? '#0f172a' : '#ffffff';
    metaThemeColor.setAttribute('content', bgColor);
  }
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const stored = localStorage.getItem('react-foundation-theme');
    return (stored as Theme) || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Store theme in localStorage
 */
export function storeTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('react-foundation-theme', theme);
  } catch {
    // Ignore localStorage errors
  }
}
