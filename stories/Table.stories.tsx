import type { Meta, StoryObj } from '@storybook/react';
import { RFDS, type TableColumn } from '@/components/rfds';

const meta = {
  title: 'RFDS/Components/Table',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Example data types
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Moderator' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', age: 28, role: 'User' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', age: 32, role: 'Admin' },
];

const products: Product[] = [
  { id: '1', name: 'Widget A', price: 10.99, quantity: 100 },
  { id: '2', name: 'Widget B', price: 19.99, quantity: 50 },
  { id: '3', name: 'Widget C', price: 5.99, quantity: 200 },
  { id: '4', name: 'Widget D', price: 29.99, quantity: 75 },
];

export const Basic: Story = {
  render: () => {
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
      />
    );
  },
};

export const WithSearch: Story = {
  render: () => {
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
  },
};

export const WithComputedColumns: Story = {
  render: () => {
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
  },
};

export const WithCustomRendering: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { 
        key: 'name', 
        label: 'Name', 
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        )
      },
      { 
        key: 'age', 
        label: 'Age', 
        sortable: true,
        align: 'right'
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value) => {
          const variant = value === 'Admin' ? 'success' : value === 'Moderator' ? 'warning' : 'default';
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
        data={users}
        columns={columns}
        searchable
      />
    );
  },
};

export const WithFilter: Story = {
  render: () => {
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
        filterFn={(user) => user.age >= 30}
        emptyStateMessage="No users found matching the criteria"
      />
    );
  },
};

export const EmptyState: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
    ];

    return (
      <RFDS.Table
        data={[]}
        columns={columns}
        searchable
        emptyStateMessage="No users found"
      />
    );
  },
};

export const Loading: Story = {
  render: () => {
    const columns: TableColumn<User>[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
    ];

    return (
      <RFDS.Table
        data={users}
        columns={columns}
        loading
      />
    );
  },
};

