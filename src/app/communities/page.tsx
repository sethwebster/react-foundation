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
import {
  OrbitMarks,
  Panel,
  PanelActions,
  PanelButton,
  PanelEyebrow,
  PanelSub,
} from '@/components/panels/panel';
import { PanelsFooter } from '@/components/panels/panels-footer';
import './leaflet.css';

export const metadata = {
  title: 'Find a React Community | React Foundation',
  description: 'Discover React meetups, conferences, and communities near you. Connect with React developers worldwide.',
};

export default function CommunitiesPage() {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="communities-hero-title">
        <OrbitMarks className="left-[68%] top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-[1]">
          <h1
            id="communities-hero-title"
            className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
          >
            Find Your React Community
          </h1>
          <p className="mt-4 max-w-[36rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
            Connect with React developers through meetups, conferences, and
            study groups around the world.
          </p>
          <PanelActions>
            <PanelButton href="#communities" variant="ink">
              Explore Communities
            </PanelButton>
            <PanelButton href="/communities/start" variant="outline">
              Start a Community
            </PanelButton>
          </PanelActions>
        </div>
      </Panel>

      <Panel tone="paper" compact labelledBy="community-stats-title">
        <PanelEyebrow id="community-stats-title">By the numbers</PanelEyebrow>
        <Suspense fallback={<StatsSkeleton />}>
          <CommunityStats />
        </Suspense>
      </Panel>

      <Panel tone="paper" id="map" labelledBy="community-map-title">
        <PanelEyebrow id="community-map-title">Communities worldwide</PanelEyebrow>
        <PanelSub>Click any marker to learn more about a community</PanelSub>
        <div className="mt-6">
          <Suspense fallback={<MapSkeleton />}>
            <CommunityMap />
          </Suspense>
        </div>
        <AddCommunityCTA />
      </Panel>

      {/*
       * Not the Panel primitive: its overflow-hidden would defeat the sticky
       * filters and clip the sort dropdown menus, so this section recreates the
       * paper surface (and its tone variables) with overflow left visible.
       */}
      <section
        id="communities"
        aria-labelledby="community-list-title"
        className="relative mx-auto w-full max-w-[1200px] scroll-mt-24 rounded-[28px] bg-[#F6F7F9] p-[22px] text-[#16181D] md:p-12 [--panel-rule:#16181D] [--panel-hover:#FFFFFF] [--panel-eyebrow:#5E687E] [--panel-sub:#5E687E]"
      >
        <PanelEyebrow id="community-list-title">All communities</PanelEyebrow>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <Suspense fallback={<FiltersSkeleton />}>
                <CommunityFilters />
              </Suspense>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
              <CommunitySortDropdown />
            </div>

            <Suspense fallback={<ListSkeleton />}>
              <CommunityList />
            </Suspense>
          </main>
        </div>
      </section>

      <Panel tone="paper" labelledBy="communities-cta-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2
              id="communities-cta-title"
              className="max-w-[44rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]"
            >
              Don&apos;t See a Community Near You?
            </h2>
            <p className="mt-4 max-w-[36rem] text-[15px] leading-[1.55] text-[#5E687E]">
              Starting a React community is easier than you think. We provide
              resources, templates, and support to help you succeed.
            </p>
          </div>
          <PanelActions>
            <PanelButton href="/communities/start" variant="ink">
              Start Your Own Community
            </PanelButton>
          </PanelActions>
        </div>
      </Panel>

      <PanelsFooter />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="mt-3 divide-y divide-[#EBECF0]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between py-[18px]">
          <div className="h-5 w-44 max-w-[50%] animate-pulse rounded bg-[#EBECF0]" />
          <div className="h-5 w-16 animate-pulse rounded bg-[#EBECF0]" />
        </div>
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6 rounded-2xl border border-[#EBECF0] bg-white p-6">
      <div className="h-10 animate-pulse rounded-xl bg-[#EBECF0]" />
      <div className="h-32 animate-pulse rounded-xl bg-[#EBECF0]" />
      <div className="h-32 animate-pulse rounded-xl bg-[#EBECF0]" />
      <div className="h-32 animate-pulse rounded-xl bg-[#EBECF0]" />
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-[600px] items-center justify-center rounded-2xl border border-[#EBECF0] bg-[#EBECF0] animate-pulse">
      <p className="text-[15px] text-[#5E687E]">Loading map...</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-[#EBECF0]" />
      ))}
    </div>
  );
}
