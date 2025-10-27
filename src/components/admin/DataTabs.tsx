/**
 * Admin Data Page Tabs
 * Client component for tab navigation with URL state
 */

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type TabType = 'overview' | 'libraries' | 'communities';

interface DataTabsProps {
  overviewContent: React.ReactNode;
  librariesContent: React.ReactNode;
  communitiesContent: React.ReactNode;
}

export function DataTabs({ overviewContent, librariesContent, communitiesContent }: DataTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = (searchParams.get('tab') as TabType) || 'overview';

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'libraries', label: 'Libraries', icon: '📚' },
    { id: 'communities', label: 'Communities', icon: '🌐' },
  ];

  const handleTabChange = (tabId: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'overview') {
      params.delete('tab'); // Remove tab param for default
    } else {
      params.set('tab', tabId);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && overviewContent}
        {activeTab === 'libraries' && librariesContent}
        {activeTab === 'communities' && communitiesContent}
      </div>
    </div>
  );
}
