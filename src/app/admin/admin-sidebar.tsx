/**
 * Admin Sidebar - Client Component
 * Collapsible sidebar navigation (icons-only on mobile, full on desktop)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Home', icon: '🏠', exact: true },
    { href: '/admin/data', label: 'Data', icon: '📊' },
    { href: '/admin/ingest-full', label: 'Ingest', icon: '🤖' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/requests', label: 'Requests', icon: '📧' },
    { href: '/admin/reset', label: 'Reset', icon: '⚠️', dangerous: true },
  ];

  return (
    <>
      {/* Sidebar - collapses to icons on mobile */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 border-r border-border bg-background z-40
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-16 lg:w-64'}
        `}
      >
        <div className="p-2 lg:p-6 space-y-4 lg:space-y-6 h-full overflow-y-auto">
          {/* Expand/collapse button (mobile only) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden w-full flex items-center justify-center p-2 hover:bg-muted rounded-lg"
            aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
          >
            {isExpanded ? '«' : '»'}
          </button>

          <div>
            {!isExpanded && (
              <h2 className="lg:hidden mb-4 text-xs font-semibold text-center text-muted-foreground">
                Admin
              </h2>
            )}
            {isExpanded && (
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Admin Panel
              </h2>
            )}

            <nav className="space-y-1 lg:space-y-2">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isExpanded ? item.label : undefined}
                    className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center lg:justify-start lg:gap-3'} rounded-lg px-2 lg:px-4 py-2 lg:py-3 text-sm font-medium transition ${
                      isActive
                        ? item.dangerous
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/20 text-primary'
                        : item.dangerous
                        ? 'text-destructive/60 hover:bg-destructive/5'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="text-xl lg:text-lg">{item.icon}</span>
                    <span className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border pt-4 lg:pt-6">
            <Link
              href="/"
              title="Back to Site"
              className={`flex items-center ${isExpanded ? 'gap-2' : 'justify-center lg:justify-start lg:gap-2'} text-sm text-muted-foreground transition hover:text-foreground`}
            >
              <span>←</span>
              <span className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>Back</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
