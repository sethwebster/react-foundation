import type { Meta, StoryObj } from '@storybook/react';
import { RFDS } from '@/components/rfds';

const meta = {
  title: 'RFDS/Components/Badges',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <RFDS.SemanticBadge variant="default">Default</RFDS.SemanticBadge>
      <RFDS.SemanticBadge variant="success">Success</RFDS.SemanticBadge>
      <RFDS.SemanticBadge variant="warning">Warning</RFDS.SemanticBadge>
      <RFDS.SemanticBadge variant="destructive">Destructive</RFDS.SemanticBadge>
      <RFDS.SemanticBadge variant="outline">Outline</RFDS.SemanticBadge>
    </div>
  ),
};

export const Default: Story = {
  render: () => <RFDS.SemanticBadge variant="default">New</RFDS.SemanticBadge>,
};

export const Success: Story = {
  render: () => <RFDS.SemanticBadge variant="success">Active</RFDS.SemanticBadge>,
};

export const Warning: Story = {
  render: () => <RFDS.SemanticBadge variant="warning">Pending</RFDS.SemanticBadge>,
};

export const Destructive: Story = {
  render: () => <RFDS.SemanticBadge variant="destructive">Error</RFDS.SemanticBadge>,
};

export const Outline: Story = {
  render: () => <RFDS.SemanticBadge variant="outline">Draft</RFDS.SemanticBadge>,
};
