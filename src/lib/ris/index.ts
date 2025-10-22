/**
 * React Impact Score (RIS) System
 * Main export file for the RIS module
 */

// Types
export type {
  LibraryRawMetrics,
  LibraryNormalizedMetrics,
  ComponentScores,
  LibraryScore,
  QuarterlyAllocation,
  ComponentWeights,
  RISConfig,
} from './types';

export {
  DEFAULT_RIS_CONFIG,
  EF_WEIGHTS,
  CQ_WEIGHTS,
  MH_WEIGHTS,
  CB_WEIGHTS,
  MA_WEIGHTS,
} from './types';

// Normalization utilities
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
} from './normalization';

// Scoring service
export { RISScoringService } from './scoring-service';

// Hooks
export {
  useRISScores,
  useQuarterlyAllocation,
  useLibraryScore,
  useRISRankings,
  useRISFiltered,
  useRISByCategory,
  useComponentStats,
  useSampleRISData,
  useInteractiveRIS,
  // API-based hooks (real data)
  useRISAllocationFromAPI,
  useCollectionStatus,
  useCollectRISData,
  // Utilities
  formatRIS,
  formatAllocation,
  getRISColorClass,
  getComponentColorClass,
} from './hooks';

export type { CategoryStats, ComponentStats } from './hooks';

// Mock data
export { SAMPLE_RAW_METRICS, generateMockMetricsWithVariance } from './mock-data';
