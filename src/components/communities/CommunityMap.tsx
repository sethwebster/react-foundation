/**
 * Community Map Component
 * Interactive Leaflet map showing React communities worldwide
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Community } from '@/types/community';
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
  const [L, setL] = useState<any>(null);

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
    console.log('🗺️ CommunityMap: Component mounted');
    console.log('🗺️ Communities loaded:', communities.length);

    // Load Leaflet
    if (typeof window !== 'undefined') {
      import('leaflet').then((LeafletModule) => {
        const LeafletLib = LeafletModule.default;

        // Fix default marker icon issue in Next.js
        delete (LeafletLib.Icon.Default.prototype as any)._getIconUrl;
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
    const icon = getTierIcon(tier || 'none', status);

    // Create a custom SVG icon with tier color
    const svgIcon = `
      <svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
        <!-- Drop shadow -->
        <ellipse cx="16" cy="42" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>

        <!-- Pin shape -->
        <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 28 12 28s12-20 12-28c0-6.627-5.373-12-12-12z"
              fill="${color}"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"/>

        <!-- Inner circle -->
        <circle cx="16" cy="12" r="7" fill="#ffffff" opacity="0.95"/>

        <!-- Tier emoji -->
        <text x="16" y="16" text-anchor="middle" font-size="10" fill="${color}">${icon}</text>
      </svg>
    `;

    // Return as divIcon so we can use custom HTML
    return {
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [32, 44] as [number, number],
      iconAnchor: [16, 44] as [number, number],
      popupAnchor: [0, -44] as [number, number],
    };
  };

  if (!isClient || isLoading || !L) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 animate-pulse flex items-center justify-center rounded-lg border border-border">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-lg font-medium text-foreground">
            {isLoading ? 'Loading communities...' : !L ? 'Loading map library...' : 'Loading map...'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {isLoading ? `Fetching ${communities.length} communities` : 'Initializing Leaflet'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading communities:', error);
  }

  console.log('🗺️ CommunityMap: Rendering map, isClient:', isClient);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border-2 border-primary/20 bg-blue-50 dark:bg-blue-950/20">
      {/* Debug indicator */}
      {/* <div className="absolute top-2 left-2 z-[999] bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
        MAP CONTAINER VISIBLE
      </div> */}

      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-lg space-y-2">
        <p className="text-xs font-semibold text-foreground mb-2">CoIS Tier</p>
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
        className="w-full h-full z-0"
        style={{ height: '600px', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {communities.map((community) => {
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
              <Popup className="custom-popup" minWidth={320} maxWidth={400}>
                <div className="p-4" style={{ color: 'hsl(var(--card-foreground))' }}>
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg flex-1" style={{ color: 'hsl(var(--card-foreground))' }}>
                        {community.name}
                      </h3>
                      {community.cois_tier && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap ${getTierBadgeColor(
                            community.cois_tier
                          )}`}
                        >
                          {getTierIcon(community.cois_tier)} {community.cois_tier}
                        </span>
                      )}
                    </div>
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

                  <a
                    href={`/communities/${community.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', `/communities/${community.slug}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="block w-full text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))'
                    }}
                  >
                    View Details →
                  </a>
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
      return '#22d3ee'; // cyan-400
    case 'gold':
      return '#facc15'; // yellow-400
    case 'silver':
      return '#9ca3af'; // gray-400
    case 'bronze':
      return '#fb923c'; // orange-400
    default:
      return '#3b82f6'; // blue-500 for active without tier
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
