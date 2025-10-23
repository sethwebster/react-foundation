"use client";

import React from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Icons in linear order: Light, Dark, System
  const lightIcon = (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const darkIcon = (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const systemIcon = (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Get the position offset: light(0px), dark(-40px), system(-80px)
  const getOffset = () => {
    if (theme === 'light') return '0px';
    if (theme === 'dark') return '-40px';
    return '-80px';  // system
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    if (effectiveTheme === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted hover:border-primary/20 hover:shadow-sm"
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      aria-label={`Toggle theme (currently ${getLabel()})`}
    >
      {/* Tumbler window - shows only one icon at a time */}
      <div className="relative h-10 w-10 overflow-hidden">
        {/* Horizontal scroll container with 3 icons */}
        <div
          className="flex will-change-transform"
          style={{
            transform: `translateX(${getOffset()})`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center -translate-x-px">
            {lightIcon}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center -translate-x-px">
            {darkIcon}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center -translate-x-px">
            {systemIcon}
          </div>
        </div>
      </div>
      
      {/* Tumbler indicator dots */}
      <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
        <div className={`h-1 w-1 rounded-full transition-colors duration-200 ${
          theme === 'light' ? 'bg-primary' : 'bg-muted-foreground/30'
        }`} />
        <div className={`h-1 w-1 rounded-full transition-colors duration-200 ${
          theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'
        }`} />
        <div className={`h-1 w-1 rounded-full transition-colors duration-200 ${
          theme === 'system' ? 'bg-primary' : 'bg-muted-foreground/30'
        }`} />
      </div>
    </button>
  );
}

export function ThemeToggleWithLabel() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (effectiveTheme === 'dark') {
      return (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }

    return (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    if (effectiveTheme === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {getIcon()}
      <span className="text-sm">{getLabel()}</span>
    </Button>
  );
}
