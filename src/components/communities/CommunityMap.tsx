'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getCommunityHostLabel } from '@/lib/community-host';
import type { Community } from '@/types/community';
import type * as Leaflet from 'leaflet';
import useSWR from 'swr';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Fallback mock data if API fails
const FALLBACK_COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'React Native London',
    slug: 'react-native-london',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    organizers: [],
    founded_date: '2017-01-01',
    event_types: ['meetup', 'workshop'],
    description: 'Monthly React Native meetups featuring talks, workshops, and networking',
    member_count: 2500,
    typical_attendance: 80,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'gold',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meetup_url: 'https://meetup.com/react-native-london',
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
    organizers: [],
    founded_date: '2015-06-01',
    event_types: ['meetup', 'workshop', 'hackathon'],
    description: 'The largest React meetup in the SF Bay Area with monthly talks',
    member_count: 8500,
    typical_attendance: 150,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'platinum',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    description: 'Growing the React community in West Africa',
    member_count: 1200,
    typical_attendance: 60,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'silver',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'React Sydney',
    slug: 'react-sydney',
    city: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    organizers: [],
    founded_date: '2016-08-01',
    event_types: ['meetup'],
    description: 'Monthly React meetups in Sydney',
    member_count: 3200,
    typical_attendance: 90,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'gold',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'React Berlin',
    slug: 'react-berlin',
    city: 'Berlin',
    country: 'Germany',
    timezone: 'Europe/Berlin',
    coordinates: { lat: 52.52, lng: 13.405 },
    organizers: [],
    founded_date: '2016-02-01',
    event_types: ['meetup', 'conference'],
    description: 'React community in Berlin - meetups and annual conference',
    member_count: 4500,
    typical_attendance: 120,
    meeting_frequency: 'monthly',
    primary_language: 'English',
    secondary_languages: ['German'],
    status: 'active',
    invite_only: false,
    verified: true,
    cois_tier: 'platinum',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function CommunityMap() {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof Leaflet | null>(null);

  // Fetch communities from API
  const { data, error, isLoading } = useSWR(
    '/api/communities',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const communities: Community[] = data?.communities || FALLBACK_COMMUNITIES;

  useEffect(() => {
    // Load Leaflet
    if (typeof window !== 'undefined') {
      import('leaflet').then((LeafletModule) => {
        const LeafletLib = LeafletModule.default;
        type IconDefaultPrototype = typeof LeafletLib.Icon.Default.prototype & {
          _getIconUrl?: unknown;
        };

        // Fix default marker icon issue in Next.js
        delete (LeafletLib.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
        LeafletLib.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Store L in state
        setL(LeafletLib);
        setIsClient(true);
      });
    }
  }, []);

  // Create custom icon with tier-based color
  const createCustomIcon = (tier?: string, status?: string) => {
    if (typeof window === 'undefined') return undefined;

    const color = getTierColorHex(tier, status);
    const dimmed = status === 'inactive' || status === 'paused';

    // Clean teardrop pin with a white ring and solid tier-colored core.
    const svgIcon = `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" style="opacity:${dimmed ? 0.65 : 1}">
        <ellipse cx="15" cy="38" rx="6" ry="1.8" fill="rgba(0,0,0,0.18)"/>
        <path d="M15 1C8.096 1 2.5 6.596 2.5 13.5c0 8.5 12.5 24 12.5 24s12.5-15.5 12.5-24C27.5 6.596 21.904 1 15 1z"
              fill="${color}"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linejoin="round"/>
        <circle cx="15" cy="13.5" r="4.5" fill="#ffffff"/>
      </svg>
    `;

    // Return as divIcon so we can use custom HTML
    return {
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [30, 40] as [number, number],
      iconAnchor: [15, 40] as [number, number],
      popupAnchor: [0, -40] as [number, number],
    };
  };

  if (!isClient || isLoading || !L) {
    return (
      <div className="flex h-[420px] w-full animate-pulse items-center justify-center bg-muted sm:h-[600px]">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isLoading ? 'Loading communities…' : !L ? 'Loading map library…' : 'Loading map…'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? `Fetching ${communities.length} communities` : 'Initializing map'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading communities:', error);
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-muted sm:h-[600px]">
      {/* Map Legend */}
      <div className="absolute right-4 top-4 z-10 space-y-2 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 text-xs font-semibold text-foreground">CoIS Tier</p>
        <TierLegend tier="platinum" />
        <TierLegend tier="gold" />
        <TierLegend tier="silver" />
        <TierLegend tier="bronze" />
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="z-0 h-full w-full"
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {communities
          .filter((c): c is Community & { coordinates: NonNullable<Community['coordinates']> } => !!c.coordinates)
          .map((community) => {
          const iconOptions = createCustomIcon(community.cois_tier, community.status);

          return (
            <Marker
              key={community.id}
              position={[community.coordinates.lat, community.coordinates.lng]}
              icon={
                iconOptions && L
                  ? L.divIcon(iconOptions)
                  : undefined
              }
              title={`${community.name} - ${community.cois_tier || community.status}`}
            >
              <Popup className="custom-popup" minWidth={320} maxWidth={400} closeButton={false}>
                <div className="p-4" style={{ color: 'hsl(var(--card-foreground))' }}>
                  {/* Header with tier badge */}
                  <div className="mb-3">
                    {community.cois_tier && (
                      <div className="flex justify-end mb-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap ${getTierBadgeColor(
                            community.cois_tier
                          )}`}
                        >
                          {getTierIcon(community.cois_tier)} {community.cois_tier}
                        </span>
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'hsl(var(--card-foreground))' }}>
                      {community.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {community.city}
                      {community.region && `, ${community.region}`}, {community.country}
                    </p>
                  </div>

                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'hsl(var(--card-foreground))' }}>
                    {community.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4 bg-muted/30 p-3 rounded">
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }} className="text-xs mb-1">Members</div>
                      <div className="font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>
                        {community.member_count.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }} className="text-xs mb-1">Frequency</div>
                      <div className="font-semibold capitalize" style={{ color: 'hsl(var(--card-foreground))' }}>
                        {community.meeting_frequency}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.event_types.map((type) => (
                      <span
                        key={type}
                        className="px-2.5 py-1 rounded-full text-xs capitalize font-medium"
                        style={{
                          backgroundColor: 'hsl(var(--primary) / 0.15)',
                          color: 'hsl(var(--primary))'
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/communities/${community.slug}`}
                      className="flex-1 text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 cursor-pointer"
                      style={{
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))'
                      }}
                    >
                      View Details
                    </Link>
                    {community.meetup_url && (
                      <a
                        href={community.meetup_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 rounded-lg px-3 py-2.5 text-sm font-semibold transition hover:opacity-90"
                        style={{
                          backgroundColor: '#ED1C40',
                          color: '#ffffff'
                        }}
                        title={`Join on ${getCommunityHostLabel(community.meetup_url)}`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M99 414.3c1.1 5.7-2.3 11.1-8 12.3-5.4 1.1-10.9-2.3-12-8-1.1-5.4 2.3-11 7.7-12 5.4-1.2 11.1 2.3 12.3 7.7z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function getTierColorHex(tier?: string, status?: string): string {
  // Inactive/paused communities get gray
  if (status === 'inactive' || status === 'paused') {
    return '#6b7280'; // gray-500
  }

  switch (tier) {
    case 'platinum':
      return '#0ea5e9'; // brand sky (primary)
    case 'gold':
      return '#f59e0b'; // amber-500
    case 'silver':
      return '#94a3b8'; // slate-400
    case 'bronze':
      return '#b45309'; // amber-800 (bronze)
    default:
      return '#64748b'; // slate-500 for active without tier
  }
}

function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'platinum':
      return 'bg-gradient-to-r from-cyan-400 to-blue-400';
    case 'gold':
      return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    case 'silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-400';
    case 'bronze':
      return 'bg-gradient-to-r from-orange-300 to-orange-400';
    default:
      return 'bg-primary';
  }
}

function getTierIcon(tier: string, status?: string): string {
  // Different icons for inactive/paused
  if (status === 'inactive') return '⏸';
  if (status === 'paused') return '⏸';
  if (status === 'new') return '✨';

  switch (tier) {
    case 'platinum':
      return '💎';
    case 'gold':
      return '🏆';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    default:
      return '📍';
  }
}

function TierLegend({ tier }: { tier: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: getTierColorHex(tier) }}
      />
      <span className="text-xs text-foreground capitalize">{tier}</span>
    </div>
  );
}
