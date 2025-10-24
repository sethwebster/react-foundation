/**
 * Country Select Component
 * Dropdown with search/typeahead for selecting countries
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { WORLD_COUNTRIES } from '@/data/countries';

const COUNTRIES = WORLD_COUNTRIES;

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  required,
  placeholder = 'Select country...',
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  // Filter countries by search
  const filteredCountries = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      {/* Selected Value / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground text-sm hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selectedCountry ? '' : 'text-muted-foreground'}>
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-3 py-2 bg-muted border-0 rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition flex items-center gap-3 ${
                    country.name === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
