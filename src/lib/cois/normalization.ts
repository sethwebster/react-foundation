/**
 * Community Impact Score (CoIS) - Normalization Utilities
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
 * CoIS-specific helper: Calculate diversity index
 * Combines gender, ethnic, and background diversity into single score
 *
 * @param genderDiversity - Gender diversity (0-1)
 * @param ethnicDiversity - Ethnic diversity (0-1)
 * @param backgroundDiversity - Professional background diversity (0-1)
 * @returns Combined diversity index (0-1)
 */
export function calculateDiversityIndex(
  genderDiversity: number,
  ethnicDiversity: number,
  backgroundDiversity: number
): number {
  // Weighted average: gender and ethnic are more important
  return clamp01(
    0.4 * genderDiversity + 0.4 * ethnicDiversity + 0.2 * backgroundDiversity
  );
}

/**
 * CoIS-specific helper: Calculate speaker seniority score
 * Balance of junior and senior speakers (U-shaped: too few juniors OR seniors is bad)
 *
 * @param juniorSpeakerRatio - Ratio of junior speakers (0-1)
 * @returns Score where 0.4-0.6 junior ratio is optimal
 */
export function calculateSpeakerSeniorityScore(
  juniorSpeakerRatio: number
): number {
  // Optimal range: 40-60% junior speakers
  // Penalize both extremes (all senior or all junior)
  const optimal = 0.5;
  const distance = Math.abs(juniorSpeakerRatio - optimal);
  return clamp01(1 - distance * 2); // Max penalty at 0.5 distance
}

import { clamp01 } from '../ris/normalization';
