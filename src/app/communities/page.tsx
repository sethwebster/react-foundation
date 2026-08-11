import type { Metadata } from "next";
import { Suspense } from "react";

import { AddCommunityCTA } from "@/components/communities/AddCommunityCTA";
import { CommunityFilters } from "@/components/communities/CommunityFilters";
import { CommunityList } from "@/components/communities/CommunityList";
import { CommunityMap } from "@/components/communities/CommunityMap";
import { CommunitySortDropdown } from "@/components/communities/CommunitySortDropdown";
import { CommunityStats } from "@/components/communities/CommunityStats";
import { CommunitySearch } from "@/components/communities/CommunitySearch";
import {
  Eyebrow,
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { REACT_COMMUNITIES } from "@/data/communities";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "React Communities",
  description:
    "Discover React meetups, conferences, and communities around the world.",
};

const communityStats = {
  communities: REACT_COMMUNITIES.length,
  countries: new Set(REACT_COMMUNITIES.map((community) => community.country)).size,
  members: REACT_COMMUNITIES.reduce(
    (sum, community) => sum + community.member_count,
    0,
  ),
};

export default function CommunitiesPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Global network"
            title="Find your React community"
            description="Connect with React developers through meetups, conferences, and study groups around the world."
          />
        </Section>

        <Section className="pt-10 sm:pt-12">
          <CommunityStats {...communityStats} />
        </Section>

        <Section className="pt-4 sm:pt-6" measure="standard">
          <div className="overflow-hidden rounded-panel border border-border bg-map-water/35 shadow-card">
            <CommunityMap communities={REACT_COMMUNITIES} />
          </div>
          <div className="mt-5">
            <AddCommunityCTA />
          </div>
        </Section>

        <Section
          id="communities"
          className="scroll-mt-24 border-t border-border pt-20 sm:pt-24"
          measure="standard"
        >
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow className="mb-3">Community directory</Eyebrow>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
                Find a community
              </h2>
            </div>
            <CommunitySortDropdown />
          </div>

          <Suspense fallback={null}>
            <CommunitySearch />
          </Suspense>

          <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside>
              <Suspense fallback={<FiltersSkeleton />}>
                <CommunityFilters />
              </Suspense>
            </aside>
            <div>
              <Suspense fallback={<ListSkeleton />}>
                <CommunityList communities={REACT_COMMUNITIES} />
              </Suspense>
            </div>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

function FiltersSkeleton() {
  return <div className="h-80 animate-pulse rounded-panel bg-muted" />;
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-panel bg-muted" />
      ))}
    </div>
  );
}
