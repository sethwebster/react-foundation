/**
 * Theme configuration and utilities for the React Foundation Store
 */

export type Theme = 'light' | 'dark' | 'system';

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
    const bgColor = effectiveTheme === 'dark' ? '#16181d' : '#ffffff';
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
