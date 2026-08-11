// Ported from stories/Table.stories.tsx — same fixture data and column shapes,
// so the card shows the composition the DS authors themselves demonstrate.
import { Table } from 'storefront';

interface Contributor {
  id: string;
  name: string;
  library: string;
  merged: number;
  role: string;
}

const contributors: Contributor[] = [
  { id: '1', name: 'Dan Abramov', library: 'React', merged: 412, role: 'Core' },
  { id: '2', name: 'Tanner Linsley', library: 'TanStack Query', merged: 168, role: 'Maintainer' },
  { id: '3', name: 'Mark Erikson', library: 'Redux', merged: 254, role: 'Maintainer' },
  { id: '4', name: 'Rachel Nabors', library: 'React Docs', merged: 96, role: 'Contributor' },
  { id: '5', name: 'Sophie Alpert', library: 'React', merged: 331, role: 'Core' },
];

const columns = [
  { key: 'name', label: 'Contributor', sortable: true },
  { key: 'library', label: 'Library', sortable: true },
  { key: 'merged', label: 'Merged PRs', sortable: true, align: 'right' as const },
  { key: 'role', label: 'Role', sortable: true },
];

export const Basic = () => <Table data={contributors} columns={columns} />;

export const Searchable = () => (
  <Table data={contributors} columns={columns} searchable searchPlaceholder="Search contributors…" />
);

export const Sorted = () => (
  <Table data={contributors} columns={columns} defaultSortKey="merged" defaultSortDirection="desc" hoverable />
);

export const Loading = () => <Table data={[]} columns={columns} loading />;

export const Empty = () => (
  <Table data={[]} columns={columns} showEmptyState emptyStateMessage="No contributors match this filter yet." />
);
