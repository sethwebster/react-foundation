/**
 * Person & Profile Types
 * Unified identity system for RIS/CIS/CoIS participants
 *
 * Key Design Decisions:
 * 1. GitHub login = single source of identity
 * 2. One Person can have multiple roles (educator, organizer, maintainer)
 * 3. Public profile is editable by user (bio, photo, links)
 * 4. Metrics are read-only (admin/API only)
 * 5. Revenue from all pools, with global cap to prevent concentration
 */

import type { EducatorRawMetrics, EducatorScore } from '@/lib/cis';
import type { OrganizerRawMetrics, OrganizerScore } from '@/lib/cois';
import type { LibraryRawMetrics, LibraryScore } from '@/lib/ris';

// ============================================================================
// Core Person Identity
// ============================================================================

/**
 * Person - Core identity linked to GitHub OAuth
 */
export interface Person {
  id: string; // UUID
  github_id: string; // GitHub user ID
  github_username: string; // From OAuth
  github_email: string; // From OAuth

  // Public profile (user can edit)
  profile: PublicProfile;

  // Impact roles (user claims, admin verifies)
  roles: PersonRoles;

  // Permissions
  is_admin: boolean;
  is_super_admin: boolean;

  // Status
  status: 'active' | 'suspended' | 'deleted';
  verified_at?: string; // When identity was verified

  // Metadata
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * Public Profile - User-editable fields
 * Prepopulated from GitHub, but user can customize
 */
export interface PublicProfile {
  // Basic Info
  display_name: string; // Default from GitHub name
  bio?: string; // Default from GitHub bio
  avatar_url: string; // Default from GitHub avatar
  location?: string; // Default from GitHub location

  // Social Links
  website?: string; // Default from GitHub website
  twitter_handle?: string; // User adds
  linkedin_url?: string; // User adds
  youtube_url?: string; // For educators

  // Professional
  company?: string; // Default from GitHub company
  job_title?: string;

  // Visibility
  show_email: boolean; // Whether to show email publicly
  show_github: boolean; // Whether to show GitHub profile link

  // Last edited
  profile_updated_at: string;
}

// ============================================================================
// Roles System
// ============================================================================

/**
 * Person Roles - One person can have multiple roles
 */
export interface PersonRoles {
  educator?: EducatorRole;
  organizer?: OrganizerRole[]; // Can organize multiple communities
  maintainer?: MaintainerRole[]; // Can maintain multiple libraries
}

/**
 * Educator Role - For content creators, YouTubers, course creators
 */
export interface EducatorRole {
  // Status
  verified: boolean; // Admin verified this person is an educator
  invite_only: boolean; // Whether they were invited (vs applied)
  verification_status: 'pending' | 'approved' | 'rejected';

  // Platforms
  platforms: EducatorPlatform[];
  primary_platform: string;

  // Content Focus
  specialties: string[]; // ["React Hooks", "TypeScript", "Performance"]
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

  // Metrics (admin/API submits quarterly)
  latest_metrics?: EducatorRawMetrics;
  latest_score?: EducatorScore;
  metrics_history: {
    period: string; // "2025-Q1"
    metrics: EducatorRawMetrics;
    score: EducatorScore;
  }[];

  // Metadata
  claimed_at: string;
  verified_at?: string;
}

export type EducatorPlatform =
  | 'youtube'
  | 'udemy'
  | 'skillshare'
  | 'coursera'
  | 'pluralsight'
  | 'frontend-masters'
  | 'egghead'
  | 'epic-react'
  | 'own-site'
  | 'blog'
  | 'twitter'
  | 'twitch';

/**
 * Organizer Role - For community/event organizers
 * One person can organize multiple communities
 */
export interface OrganizerRole {
  community_id: string; // Links to Community entity
  community_name: string; // Denormalized for display

  // Role Type
  role: 'lead' | 'co-organizer' | 'speaker' | 'sponsor';

  // Status
  verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';

  // Only lead & co-organizer earn CoIS
  // Speakers earn CIS (if also an educator)
  // Sponsors don't earn (they pay)
  earns_cois: boolean; // Computed: role === 'lead' || 'co-organizer'

  // Metrics (only for lead/co-organizer)
  contribution_weight: number; // 1.0 for lead, 0.5 for co-organizer

  // Metadata
  joined_at: string;
  verified_at?: string;
}

/**
 * Maintainer Role - For library maintainers
 * One person can maintain multiple libraries
 */
export interface MaintainerRole {
  library_id: string; // Links to Library entity
  library_name: string; // e.g., "react-query"
  repo: string; // e.g., "tanstack/query"

  // Status
  verified: boolean; // Auto-verified via GitHub commits

  // Contribution Level
  contribution_weight: number; // Based on commits, PRs, etc.

  // Metrics (auto-collected from GitHub)
  latest_metrics?: LibraryRawMetrics;
  latest_score?: LibraryScore;

  // Metadata
  first_contribution_at: string;
  last_contribution_at: string;
}

// ============================================================================
// Revenue Allocation
// ============================================================================

/**
 * Quarterly Allocation for a Person
 * Combines earnings from all roles
 */
export interface PersonQuarterlyAllocation {
  person_id: string;
  period: string; // "2025-Q1"

  // Earnings by pool
  cis_allocation_usd: number; // From educator role
  cois_allocation_usd: number; // From organizer roles (summed)
  ris_allocation_usd: number; // From maintainer roles (summed)

  // Total
  total_allocation_usd: number; // Sum of above

  // Caps applied
  global_cap_applied: boolean; // If total exceeds global cap
  global_cap_percent: number; // Default: 0.20 (20% of total impact pool)

  // Breakdown
  breakdown: {
    cis?: {
      score: number;
      tier: string;
      allocation_usd: number;
    };
    cois?: {
      communities: {
        community_id: string;
        community_name: string;
        score: number;
        allocation_usd: number;
      }[];
      total_allocation_usd: number;
    };
    ris?: {
      libraries: {
        library_id: string;
        library_name: string;
        score: number;
        allocation_usd: number;
      }[];
      total_allocation_usd: number;
    };
  };

  // Metadata
  calculated_at: string;
  paid_at?: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed';
}

/**
 * Global Revenue Cap Configuration
 */
export interface GlobalCapConfig {
  // Maximum any one person can earn from total impact pool
  max_percent_of_total_pool: number; // Default: 0.20 (20%)

  // Whether to apply cap across all pools or per-pool
  cap_mode: 'global' | 'per-pool';

  // If cap is exceeded, how to handle
  cap_overflow_mode: 'redistribute' | 'burn'; // Redistribute to others or keep as reserve
}

export const DEFAULT_GLOBAL_CAP_CONFIG: GlobalCapConfig = {
  max_percent_of_total_pool: 0.20, // No one gets >20% of total
  cap_mode: 'global',
  cap_overflow_mode: 'redistribute',
};

// ============================================================================
// Verification & Claims
// ============================================================================

/**
 * Role Claim - When someone claims to be an educator/organizer
 */
export interface RoleClaim {
  id: string;
  person_id: string;
  claim_type: 'educator' | 'organizer' | 'maintainer';

  // Evidence
  evidence: {
    platform_url?: string; // YouTube channel, course site, etc.
    community_id?: string; // For organizer claims
    library_repo?: string; // For maintainer claims
    description: string; // User explanation
    attachments?: string[]; // Screenshots, emails, etc.
  };

  // Review
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string; // Admin user ID
  reviewed_at?: string;
  rejection_reason?: string;

  // Metadata
  created_at: string;
}

/**
 * Profile Edit History
 * Track changes to detect suspicious activity
 */
export interface ProfileEditHistory {
  id: string;
  person_id: string;
  field_changed: keyof PublicProfile;
  old_value: string;
  new_value: string;
  changed_at: string;
  changed_by: string; // Person ID (usually self)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total quarterly earnings for a person
 */
export function calculatePersonAllocation(
  cisAllocation: number,
  coisAllocations: number[],
  risAllocations: number[],
  totalImpactPool: number,
  config: GlobalCapConfig = DEFAULT_GLOBAL_CAP_CONFIG
): PersonQuarterlyAllocation {
  const cois_total = coisAllocations.reduce((sum, a) => sum + a, 0);
  const ris_total = risAllocations.reduce((sum, a) => sum + a, 0);
  const uncapped_total = cisAllocation + cois_total + ris_total;

  // Apply global cap
  const global_cap = totalImpactPool * config.max_percent_of_total_pool;
  const total_allocation_usd = Math.min(uncapped_total, global_cap);
  const global_cap_applied = uncapped_total > global_cap;

  // If capped, proportionally reduce all allocations
  const cap_ratio = global_cap_applied ? total_allocation_usd / uncapped_total : 1;

  return {
    person_id: '', // Filled by caller
    period: '', // Filled by caller
    cis_allocation_usd: cisAllocation * cap_ratio,
    cois_allocation_usd: cois_total * cap_ratio,
    ris_allocation_usd: ris_total * cap_ratio,
    total_allocation_usd,
    global_cap_applied,
    global_cap_percent: config.max_percent_of_total_pool,
    breakdown: {}, // Filled by caller
    calculated_at: new Date().toISOString(),
    payment_status: 'pending',
  };
}

/**
 * Check if person can claim a role
 */
export function canClaimRole(
  person: Person,
  roleType: 'educator' | 'organizer' | 'maintainer'
): { allowed: boolean; reason?: string } {
  // Suspended users can't claim
  if (person.status === 'suspended') {
    return { allowed: false, reason: 'Account suspended' };
  }

  // Check if already has role
  switch (roleType) {
    case 'educator':
      if (person.roles.educator) {
        return { allowed: false, reason: 'Already claimed educator role' };
      }
      break;
    case 'maintainer':
      // Can have multiple
      break;
    case 'organizer':
      // Can have multiple
      break;
  }

  return { allowed: true };
}
