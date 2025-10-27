/**
 * Eligibility and Sponsorship Logic
 * Handles funding eligibility decisions and adjustment factors
 */

export type EligibilityStatus = 'fully_eligible' | 'partially_sponsored' | 'ineligible';
export type SponsorshipLevel = 'none' | 'minimal' | 'moderate' | 'substantial' | 'exclusive';

/**
 * Get sponsorship adjustment factor based on sponsorship level
 */
export function getSponsorshipAdjustment(level: SponsorshipLevel): number {
  const adjustments: Record<SponsorshipLevel, number> = {
    none: 1.0,        // No corporate sponsorship - full funding
    minimal: 0.9,     // <$50k/year or volunteer-only - 90% funding
    moderate: 0.7,    // $50k-$200k/year or part-time support - 70% funding
    substantial: 0.4, // $200k-$500k/year or 1-2 FTE - 40% funding
    exclusive: 0.0,   // $500k+/year or 3+ dedicated FTE - ineligible
  };

  return adjustments[level];
}

/**
 * Get default eligibility status based on sponsorship level
 */
export function getEligibilityFromSponsorship(level: SponsorshipLevel): EligibilityStatus {
  if (level === 'exclusive') return 'ineligible';
  if (level === 'none' || level === 'minimal') return 'fully_eligible';
  return 'partially_sponsored';
}

/**
 * Get human-readable description of sponsorship level
 */
export function getSponsorshipDescription(level: SponsorshipLevel): string {
  const descriptions: Record<SponsorshipLevel, string> = {
    none: 'No corporate sponsorship',
    minimal: '<$50k/year or volunteer-only support',
    moderate: '$50k-$200k/year or part-time support',
    substantial: '$200k-$500k/year or 1-2 dedicated FTE',
    exclusive: '$500k+/year or 3+ dedicated FTE',
  };

  return descriptions[level];
}

/**
 * Get human-readable description of eligibility status
 */
export function getEligibilityDescription(status: EligibilityStatus): string {
  const descriptions: Record<EligibilityStatus, string> = {
    fully_eligible: 'Fully eligible for RIS-based funding',
    partially_sponsored: 'Eligible with adjusted weighting based on existing support',
    ineligible: 'Ineligible for direct grants (may participate in Strategic Collaboration Program)',
  };

  return descriptions[status];
}

/**
 * Get color/badge info for eligibility status
 */
export function getEligibilityBadgeInfo(status: EligibilityStatus): {
  label: string;
  emoji: string;
  color: 'success' | 'warning' | 'destructive';
} {
  const info: Record<EligibilityStatus, { label: string; emoji: string; color: 'success' | 'warning' | 'destructive' }> = {
    fully_eligible: {
      label: 'Fully Eligible',
      emoji: '✅',
      color: 'success',
    },
    partially_sponsored: {
      label: 'Eligible (Adjusted)',
      emoji: '🟡',
      color: 'warning',
    },
    ineligible: {
      label: 'Ineligible',
      emoji: '❌',
      color: 'destructive',
    },
  };

  return info[status];
}

/**
 * Validate eligibility metadata
 */
export function validateEligibilityMetadata(data: {
  eligibility_status?: EligibilityStatus;
  sponsorship_level?: SponsorshipLevel;
  sponsorship_adjustment?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check adjustment is in valid range
  if (data.sponsorship_adjustment !== undefined) {
    if (data.sponsorship_adjustment < 0 || data.sponsorship_adjustment > 1) {
      errors.push('Sponsorship adjustment must be between 0.0 and 1.0');
    }
  }

  // No other strict validations - let admins set what they need
  // The API will handle consistency (e.g., ineligible status → 0.0 adjustment)

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended sponsorship level based on indicators
 * This is a helper for admins - final decision is manual
 */
export function suggestSponsorshipLevel(indicators: {
  hasFullTimeEngineers?: boolean;
  estimatedAnnualSupport?: number;
  hasExclusiveCorporateControl?: boolean;
  hasDedicatedMarketingBudget?: boolean;
}): SponsorshipLevel {
  if (indicators.hasExclusiveCorporateControl || (indicators.estimatedAnnualSupport && indicators.estimatedAnnualSupport >= 500000)) {
    return 'exclusive';
  }

  if (indicators.hasFullTimeEngineers && indicators.estimatedAnnualSupport && indicators.estimatedAnnualSupport >= 200000) {
    return 'substantial';
  }

  if (indicators.estimatedAnnualSupport && indicators.estimatedAnnualSupport >= 50000) {
    return 'moderate';
  }

  if (indicators.estimatedAnnualSupport && indicators.estimatedAnnualSupport > 0) {
    return 'minimal';
  }

  return 'none';
}
