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
    foreground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
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
    background: '#0a0a0a',
    foreground: '#ededed',
    muted: '#1a1a1a',
    mutedForeground: '#a1a1aa',
    popover: '#0a0a0a',
    popoverForeground: '#ededed',
    card: '#0a0a0a',
    cardForeground: '#ededed',
    border: '#27272a',
    input: '#27272a',
    primary: '#0ea5e9',
    primaryForeground: '#ffffff',
    secondary: '#1a1a1a',
    secondaryForeground: '#ededed',
    accent: '#1a1a1a',
    accentForeground: '#ededed',
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
  const colors = themeConfig[effectiveTheme];
  
  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Set data attribute for Tailwind dark mode
  root.setAttribute('data-theme', effectiveTheme);
  
  // Also add/remove dark class for Tailwind compatibility
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', colors.background);
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
