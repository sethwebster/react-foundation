import type { Meta, StoryObj } from '@storybook/react';
import { RFDS } from '@/components/rfds';

const meta = {
  title: 'RFDS/Components/Alerts',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <RFDS.SemanticAlert variant="default">
        <strong>Info:</strong> This is a default alert message.
      </RFDS.SemanticAlert>

      <RFDS.SemanticAlert variant="success">
        <strong>Success!</strong> Your changes have been saved successfully.
      </RFDS.SemanticAlert>

      <RFDS.SemanticAlert variant="warning">
        <strong>Warning:</strong> This action cannot be undone.
      </RFDS.SemanticAlert>

      <RFDS.SemanticAlert variant="destructive">
        <strong>Error:</strong> Something went wrong. Please try again.
      </RFDS.SemanticAlert>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <RFDS.SemanticAlert variant="default">
      This is an informational message.
    </RFDS.SemanticAlert>
  ),
};

export const Success: Story = {
  render: () => (
    <RFDS.SemanticAlert variant="success">
      Operation completed successfully!
    </RFDS.SemanticAlert>
  ),
};

export const Warning: Story = {
  render: () => (
    <RFDS.SemanticAlert variant="warning">
      Please review before proceeding.
    </RFDS.SemanticAlert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <RFDS.SemanticAlert variant="destructive">
      An error has occurred.
    </RFDS.SemanticAlert>
  ),
};
