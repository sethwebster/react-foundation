/**
 * SearchInput Component
 * Input with search icon, optimized for search functionality
 */

import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export interface SearchInputProps extends InputProps {
  /** Placeholder text */
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Search...', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={cn('pl-9', className)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
