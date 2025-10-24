/**
 * Community Submission Types
 * For pending community submissions awaiting verification
 */

export interface CommunitySubmission {
  id: string;

  // Community Info
  name: string;
  address: string; // Full address for geocoding
  city: string;
  country: string;
  description: string;

  // Links
  meetup_url?: string;
  website?: string;

  // Metadata
  member_count?: number;

  // Submitter Info
  submitted_by: string; // Email
  organizer_name: string;
  organizer_email: string;

  // Verification
  verification_status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string; // Admin email
  reviewed_at?: string;
  rejection_reason?: string;

  // Geocoding
  geocoded: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string;
  region?: string; // State/Province

  // Timestamps
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFormData {
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  meetup_url: string;
  website: string;
  member_count: string;
  organizer_name: string;
  organizer_email: string;
}
