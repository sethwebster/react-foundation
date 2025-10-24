/**
 * Add Community Page (Full Page Version)
 * Accessed directly via /communities/add
 */

import { AddCommunityForm } from '@/components/communities/AddCommunityForm';

export const metadata = {
  title: 'Add Your Community | React Foundation',
  description: 'Submit your React community to be added to our global map.',
};

export default function AddCommunityPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <a
            href="/communities"
            className="text-sm text-muted-foreground hover:text-primary transition"
          >
            ← Back to communities
          </a>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Add Your Community
          </h1>
          <p className="text-lg text-muted-foreground">
            Help grow the global React community map by adding your local meetup, conference, or study group.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8">
          <AddCommunityForm fullPage />
        </div>
      </div>
    </div>
  );
}
