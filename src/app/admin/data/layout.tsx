/**
 * Admin Data Layout
 * Provides tab navigation for data sections
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabType = 'overview' | 'libraries' | 'communities';

interface Tab {
  id: TabType;
  href: string;
  label: string;
  icon: string;
}

export default function DataLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { id: 'overview', href: '/admin/data/overview', label: 'Overview', icon: '📊' },
    { id: 'libraries', href: '/admin/data/libraries', label: 'Libraries', icon: '📚' },
    { id: 'communities', href: '/admin/data/communities', label: 'Communities', icon: '🌐' },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Data Inspection
        </h1>
        <p className="text-muted-foreground">
          Real-time Redis database statistics and contents
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}
