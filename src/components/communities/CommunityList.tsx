/**
 * Community List Component
 * List view of communities with cards
 */

'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCommunityHostLabel } from '@/lib/community-host';
import { VerificationBadge } from './VerificationBadge';
import type { Community } from '@/types/community';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Fallback data if API fails
const FALLBACK_COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'React Native London',
    slug: 'react-native-london',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    organizers: [
      {
        id: '1',
        name: 'Alex Johnson',
        role: 'Lead Organizer',
        twitter_handle: 'alexjohnson',
      },
    ],
    founded_date: '2017-01-01',
    event_types: ['meetup', 'workshop'],
    description:
      'Monthly React Native meetups featuring talks, workshops, and networking. We welcome developers of all skill levels!',
    member_count: 2500,
    typical_attendance: 80,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'gold',
    last_event_date: '2025-09-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meetup_url: 'https://meetup.com/react-native-london',
    twitter_handle: 'reactnativelondon',
  },
  {
    id: '2',
    name: 'ReactJS SF Bay Area',
    slug: 'reactjs-sf-bay-area',
    city: 'San Francisco',
    region: 'California',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    organizers: [
      {
        id: '2',
        name: 'Sarah Chen',
        role: 'Lead Organizer',
        twitter_handle: 'sarahchen',
      },
    ],
    founded_date: '2015-06-01',
    event_types: ['meetup', 'workshop', 'hackathon'],
    description:
      'The largest React meetup in the SF Bay Area. Monthly talks from industry leaders, hands-on workshops, and annual hackathons.',
    member_count: 8500,
    typical_attendance: 150,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'platinum',
    last_event_date: '2025-10-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meetup_url: 'https://meetup.com/reactjs-sf-bay-area',
    twitter_handle: 'reactjssf',
  },
  {
    id: '3',
    name: 'React Lagos',
    slug: 'react-lagos',
    city: 'Lagos',
    country: 'Nigeria',
    timezone: 'Africa/Lagos',
    coordinates: { lat: 6.5244, lng: 3.3792 },
    organizers: [],
    founded_date: '2019-03-01',
    event_types: ['meetup', 'workshop'],
    description:
      'Growing the React community in West Africa. We focus on practical skills, career development, and connecting local developers.',
    member_count: 1200,
    typical_attendance: 60,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'silver',
    last_event_date: '2025-09-28',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    twitter_handle: 'reactlagos',
  },
];

export function CommunityList() {
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();
  const apiUrl = `/api/communities${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const communities: Community[] = data?.communities || FALLBACK_COMMUNITIES;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <p className="font-medium text-destructive">Failed to load communities</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {communities.length} communities worldwide
      </p>

      <div className="space-y-4">
        {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {communities.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
          <p className="text-muted-foreground">No communities found</p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  const tier = getTierBadge(community.cois_tier);
  const initials = community.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-border sm:flex-row">
      {/* Logo */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted text-lg font-semibold text-muted-foreground">
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{community.name}</h3>
          <VerificationBadge
            verified={community.verified}
            status={community.verification_status}
            size="sm"
          />
          {tier && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tier.className}`}
            >
              {tier.label}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {community.city}
          {community.region && `, ${community.region}`}, {community.country}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {community.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{community.member_count.toLocaleString()} members</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{community.meeting_frequency}</span>
          {community.last_event_date && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Last event:{' '}
                {new Date(community.last_event_date).toLocaleDateString()}
              </span>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {community.meetup_url ? (
            <a
              href={community.meetup_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                viewBox="0 0 512 512"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M99 414.3c1.1 5.7-2.3 11.1-8 12.3-5.4 1.1-10.9-2.3-12-8-1.1-5.4 2.3-11 7.7-12 5.4-1.2 11.1 2.3 12.3 7.7zm143.1 71.4c-6.3 4.6-8 13.4-3.7 20 4.6 6.6 13.4 8.3 20 3.7 6.3-4.6 8-13.4 3.4-20-4.2-6.5-13.1-8.2-19.7-3.7zm-86-462.3c6.3-1.4 10.3-7.7 8.9-14-1.1-6.6-7.4-10.6-13.7-9.1-6.3 1.4-10.3 7.7-9.1 14 1.4 6.6 7.6 10.6 13.9 9.1zM34.4 226.3c-10-6.9-23.7-4.3-30.6 6-6.9 10-4.3 24 5.7 30.9 10 7.1 23.7 4.6 30.6-5.7 6.9-10.4 4.3-24.1-5.7-31.2zm272-170.9c10.6-6.3 13.7-20 7.7-30.3-6.3-10.6-19.7-14-30-7.7s-13.7 20-7.4 30.6c6 10.3 19.4 13.7 29.7 7.4zm-191.1 58.6c7.7-5.4 9.4-16 4.3-23.7s-15.7-9.4-23.1-4.3c-7.7 5.4-9.4 16-4.3 23.7 5.1 7.8 15.6 9.5 23.1 4.3zm372.3 156c-7.4 1.7-12.3 9.1-10.6 16.9 1.4 7.4 8.9 12.3 16.3 10.6 7.4-1.4 12.3-8.9 10.6-16.6-1.5-7.4-8.9-12.3-16.3-10.9zm39.7-56.8c-1.1-5.7-6.6-9.1-12-8-5.7 1.1-9.1 6.9-8 12.6 1.1 5.4 6.6 9.1 12.3 8 5.4-1.5 9.1-6.9 7.7-12.6zM447 138.9c-8.6 6-10.6 17.7-4.9 26.3 6 8.6 17.4 10.6 26 4.9 8.3-6 10.3-17.7 4.6-26.3-6-8.5-17.4-10.6-25.7-4.9zm-6.3 139.4c26.3 43.1 15.1 100-26.3 129.1-17.4 12.3-37.1 17.7-56.9 17.1-12 47.1-69.4 64.6-105.1 32.6-1.1.9-2.6 1.7-3.7 2.9-39.1 27.1-92.3 17.4-119.4-22.3-9.7-14.3-14.6-30.6-15.1-46.9-65.4-10.9-90-94-41.1-139.7-28.3-46.9.6-107.4 53.4-114.9C151.6 70.2 213.3 4.6 277.1 2 338.5.3 395.2 28.5 425.5 70.7c36.3 48.6 42.6 63.4 57.7 84.6 12.3 17.1 15.1 37.4 15.1 58.3 0 21.7-7.7 42.3-15.1 61.7-8.3 19.4-20.6 37.1-35.1 52.6z" />
              </svg>
              {getCommunityHostLabel(community.meetup_url)}
            </a>
          ) : community.website ? (
            <a
              href={community.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Visit website →
            </a>
          ) : null}

          <Link
            href={`/communities/${community.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  );
}

function getTierBadge(
  tier?: string,
): { label: string; className: string } | null {
  switch (tier) {
    case 'platinum':
      return { label: 'Platinum', className: 'bg-primary/10 text-primary' };
    case 'gold':
      return { label: 'Gold', className: 'bg-warning/15 text-warning' };
    case 'silver':
      return { label: 'Silver', className: 'bg-foreground/10 text-muted-foreground' };
    case 'bronze':
      return { label: 'Bronze', className: 'bg-destructive/10 text-destructive' };
    default:
      return null;
  }
}
