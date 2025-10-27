/**
 * Library Eligibility Service - Data Access Layer
 * Handles all eligibility data fetching and caching
 * NO business logic in components - all goes through this service
 */

import { getCachedLibraryActivity, cacheLibraryActivity } from '@/lib/redis';
import {
  type EligibilityStatus,
  type SponsorshipLevel,
  getSponsorshipAdjustment,
  validateEligibilityMetadata,
} from '@/lib/ris/eligibility';

export interface LibraryEligibilityData {
  owner: string;
  repo: string;
  libraryName: string;
  eligibility: {
    status: EligibilityStatus;
    level: SponsorshipLevel;
    adjustment: number;
    notes: string;
    last_reviewed: string | null;
  };
}

/**
 * Get eligibility data for a single library
 */
export async function getLibraryEligibility(
  owner: string,
  repo: string
): Promise<LibraryEligibilityData | null> {
  try {
    const activity = await getCachedLibraryActivity(owner, repo);

    if (!activity) {
      return null;
    }

    return {
      owner: activity.owner,
      repo: activity.repo,
      libraryName: activity.libraryName,
      eligibility: {
        status: activity.eligibility_status || 'fully_eligible',
        level: activity.sponsorship_level || 'none',
        adjustment: activity.sponsorship_adjustment ?? 1.0,
        notes: activity.eligibility_notes || '',
        last_reviewed: activity.eligibility_last_reviewed || null,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch eligibility for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Get eligibility data for multiple libraries in parallel
 */
export async function getBulkLibraryEligibility(
  libraries: Array<{ owner: string; repo: string }>
): Promise<Array<LibraryEligibilityData | null>> {
  return Promise.all(
    libraries.map(lib => getLibraryEligibility(lib.owner, lib.repo))
  );
}

/**
 * Update eligibility metadata for a library
 */
export async function updateLibraryEligibility(
  owner: string,
  repo: string,
  updates: {
    eligibility_status?: EligibilityStatus;
    sponsorship_level?: SponsorshipLevel;
    eligibility_notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get existing activity data
    const activity = await getCachedLibraryActivity(owner, repo);
    if (!activity) {
      return { success: false, error: 'Library not found' };
    }

    // Calculate sponsorship adjustment if level provided
    let sponsorship_adjustment = updates.sponsorship_level
      ? getSponsorshipAdjustment(updates.sponsorship_level)
      : activity.sponsorship_adjustment ?? 1.0;

    // Enforce consistency: ineligible status → 0.0 adjustment
    const final_status = updates.eligibility_status || activity.eligibility_status || 'fully_eligible';
    if (final_status === 'ineligible') {
      sponsorship_adjustment = 0.0;
    }

    // Validate metadata
    const validation = validateEligibilityMetadata({
      eligibility_status: final_status,
      sponsorship_level: updates.sponsorship_level,
      sponsorship_adjustment,
    });

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid eligibility metadata: ${validation.errors.join(', ')}`,
      };
    }

    // Update activity data with new eligibility metadata
    activity.eligibility_status = updates.eligibility_status || activity.eligibility_status || 'fully_eligible';
    activity.sponsorship_level = updates.sponsorship_level || activity.sponsorship_level || 'none';
    activity.sponsorship_adjustment = sponsorship_adjustment;
    activity.eligibility_notes = updates.eligibility_notes !== undefined
      ? updates.eligibility_notes
      : activity.eligibility_notes;
    activity.eligibility_last_reviewed = new Date().toISOString();

    // Save updated activity data
    await cacheLibraryActivity(owner, repo, activity);

    return { success: true };
  } catch (error) {
    console.error(`Failed to update eligibility for ${owner}/${repo}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
