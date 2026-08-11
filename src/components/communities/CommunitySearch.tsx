'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CommunitySearch() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  return <CommunitySearchInput key={search} initialValue={search} />;
}

function CommunitySearchInput({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set('search', newValue);
      } else {
        params.delete('search');
      }
      router.push(
        params.toString() ? `/communities?${params.toString()}` : '/communities',
        { scroll: false }
      );
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search by city, country, or community name..."
        aria-label="Search communities"
        className={cn(
          'h-14 w-full rounded-card border border-border bg-card pl-12 pr-4 text-base',
          'text-foreground placeholder:text-muted-foreground shadow-card',
          'transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
        )}
      />
    </div>
  );
}
