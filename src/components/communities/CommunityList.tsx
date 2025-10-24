/**
 * Community List Component
 * List view of communities with cards
 */

'use client';

import { RFDS } from '@/components/rfds';
import useSWR from 'swr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-destructive/10 rounded-lg">
        <p className="text-destructive font-medium mb-2">Failed to load communities</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Showing {communities.length} React communities worldwide
      </p>

      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}

      {communities.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No communities found</p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  const tierBadge = getTierBadge(community.cois_tier);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl font-bold text-foreground">
                  {community.name}
                </h3>
                <VerificationBadge
                  verified={community.verified}
                  status={community.verification_status}
                  size="sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {community.city}
                {community.region && `, ${community.region}`}, {community.country}
              </p>
            </div>
            {tierBadge && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${tierBadge.className}`}>
                {tierBadge.icon} {tierBadge.label}
              </span>
            )}
          </div>

          <p className="text-foreground mb-4 line-clamp-2">
            {community.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{community.member_count.toLocaleString()} members</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span className="capitalize">{community.meeting_frequency}</span>
            </div>
            {community.last_event_date && (
              <div className="flex items-center gap-1">
                <span>🎯</span>
                <span>Last event: {new Date(community.last_event_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Event Types */}
          <div className="flex gap-2 mt-3">
            {community.event_types.map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex md:flex-col gap-2">
          <Link
            href={`/communities/${community.slug}`}
            className="flex-1 md:flex-none text-center bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-primary/90 transition whitespace-nowrap block"
          >
            View Details
          </Link>
          {community.meetup_url && (
            <a
              href={community.meetup_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none text-center bg-[#ED1C40] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#ED1C40]/90 transition whitespace-nowrap flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                <path d="M99 414.3c1.1 5.7-2.3 11.1-8 12.3-5.4 1.1-10.9-2.3-12-8-1.1-5.4 2.3-11 7.7-12 5.4-1.2 11.1 2.3 12.3 7.7zm143.1 71.4c-6.3 4.6-8 13.4-3.7 20 4.6 6.6 13.4 8.3 20 3.7 6.3-4.6 8-13.4 3.4-20-4.2-6.5-13.1-8.2-19.7-3.7zm-86-462.3c6.3-1.4 10.3-7.7 8.9-14-1.1-6.6-7.4-10.6-13.7-9.1-6.3 1.4-10.3 7.7-9.1 14 1.4 6.6 7.6 10.6 13.9 9.1zM34.4 226.3c-10-6.9-23.7-4.3-30.6 6-6.9 10-4.3 24 5.7 30.9 10 7.1 23.7 4.6 30.6-5.7 6.9-10.4 4.3-24.1-5.7-31.2zm272-170.9c10.6-6.3 13.7-20 7.7-30.3-6.3-10.6-19.7-14-30-7.7s-13.7 20-7.4 30.6c6 10.3 19.4 13.7 29.7 7.4zm-191.1 58.6c7.7-5.4 9.4-16 4.3-23.7s-15.7-9.4-23.1-4.3c-7.7 5.4-9.4 16-4.3 23.7 5.1 7.8 15.6 9.5 23.1 4.3zm372.3 156c-7.4 1.7-12.3 9.1-10.6 16.9 1.4 7.4 8.9 12.3 16.3 10.6 7.4-1.4 12.3-8.9 10.6-16.6-1.5-7.4-8.9-12.3-16.3-10.9zm39.7-56.8c-1.1-5.7-6.6-9.1-12-8-5.7 1.1-9.1 6.9-8 12.6 1.1 5.4 6.6 9.1 12.3 8 5.4-1.5 9.1-6.9 7.7-12.6zM447 138.9c-8.6 6-10.6 17.7-4.9 26.3 6 8.6 17.4 10.6 26 4.9 8.3-6 10.3-17.7 4.6-26.3-6-8.5-17.4-10.6-25.7-4.9zm-6.3 139.4c26.3 43.1 15.1 100-26.3 129.1-17.4 12.3-37.1 17.7-56.9 17.1-12 47.1-69.4 64.6-105.1 32.6-1.1.9-2.6 1.7-3.7 2.9-39.1 27.1-92.3 17.4-119.4-22.3-9.7-14.3-14.6-30.6-15.1-46.9-65.4-10.9-90-94-41.1-139.7-28.3-46.9.6-107.4 53.4-114.9C151.6 70.2 213.3 4.6 277.1 2 338.5.3 395.2 28.5 425.5 70.7c36.3 48.6 42.6 63.4 57.7 84.6 12.3 17.1 15.1 37.4 15.1 58.3 0 21.7-7.7 42.3-15.1 61.7-8.3 19.4-20.6 37.1-35.1 52.6-2.3 2.3-4.6 4.6-6.9 6.9 2.3 2.3 5.1 5.1 7.7 7.4 20.6 19.7 49.7 29.1 78.3 23.4 6.3-1.1 12.3 3.1 13.4 9.4 1.1 6.3-3.1 12.3-9.4 13.4-34.9 7.1-71.1-4.9-96.6-30z"/>
              </svg>
              Join on Meetup
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function getTierBadge(tier?: string): { icon: string; label: string; className: string } | null {
  switch (tier) {
    case 'platinum':
      return {
        icon: '💎',
        label: 'Platinum',
        className: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white',
      };
    case 'gold':
      return {
        icon: '🏆',
        label: 'Gold',
        className: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
      };
    case 'silver':
      return {
        icon: '🥈',
        label: 'Silver',
        className: 'bg-gradient-to-r from-gray-300 to-gray-400 text-white',
      };
    case 'bronze':
      return {
        icon: '🥉',
        label: 'Bronze',
        className: 'bg-gradient-to-r from-orange-300 to-orange-400 text-white',
      };
    default:
      return null;
  }
}
