/**
 * RFDS Table Component - Usage Examples
 * 
 * This file demonstrates various ways to use the RFDS Table component
 */

'use client';

import { RFDS, type TableColumn } from '@/components/rfds';

// Example 1: Simple table with basic data
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
}

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Moderator' },
];

export function SimpleTableExample() {
  const columns: TableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'age', label: 'Age', sortable: true, align: 'right' },
    { key: 'role', label: 'Role', sortable: true },
  ];

  return (
    <RFDS.Table
      data={users}
      columns={columns}
      searchable
      searchPlaceholder="Search users..."
    />
  );
}

// Example 2: Table with computed columns
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const products: Product[] = [
  { id: '1', name: 'Widget A', price: 10.99, quantity: 100 },
  { id: '2', name: 'Widget B', price: 19.99, quantity: 50 },
  { id: '3', name: 'Widget C', price: 5.99, quantity: 200 },
];

export function ComputedColumnsExample() {
  const columns: TableColumn<Product>[] = [
    { key: 'name', label: 'Product', sortable: true },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    { key: 'quantity', label: 'Quantity', sortable: true, align: 'right' },
    {
      key: 'totalValue',
      label: 'Total Value',
      sortable: true,
      align: 'right',
      computed: (product) => product.price * product.quantity,
      render: (value) => `$${value.toFixed(2)}`
    },
  ];

  return (
    <RFDS.Table
      data={products}
      columns={columns}
      searchable
      defaultSortKey="totalValue"
      defaultSortDirection="desc"
    />
  );
}

// Example 3: Table with custom rendering and badges
interface Library {
  id: string;
  name: string;
  owner: string;
  stars: number;
  status: 'active' | 'archived' | 'deprecated';
}

const libraries: Library[] = [
  { id: '1', name: 'react', owner: 'facebook', stars: 100000, status: 'active' },
  { id: '2', name: 'vue', owner: 'vuejs', stars: 50000, status: 'active' },
  { id: '3', name: 'angular', owner: 'angular', stars: 75000, status: 'active' },
];

export function CustomRenderingExample() {
  const columns: TableColumn<Library>[] = [
    { 
      key: 'name', 
      label: 'Library', 
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-sm text-muted-foreground">{row.owner}</div>
        </div>
      )
    },
    { 
      key: 'stars', 
      label: 'Stars', 
      sortable: true,
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const variant = value === 'active' ? 'success' : value === 'archived' ? 'warning' : 'destructive';
        return (
          <RFDS.SemanticBadge variant={variant}>
            {value}
          </RFDS.SemanticBadge>
        );
      }
    },
  ];

  return (
    <RFDS.Table
      data={libraries}
      columns={columns}
      searchable
      searchPlaceholder="Search libraries..."
    />
  );
}

// Example 4: Table with custom filter function
export function FilteredTableExample() {
  const columns: TableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
  ];

  return (
    <RFDS.Table
      data={users}
      columns={columns}
      searchable
      filterFn={(user) => user.age >= 30} // Only show users 30 or older
      emptyStateMessage="No users found matching the criteria"
    />
  );
}

