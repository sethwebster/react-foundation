/**
 * Content Impact Score (CIS) - Normalization Utilities
 * Reuses RIS normalization utilities as they are generic statistical functions
 */

// Re-export all normalization utilities from RIS (they are generic)
export {
  winsorize,
  minMaxNormalize,
  logNormalize,
  normalizeValue,
  median,
  getMedianForImputation,
  normalizeMetric,
  invertNormalized,
  clamp01,
  emaSmoothing,
  type NormalizationResult,
} from '../ris/normalization';

/**
 * CIS-specific helper: Normalize accuracy report ratio (inverted - lower is better)
 * Since fewer accuracy reports = better quality content
 *
 * @param ratios - Array of accuracy_report_ratio values
 * @returns Normalized and inverted values where higher is better
 */
export function normalizeAccuracyReportRatio(ratios: number[]): number[] {
  if (ratios.length === 0) return [];

  // First normalize to [0, 1]
  const normalized = minMaxNormalize(ratios);

  // Then invert (fewer reports = higher score)
  return invertNormalized(normalized);
}

/**
 * CIS-specific helper: Calculate content freshness score
 * Measures how well content is kept up-to-date with latest React versions
 *
 * @param updateCount - Number of content pieces updated for latest React
 * @param totalContent - Total number of content pieces
 * @returns Score from 0-1
 */
export function calculateContentFreshness(
  updateCount: number,
  totalContent: number
): number {
  if (totalContent === 0) return 0;
  return clamp01(updateCount / totalContent);
}

/**
 * CIS-specific helper: Calculate geographic diversity score
 * More countries reached = higher score, with logarithmic scaling
 *
 * @param countryCount - Number of countries reached
 * @returns Score from 0-1 (normalized against cohort)
 */
export function calculateGeographicDiversity(countryCounts: number[]): number[] {
  return logNormalize(countryCounts);
}

import { minMaxNormalize, invertNormalized, clamp01, logNormalize } from '../ris/normalization';
