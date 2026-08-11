/**
 * Static theme values for non-CSS renderers.
 * 
 * The website's canonical theme contract lives in src/app/globals.css. Email
 * rendering cannot resolve CSS custom properties, so it imports these matching
 * literal values.
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

  // Icon gradients for contributor cards
  gradientIconCode: string;
  gradientIconDonate: string;
  gradientIconSponsor: string;
  gradientIconMember: string;

  // Shadows
  shadow: string;
  shadowColored: string;
  shadowElevated: string;
  shadowGlow: string;
}

export const lightTheme: ThemeColors = {
  // Base colors
  background: '#ffffff',
  foreground: '#23272f',
  
  // Surface colors
  card: '#ffffff',
  cardForeground: '#23272f',
  popover: '#ffffff',
  popoverForeground: '#23272f',
  
  // Interactive colors
  primary: '#087ea4',
  primaryForeground: '#ffffff',
  secondary: '#f1f3f5',
  secondaryForeground: '#23272f',
  accent: '#e0f7fb',
  accentForeground: '#066985',
  
  // Muted colors
  muted: '#f5f6f7',
  mutedForeground: '#525866',
  
  // Border and input
  border: '#dfe2e6',
  input: '#dfe2e6',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  
  // Special colors
  ring: '#087ea4',
  
  // Chart colors
  chart1: '#087ea4',
  chart2: '#8b5cf6',
  chart3: '#10b981',
  chart4: '#f59e0b',
  chart5: '#ef4444',
  
  // Brand colors
  ratingsGold: '#f6c65b',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #087ea4 0%, #58c4dc 100%)',
  gradientSecondary: 'linear-gradient(135deg, #f5f6f7 0%, #dfe2e6 100%)',
  gradientAccent: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',

  // Icon gradients for contributor cards
  gradientIconCode: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)',
  gradientIconDonate: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
  gradientIconSponsor: 'linear-gradient(135deg, #fde047 0%, #f97316 100%)',
  gradientIconMember: 'linear-gradient(135deg, #fb923c 0%, #ef4444 100%)',

  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowColored: '0 4px 6px -1px rgb(8 126 164 / 0.1), 0 2px 4px -2px rgb(8 126 164 / 0.1)',
  shadowElevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  shadowGlow: '0 0 20px rgb(8 126 164 / 0.15), 0 0 40px rgb(8 126 164 / 0.1)',
};

export const darkTheme: ThemeColors = {
  // Base colors
  background: '#16181d',
  foreground: '#f5f6f7',
  
  // Surface colors
  card: '#20232a',
  cardForeground: '#f5f6f7',
  popover: '#20232a',
  popoverForeground: '#f5f6f7',
  
  // Interactive colors
  primary: '#58c4dc',
  primaryForeground: '#16181d',
  secondary: '#282c34',
  secondaryForeground: '#f5f6f7',
  accent: '#1b4653',
  accentForeground: '#a9e8f4',
  
  // Muted colors
  muted: '#282c34',
  mutedForeground: '#b6bdc7',
  
  // Border and input
  border: '#383d46',
  input: '#383d46',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  
  // Special colors
  ring: '#58c4dc',
  
  // Chart colors
  chart1: '#58c4dc',
  chart2: '#8b5cf6',
  chart3: '#10b981',
  chart4: '#f59e0b',
  chart5: '#ef4444',
  
  // Brand colors
  ratingsGold: '#f6c65b',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #58c4dc 0%, #087ea4 100%)',
  gradientSecondary: 'linear-gradient(135deg, #20232a 0%, #383d46 100%)',
  gradientAccent: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',

  // Icon gradients for contributor cards (brighter for dark mode)
  gradientIconCode: 'linear-gradient(135deg, #34d399 0%, #22d3ee 100%)',
  gradientIconDonate: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
  gradientIconSponsor: 'linear-gradient(135deg, #fde047 0%, #fb923c 100%)',
  gradientIconMember: 'linear-gradient(135deg, #fb923c 0%, #f87171 100%)',

  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  shadowColored: '0 4px 6px -1px rgb(88 196 220 / 0.2), 0 2px 4px -2px rgb(88 196 220 / 0.2)',
  shadowElevated: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
  shadowGlow: '0 0 20px rgb(88 196 220 / 0.25), 0 0 40px rgb(88 196 220 / 0.15)',
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
