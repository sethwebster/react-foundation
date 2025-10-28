import type { Meta, StoryObj } from '@storybook/react';
import { RFDS } from '@/components/rfds';

const meta = {
  title: 'RFDS/Primitives/Button',
  component: RFDS.Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof RFDS.Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    variant: 'tertiary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <RFDS.Button variant="primary">Primary</RFDS.Button>
        <RFDS.Button variant="secondary">Secondary</RFDS.Button>
        <RFDS.Button variant="tertiary">Tertiary</RFDS.Button>
        <RFDS.Button variant="ghost">Ghost</RFDS.Button>
      </div>
      <div className="flex gap-4">
        <RFDS.Button size="sm">Small</RFDS.Button>
        <RFDS.Button size="md">Medium</RFDS.Button>
        <RFDS.Button size="lg">Large</RFDS.Button>
      </div>
    </div>
  ),
};
