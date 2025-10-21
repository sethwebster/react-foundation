/**
 * React Impact Score (RIS) - Normalization Utilities
 * Implements winsorization, min-max normalization, and logarithmic transformations
 */

// ============================================================================
// Statistical Utilities
// ============================================================================

/**
 * Calculate percentile value from sorted array
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sortedValues[lower];
  }

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Winsorize a dataset at the specified lower and upper percentiles
 * Caps extreme values to reduce impact of outliers
 *
 * @param values - Array of values to winsorize
 * @param lowerPercentile - Lower percentile (default: 0.05 for 5th percentile)
 * @param upperPercentile - Upper percentile (default: 0.95 for 95th percentile)
 * @returns Winsorized array
 */
export function winsorize(
  values: number[],
  lowerPercentile: number = 0.05,
  upperPercentile: number = 0.95
): number[] {
  if (values.length === 0) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const lowerBound = percentile(sorted, lowerPercentile);
  const upperBound = percentile(sorted, upperPercentile);

  return values.map((v) => {
    if (v < lowerBound) return lowerBound;
    if (v > upperBound) return upperBound;
    return v;
  });
}

/**
 * Min-max normalization to [0, 1] range
 * Handles the case where all values are the same
 *
 * @param values - Array of values to normalize
 * @returns Normalized array with values in [0, 1]
 */
export function minMaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  // If all values are the same, return array of 0.5 (middle of range)
  if (min === max) {
    return values.map(() => 0.5);
  }

  return values.map((v) => (v - min) / (max - min));
}

/**
 * Logarithmic transformation followed by min-max normalization
 * Used for highly skewed distributions (downloads, dependents, etc.)
 *
 * Formula: norm(log10(1 + x))
 *
 * @param values - Array of values to transform
 * @returns Normalized logarithmic values in [0, 1]
 */
export function logNormalize(values: number[]): number[] {
  if (values.length === 0) return [];

  // Apply log10(1 + x) transformation to handle zeros
  const logValues = values.map((v) => Math.log10(1 + Math.max(0, v)));

  // Then normalize to [0, 1]
  return minMaxNormalize(logValues);
}

/**
 * Normalize a single value against a cohort using the same min-max logic
 * Useful for normalizing new values against existing distributions
 *
 * @param value - Value to normalize
 * @param cohortMin - Minimum value from the cohort
 * @param cohortMax - Maximum value from the cohort
 * @returns Normalized value in [0, 1]
 */
export function normalizeValue(
  value: number,
  cohortMin: number,
  cohortMax: number
): number {
  if (cohortMin === cohortMax) return 0.5;
  return Math.max(0, Math.min(1, (value - cohortMin) / (cohortMax - cohortMin)));
}

/**
 * Calculate median value from an array
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Get median value for imputation when data is missing
 * Used to replace missing values with cohort median instead of zero
 *
 * @param values - Array of values
 * @param excludeZeros - Whether to exclude zeros when calculating median
 * @returns Median value
 */
export function getMedianForImputation(
  values: number[],
  excludeZeros: boolean = true
): number {
  const filtered = excludeZeros ? values.filter((v) => v > 0) : values;
  return median(filtered);
}

// ============================================================================
// Batch Normalization
// ============================================================================

/**
 * Normalize multiple metrics across a cohort of libraries
 * Applies winsorization followed by appropriate normalization
 */
export interface NormalizationResult {
  normalized: number[];
  min: number;
  max: number;
  median: number;
}

/**
 * Normalize a metric across all libraries with winsorization
 *
 * @param values - Metric values for all libraries
 * @param method - Normalization method: 'linear', 'log', or 'none'
 * @param lowerPercentile - Lower percentile for winsorization
 * @param upperPercentile - Upper percentile for winsorization
 * @returns Normalization result with stats
 */
export function normalizeMetric(
  values: number[],
  method: 'linear' | 'log' | 'none' = 'linear',
  lowerPercentile: number = 0.05,
  upperPercentile: number = 0.95
): NormalizationResult {
  if (values.length === 0) {
    return { normalized: [], min: 0, max: 0, median: 0 };
  }

  // Step 1: Winsorize to reduce outlier impact
  const winsorized = winsorize(values, lowerPercentile, upperPercentile);

  // Step 2: Apply normalization method
  let normalized: number[];
  switch (method) {
    case 'log':
      normalized = logNormalize(winsorized);
      break;
    case 'linear':
      normalized = minMaxNormalize(winsorized);
      break;
    case 'none':
      normalized = winsorized;
      break;
  }

  return {
    normalized,
    min: Math.min(...winsorized),
    max: Math.max(...winsorized),
    median: median(winsorized),
  };
}

/**
 * Invert normalized values (for metrics where lower is better)
 * Used for: release_cadence, top_author_share, response times, etc.
 *
 * @param normalizedValues - Array of normalized values in [0, 1]
 * @returns Inverted values where 1 - x
 */
export function invertNormalized(normalizedValues: number[]): number[] {
  return normalizedValues.map((v) => 1 - v);
}

/**
 * Clamp a value to [0, 1] range
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Apply EMA (Exponential Moving Average) smoothing for quarter-to-quarter stability
 * Formula: FinalRIS = α × RIS_current + (1-α) × RIS_previous
 *
 * @param currentValue - Current quarter's RIS
 * @param previousValue - Previous quarter's RIS (if exists)
 * @param alpha - Weight for current value (default: 0.7)
 * @returns Smoothed RIS value
 */
export function emaSmoothing(
  currentValue: number,
  previousValue: number | undefined,
  alpha: number = 0.7
): number {
  if (previousValue === undefined) {
    return currentValue;
  }

  return alpha * currentValue + (1 - alpha) * previousValue;
}
