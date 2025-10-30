/**
 * RFDS Table Component
 * 
 * A fully-featured, reusable table component with:
 * - Generic type support for any data structure
 * - Search/filter functionality
 * - Column sorting (ascending/descending)
 * - Computed columns (derived from data)
 * - Semantic theming using RFDS design system
 * 
 * @example
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 * 
 * <RFDS.Table
 *   data={users}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email', sortable: true },
 *     { 
 *       key: 'fullInfo', 
 *       label: 'Full Info',
 *       computed: (user) => `${user.name} (${user.email})`
 *     }
 *   ]}
 *   searchable
 *   searchPlaceholder="Search users..."
 * />
 * ```
 */

'use client';

import { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { SemanticInput } from './semantic-components';
import { cn } from '@/lib/cn';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => ReactNode;
  /** Computed column - derives value from row data */
  computed?: (row: T) => any;
  /** Accessor function to get value from row (if not using key) */
  accessor?: (row: T) => any;
  /** Alignment of column content */
  align?: 'left' | 'center' | 'right';
  /** CSS class name for the column header */
  headerClassName?: string;
  /** CSS class name for the column cells */
  cellClassName?: string;
  /** Minimum width for the column */
  minWidth?: string;
}

export interface TableProps<T> {
  /** Array of data objects to display */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Enable search functionality */
  searchable?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Custom search function - receives row and search query */
  searchFn?: (row: T, query: string) => boolean;
  /** Initial sort column key */
  defaultSortKey?: string;
  /** Initial sort direction */
  defaultSortDirection?: SortDirection;
  /** Show empty state when no data */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Custom empty state component */
  emptyState?: ReactNode;
  /** Additional CSS classes for the table wrapper */
  className?: string;
  /** Additional CSS classes for the table element */
  tableClassName?: string;
  /** Show row hover effects */
  hoverable?: boolean;
  /** Custom row key function (defaults to using index) */
  getRowKey?: (row: T, index: number) => string | number;
  /** Custom filter function applied before search */
  filterFn?: (row: T) => boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading skeleton component */
  loadingSkeleton?: ReactNode;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchFn,
  defaultSortKey,
  defaultSortDirection = null,
  showEmptyState = true,
  emptyStateMessage = 'No data available',
  emptyState,
  className,
  tableClassName,
  hoverable = true,
  getRowKey,
  filterFn,
  loading = false,
  loadingSkeleton,
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // Get the column definition for a given key
  const getColumn = (key: string): TableColumn<T> | undefined => {
    return columns.find(col => col.key === key);
  };

  // Get the value for a cell
  const getCellValue = (row: T, column: TableColumn<T>): any => {
    if (column.computed) {
      return column.computed(row);
    }
    if (column.accessor) {
      return column.accessor(row);
    }
    return row[column.key];
  };

  // Get the value to sort by for a column
  const getSortValue = (row: T, column: TableColumn<T>): any => {
    const value = getCellValue(row, column);
    // Convert to comparable types
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  };

  // Default search function
  const defaultSearchFn = (row: T, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return columns.some(column => {
      const value = getCellValue(row, column);
      if (value === null || value === undefined) {
        return false;
      }
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(lowerQuery);
    });
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply custom filter first
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Apply search filter
    if (searchable && searchQuery.trim()) {
      const search = searchFn || defaultSearchFn;
      result = result.filter(row => search(row, searchQuery));
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      const column = getColumn(sortKey);
      if (column && column.sortable !== false) {
        result = [...result].sort((a, b) => {
          const aVal = getSortValue(a, column);
          const bVal = getSortValue(b, column);

          if (aVal === bVal) return 0;

          const comparison = aVal < bVal ? -1 : 1;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, searchQuery, sortKey, sortDirection, searchable, searchFn, filterFn, columns]);

  // Handle column header click for sorting
  const handleSort = (columnKey: string) => {
    const column = getColumn(columnKey);
    if (!column || column.sortable === false) {
      return;
    }

    if (sortKey === columnKey) {
      // Toggle direction: null -> asc -> desc -> null
      if (sortDirection === null) {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey || sortDirection === null) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-primary" />;
    }
    return <ChevronDown className="w-4 h-4 text-primary" />;
  };

  // Get row key
  const getKey = (row: T, index: number): string | number => {
    if (getRowKey) {
      return getRowKey(row, index);
    }
    // Try to find an id field
    if ('id' in row && typeof row.id === 'string' || typeof row.id === 'number') {
      return row.id;
    }
    return index;
  };

  if (loading) {
    return loadingSkeleton || <TableSkeleton columns={columns} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <SemanticInput
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className={cn('w-full border-collapse', tableClassName)}>
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((column) => {
                const isSortable = column.sortable !== false;
                const isSorted = sortKey === column.key && sortDirection !== null;
                const align = column.align || 'left';

                return (
                  <th
                    key={column.key}
                    className={cn(
                      'py-3 px-4 text-sm font-semibold text-muted-foreground',
                      align === 'left' && 'text-left',
                      align === 'center' && 'text-center',
                      align === 'right' && 'text-right',
                      isSortable && 'cursor-pointer select-none hover:bg-muted/50 transition-colors',
                      column.headerClassName
                    )}
                    style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                    onClick={() => isSortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-2',
                      align === 'right' && 'justify-end',
                      align === 'center' && 'justify-center'
                    )}>
                      <span>{column.label}</span>
                      {isSortable && getSortIcon(column.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState || (
                    <div className="text-muted-foreground">
                      <p className="text-sm">{emptyStateMessage}</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={getKey(row, index)}
                  className={cn(
                    'border-b border-border transition-colors',
                    hoverable && 'hover:bg-muted/30'
                  )}
                >
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    const align = column.align || 'left';

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'py-3 px-4 text-sm text-foreground',
                          align === 'left' && 'text-left',
                          align === 'center' && 'text-center',
                          align === 'right' && 'text-right',
                          column.cellClassName
                        )}
                      >
                        {column.render ? column.render(value, row, index) : (
                          <span>{value ?? '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {searchable && searchQuery && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} results
        </div>
      )}
    </div>
  );
}

// Table Skeleton Component
function TableSkeleton<T>({ columns }: { columns: TableColumn<T>[] }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-muted rounded-lg" />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="py-3 px-4 text-left"
                  style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                >
                  <div className="h-4 w-24 bg-muted rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 px-4">
                    <div className="h-4 w-full bg-muted rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

