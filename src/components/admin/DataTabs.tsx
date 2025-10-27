/**
 * Admin Data Page Tabs
 * Client component for tab navigation
 */

'use client';

import { useState } from 'react';

type TabType = 'overview' | 'libraries' | 'communities';

interface DataTabsProps {
  overviewContent: React.ReactNode;
  librariesContent: React.ReactNode;
  communitiesContent: React.ReactNode;
}

export function DataTabs({ overviewContent, librariesContent, communitiesContent }: DataTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'libraries', label: 'Libraries', icon: '📚' },
    { id: 'communities', label: 'Communities', icon: '🌐' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
