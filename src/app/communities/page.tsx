/**
 * Community Finder Page
 * Find React meetups, conferences, and communities worldwide
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { CommunityMap } from '@/components/communities/CommunityMap';
import { CommunityFilters } from '@/components/communities/CommunityFilters';
import { CommunityList } from '@/components/communities/CommunityList';
import { CommunityStats } from '@/components/communities/CommunityStats';
import { Footer } from '@/components/layout/footer';
import './leaflet.css';

export const metadata = {
  title: 'Find a React Community | React Foundation',
  description:
    'Discover React meetups, conferences, and communities near you. Connect with React developers worldwide.',
};

// CoIS tiers as categorical brand indicators (mapped to semantic tokens).
const TIERS: { label: string; dot: string }[] = [
  { label: 'Platinum', dot: 'bg-primary' },
  { label: 'Gold', dot: 'bg-warning' },
  { label: 'Silver', dot: 'bg-muted-foreground' },
  { label: 'Bronze', dot: 'bg-destructive' },
];

export default function CommunitiesPage() {
  return (
    <div className="relative min-h-screen bg-background pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-gradient-to-b from-muted/70 to-background" />

      <div className="mx-auto max-w-6xl px-6 pb-24 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="pt-10 text-center sm:pt-14">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Find Your React Community
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Connect with React developers through meetups, conferences, and study
            groups around the world.
          </p>
        </section>

        {/* Stats */}
        <section className="mt-14">
          <Suspense fallback={<StatsSkeleton />}>
            <CommunityStats />
          </Suspense>
        </section>

        {/* Map */}
        <section id="map" className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <Suspense fallback={<MapSkeleton />}>
              <CommunityMap />
            </Suspense>

            {/* Tier legend */}
            <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-border/60 bg-background/90 p-3 backdrop-blur">
              <p className="mb-2 text-xs font-semibold text-foreground">CoIS Tier</p>
              <ul className="space-y-1.5">
                {TIERS.map((tier) => (
                  <li
                    key={tier.label}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className={`h-2 w-2 rounded-full ${tier.dot}`} />
                    {tier.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* All communities */}
        <section id="communities" className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              All communities
            </h2>
            <Link
              href="/communities/start"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start a community
            </Link>
          </div>

          <div className="mt-8">
            <Suspense fallback={<FiltersSkeleton />}>
              <CommunityFilters />
            </Suspense>
          </div>

          <div className="mt-8">
            <Suspense fallback={<ListSkeleton />}>
              <CommunityList />
            </Suspense>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-16 gap-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2 text-center">
          <div className="mx-auto h-10 w-20 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-[520px] items-center justify-center bg-muted">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 animate-pulse rounded-lg bg-muted sm:w-40" />
      <div className="h-10 animate-pulse rounded-lg bg-muted sm:w-44" />
      <div className="h-10 animate-pulse rounded-lg bg-muted sm:w-40" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
