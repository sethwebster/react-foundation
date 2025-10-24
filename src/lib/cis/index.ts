/**
 * Content Impact Score (CIS) - Main Export
 */

// Types
export type {
  EducatorRawMetrics,
  EducatorNormalizedMetrics,
  CISComponentScores,
  EducatorScore,
  QuarterlyCISAllocation,
  CISComponentWeights,
  CISConfig,
} from './types';

export {
  DEFAULT_CIS_CONFIG,
  ER_WEIGHTS,
  CQC_WEIGHTS,
  LO_WEIGHTS,
  CTI_WEIGHTS,
  CL_WEIGHTS,
} from './types';

// Scoring Service
export { CISScoringService } from './scoring-service';

// Normalization (re-exported for convenience)
export {
  normalizeMetric,
  normalizeAccuracyReportRatio,
  calculateContentFreshness,
  calculateGeographicDiversity,
} from './normalization';

// Mock Data
export { MOCK_EDUCATORS, generateMockQuarterlyAllocation } from './mock-data';

// Hooks
export {
  useCISScores,
  useCISAllocation,
  useEducatorScore,
  useEducatorTier,
} from './hooks';
