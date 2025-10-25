"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import { Theme, getEffectiveTheme, applyTheme } from '@/lib/theme';
import { createLocalStorageStore } from '@/lib/local-storage-store';
import { useHasMounted } from '@/lib/hooks/use-has-mounted';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'react-foundation-theme',
}: ThemeProviderProps) {
  const themeStore = useMemo(
    () =>
      createLocalStorageStore<Theme>({
        key: storageKey,
        fallback: defaultTheme,
        read: (raw, fallbackValue) =>
          raw === 'light' || raw === 'dark' || raw === 'system' ? raw : fallbackValue,
        write: (value) => value,
      }),
    [defaultTheme, storageKey]
  );

  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );

  const hasMounted = useHasMounted();

  // Apply theme when it changes
  useEffect(() => {
    if (!hasMounted) return;
    applyTheme(theme);
  }, [theme, hasMounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!hasMounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, hasMounted]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      themeStore.set(newTheme);
    },
    [themeStore]
  );

  const effectiveTheme = getEffectiveTheme(theme);

  // Prevent hydration mismatch by not rendering until mounted
  if (!hasMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
