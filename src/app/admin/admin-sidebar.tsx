/**
 * Admin Sidebar - Client Component
 * Interactive sidebar navigation with mobile support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
        aria-label="Toggle admin menu"
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-64 border-r border-border/10 bg-background z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 sm:p-6 space-y-6 h-full overflow-y-auto">
          <div>
            <h2 className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Panel
            </h2>
            <nav className="space-y-1 sm:space-y-2">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition ${
                      isActive
                        ? item.dangerous
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/20 text-primary'
                        : item.dangerous
                        ? 'text-destructive/60 hover:bg-destructive/5'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border pt-4 sm:pt-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground transition hover:text-foreground"
            >
              <span>←</span>
              <span>Back to Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
