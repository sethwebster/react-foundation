/**
 * Communities Table Component - Client Component
 * Displays communities in a table format with search and sorting
 * Uses RFDS Table component for consistent styling
 */

'use client';

import { RFDS, type TableColumn } from '@/components/rfds';
import type { Community } from '@/types/community';

export interface CommunitiesTableProps {
  communities: Community[];
}

export function CommunitiesTable({ communities }: CommunitiesTableProps) {
  const columns: TableColumn<Community>[] = [
    {
      key: 'name',
      label: 'Community',
      sortable: true,
      render: (_value: unknown, community: Community) => (
        <div>
          <div className="font-semibold text-foreground">{community.name}</div>
          {community.city && (
            <div className="text-sm text-muted-foreground">
              {community.city}, {community.country}
            </div>
          )}
        </div>
      ),
      accessor: (community: Community) =>
        `${community.name} ${community.city || ''} ${community.country}`.toLowerCase(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value: unknown, community: Community) => {
        const statusConfig = {
          active: { variant: 'success' as const, label: 'Active' },
          paused: { variant: 'warning' as const, label: 'Paused' },
          inactive: { variant: 'outline' as const, label: 'Inactive' },
          new: { variant: 'default' as const, label: 'New' },
        };
        const config = statusConfig[community.status] || statusConfig.inactive;
        return (
          <RFDS.SemanticBadge variant={config.variant}>
            {config.label}
          </RFDS.SemanticBadge>
        );
      },
      accessor: (community: Community) => community.status,
    },
    {
      key: 'member_count',
      label: 'Members',
      sortable: true,
      align: 'right',
      render: (_value: unknown, community: Community) => {
        if (!community.member_count) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        return (
          <span className="font-medium text-foreground">
            {community.member_count.toLocaleString()}
          </span>
        );
      },
      accessor: (community: Community) => community.member_count || 0,
    },
    {
      key: 'cois_tier',
      label: 'CoIS Tier',
      sortable: true,
      render: (_value: unknown, community: Community) => {
        if (!community.cois_tier || community.cois_tier === 'none') {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        const tierColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
          platinum: 'destructive',
          gold: 'warning',
          silver: 'success',
          bronze: 'default',
        };
        return (
          <RFDS.SemanticBadge variant={tierColors[community.cois_tier] || 'default'}>
            {community.cois_tier.charAt(0).toUpperCase() + community.cois_tier.slice(1)}
          </RFDS.SemanticBadge>
        );
      },
      accessor: (community: Community) => {
        if (!community.cois_tier || community.cois_tier === 'none') return '';
        return community.cois_tier;
      },
    },
    {
      key: 'verified',
      label: 'Verified',
      sortable: true,
      align: 'center',
      render: (_value: unknown, community: Community) => {
        return community.verified ? (
          <RFDS.SemanticBadge variant="success">✓ Verified</RFDS.SemanticBadge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
      accessor: (community: Community) => (community.verified ? 'verified' : 'unverified'),
    },
  ];

  return (
    <RFDS.Table
      data={communities}
      columns={columns}
      searchable
      searchPlaceholder="Search communities by name, city, or country..."
      defaultSortKey="name"
      defaultSortDirection="asc"
      getRowKey={(community) => community.id}
    />
  );
}

