/**
 * Sort Dropdown Component
 * Reusable sorting dropdown from RFDS
 */

'use client';

import { useState } from 'react';

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export function SortDropdown({ options, value, onChange, label }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
        e.preventDefault();
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Reset highlighted index when opening
  const handleOpen = () => {
    const currentIndex = options.findIndex(opt => opt.value === value);
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    setIsOpen(true);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <button
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center justify-between w-full min-w-0 px-4 py-2 bg-card border border-border rounded-lg text-foreground text-sm font-medium hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span>{selectedOption.label}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={option.value || 'empty'}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-3 text-sm transition ${
                index === highlightedIndex
                  ? 'bg-primary/10 text-primary font-medium'
                  : option.value === value
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
