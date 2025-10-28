import type { Meta, StoryObj } from '@storybook/react';
import { RFDS } from '@/components/rfds';

const meta = {
  title: 'RFDS/Layouts',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  render: () => <RFDS.Header />,
};

export const Footer: Story = {
  render: () => <RFDS.Footer />,
};

export const HeaderAndFooter: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <RFDS.Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Page Content</h1>
          <p className="text-muted-foreground">Header above, Footer below</p>
        </div>
      </main>
      <RFDS.Footer />
    </div>
  ),
};
