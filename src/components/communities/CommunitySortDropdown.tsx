/**
 * Community Sort Dropdown
 * Dropdown for sorting communities list
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SortDropdown } from '@/components/ui/sort-dropdown';

const SORT_OPTIONS = [
  { value: 'members', label: '👥 Most Members' },
  { value: 'activity', label: '🔥 Most Active' },
  { value: 'cois', label: '🏆 Highest CoIS' },
  { value: 'name', label: '🔤 Name (A-Z)' },
  { value: 'recent', label: '📅 Recently Active' },
];

export function CommunitySortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'members';

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === 'members') {
      params.delete('sort'); // Default, don't clutter URL
    } else {
      params.set('sort', newSort);
    }

    const queryString = params.toString();
    router.push(queryString ? `/communities?${queryString}` : '/communities', { scroll: false });
  };

  return <SortDropdown options={SORT_OPTIONS} value={currentSort} onChange={handleSortChange} />;
}
