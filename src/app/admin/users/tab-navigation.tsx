/**
 * Tab Navigation Component
 * Client component for tab navigation with active state
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TabNavigation({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  const isUsersTab = pathname === '/admin/users';
  const isRequestsTab = pathname?.startsWith('/admin/users/requests');

  return (
    <div className="border-b border-border">
      <nav className="flex gap-1" aria-label="Tabs">
        <Link
          href="/admin/users"
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
            isUsersTab
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          Users
        </Link>
        <Link
          href="/admin/users/requests"
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            isRequestsTab
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          Requests
          {pendingCount > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
              isRequestsTab
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {pendingCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}
