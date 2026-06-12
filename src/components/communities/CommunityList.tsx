/**
 * Community List Component
 * List view of communities with ruled rows
 */

'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { Row, RowArrow, RowList, RowRight } from '@/components/panels/panel';
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

  // Build query string from search params
  const queryString = searchParams.toString();
  const apiUrl = `/api/communities${queryString ? `?${queryString}` : ''}`;

  // Fetch communities from API with filters
  const { data, error, isLoading } = useSWR(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const communities: Community[] = data?.communities || FALLBACK_COMMUNITIES;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[#EBECF0]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#EBECF0] bg-white py-12 text-center">
        <p className="mb-2 font-medium text-[#C76A15]">Failed to load communities</p>
        <p className="text-sm text-[#5E687E]">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#5E687E]">
        Showing {communities.length} React communities worldwide
      </p>

      <RowList className="mt-2">
        {communities.map((community) => (
          <CommunityRow key={community.id} community={community} />
        ))}
      </RowList>

      {communities.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-[#5E687E]">No communities found</p>
        </div>
      )}
    </div>
  );
}

function CommunityRow({ community }: { community: Community }) {
  return (
    <Row href={`/communities/${community.slug}`} bare className="py-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className="text-[17px] font-semibold">{community.name}</h3>
          <MonoChip>{getVerificationLabel(community)}</MonoChip>
          {community.cois_tier && community.cois_tier !== 'none' && (
            <MonoChip>
              <span className="capitalize">{community.cois_tier}</span>
            </MonoChip>
          )}
          {community.event_types.map((type) => (
            <MonoChip key={type}>
              <span className="capitalize">{type}</span>
            </MonoChip>
          ))}
        </div>
        <p className="mt-1 text-sm text-[#5E687E]">
          {community.city}
          {community.region && `, ${community.region}`}, {community.country}
        </p>
      </div>
      <RowRight bare>
        <span className="font-mono-panels text-[13px] font-medium">
          {community.member_count.toLocaleString()} members
        </span>
        <RowArrow />
      </RowRight>
    </Row>
  );
}

function MonoChip({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-panels inline-flex items-center rounded-full border border-[rgba(22,24,29,0.2)] px-2 py-0.5 text-[11px] text-[#5E687E]">
      {children}
    </span>
  );
}

function getVerificationLabel(community: Community): string {
  const status =
    community.verification_status || (community.verified ? 'verified' : 'pending');

  return {
    verified: 'Verified',
    pending: 'Pending Review',
    rejected: 'Not Verified',
  }[status];
}
