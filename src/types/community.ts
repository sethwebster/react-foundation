/**
 * Community Types
 * For React community finder and organizer profiles
 */

export interface Community {
  id: string;
  name: string;
  slug: string;

  // Location
  city: string;
  country: string;
  region?: string; // State/Province
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Organization
  organizers: Organizer[];
  founded_date: string; // ISO date
  event_types: EventType[];

  // Contact & Links
  website?: string;
  meetup_url?: string;
  eventbrite_url?: string;
  discord_url?: string;
  slack_url?: string;
  twitter_handle?: string;
  linkedin_url?: string;

  // Details
  description: string;
  member_count: number;
  typical_attendance: number;
  meeting_frequency: MeetingFrequency;
  primary_language: string;
  secondary_languages?: string[];

  // Status
  status: CommunityStatus;
  invite_only: boolean; // For CoIS participation
  verified: boolean; // Verified by React Foundation

  // CoIS Data
  cois_tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
  cois_score?: number;
  last_event_date?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Organizer {
  id: string;
  name: string;
  role: string; // "Lead Organizer", "Co-Organizer"
  avatar_url?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  github_username?: string;
}

export type EventType =
  | 'meetup'
  | 'conference'
  | 'workshop'
  | 'hackathon'
  | 'study-group'
  | 'virtual';

export type MeetingFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'irregular';

export type CommunityStatus =
  | 'active' // Regular events
  | 'paused' // Temporarily inactive
  | 'inactive' // No events in 6+ months
  | 'new'; // Less than 3 events

export interface CommunityFilters {
  search?: string;
  country?: string;
  event_types?: EventType[];
  status?: CommunityStatus;
  verified_only?: boolean;
  cois_tier?: Community['cois_tier'];
  has_upcoming_events?: boolean;
}

export interface UpcomingEvent {
  id: string;
  community_id: string;
  title: string;
  description: string;
  date: string; // ISO date
  time: string; // Local time
  duration_minutes: number;
  venue: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  format: 'in-person' | 'virtual' | 'hybrid';
  registration_url: string;
  rsvp_count: number;
  capacity?: number;
  speakers: {
    name: string;
    topic: string;
    company?: string;
  }[];
}

/**
 * Educator/Creator Types
 */

export interface Educator {
  id: string;
  name: string;
  slug: string;

  // Platforms
  platforms: EducatorPlatform[];
  primary_platform: string;

  // Content
  specialties: string[]; // ["React Hooks", "TypeScript", "Performance"]
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

  // Links
  website?: string;
  youtube_url?: string;
  twitter_handle?: string;
  github_username?: string;
  linkedin_url?: string;
  course_platform_urls: {
    platform: string;
    url: string;
  }[];

  // Bio
  bio: string;
  avatar_url?: string;
  company?: string;
  location?: string;

  // Status
  status: 'active' | 'inactive';
  invite_only: boolean; // For CIS participation
  verified: boolean;

  // CIS Data
  cis_tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
  cis_score?: number;
  total_learners?: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export type EducatorPlatform =
  | 'youtube'
  | 'udemy'
  | 'skillshare'
  | 'coursera'
  | 'pluralsight'
  | 'frontend-masters'
  | 'egghead'
  | 'own-site'
  | 'blog'
  | 'twitter'
  | 'twitch';

export interface EducatorFilters {
  search?: string;
  platforms?: EducatorPlatform[];
  specialties?: string[];
  experience_level?: Educator['experience_level'];
  verified_only?: boolean;
  cis_tier?: Educator['cis_tier'];
  free_content_only?: boolean;
}
