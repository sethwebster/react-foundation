/**
 * Admin Sidebar - Client Component
 * Interactive sidebar navigation for admin section
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/requests', label: 'Access Requests', icon: '📧' },
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 border-r border-white/10 bg-slate-950/95 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
            Admin Panel
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <span>←</span>
            <span>Back to Site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
