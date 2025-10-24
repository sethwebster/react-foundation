/**
 * Community Finder Page
 * Find React meetups, conferences, and communities worldwide
 */

import { Suspense } from 'react';
import { CommunityMap } from '@/components/communities/CommunityMap';
import { CommunityFilters } from '@/components/communities/CommunityFilters';
import { CommunityList } from '@/components/communities/CommunityList';
import { CommunityStats } from '@/components/communities/CommunityStats';
import { CommunitySortDropdown } from '@/components/communities/CommunitySortDropdown';
import { AddCommunityCTA } from '@/components/communities/AddCommunityCTA';
import './leaflet.css';

export const metadata = {
  title: 'Find a React Community | React Foundation',
  description: 'Discover React meetups, conferences, and communities near you. Connect with React developers worldwide.',
};

export default function CommunitiesPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Find Your React Community
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Connect with React developers through meetups, conferences, and
              study groups around the world.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#communities"
                className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition text-lg"
              >
                🗺️ Explore Communities
              </a>
              <a
                href="/communities/start"
                className="inline-block bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-secondary/90 transition text-lg"
              >
                🚀 Start a Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Dynamic from Redis */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-6">
          <Suspense fallback={<StatsSkeleton />}>
            <CommunityStats />
          </Suspense>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="bg-muted/30 border-b border-border py-12">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Communities Worldwide
            </h2>
            <p className="text-muted-foreground">
              Click any marker to learn more about a community
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
            <Suspense fallback={<MapSkeleton />}>
              <CommunityMap />
            </Suspense>
          </div>

          {/* Add Community CTA */}
          <AddCommunityCTA />
        </div>
      </section>

      {/* Main Content: Filters + List */}
      <section id="communities" className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <Suspense fallback={<FiltersSkeleton />}>
                  <CommunityFilters />
                </Suspense>
              </div>
            </aside>

            {/* Community List */}
            <main className="lg:col-span-3">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  All Communities
                </h2>
                <CommunitySortDropdown />
              </div>

              <Suspense fallback={<ListSkeleton />}>
                <CommunityList />
              </Suspense>
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-primary/5 to-primary/10 border-t border-border py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Don't See a Community Near You?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Starting a React community is easier than you think. We provide
            resources, templates, and support to help you succeed.
          </p>
          <a
            href="/communities/start"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition text-lg"
          >
            Start Your Own Community
          </a>
        </div>
      </section>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-muted animate-pulse rounded" />
      <div className="h-32 bg-muted animate-pulse rounded" />
      <div className="h-32 bg-muted animate-pulse rounded" />
      <div className="h-32 bg-muted animate-pulse rounded" />
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-[600px] bg-muted animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
