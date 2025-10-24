/**
 * Community Impact Score (CoIS) - Main Export
 */

export type {
  OrganizerRawMetrics,
  OrganizerNormalizedMetrics,
  CoISComponentScores,
  OrganizerScore,
  QuarterlyCoISAllocation,
  CoISComponentWeights,
  CoISConfig,
} from './types';

export {
  DEFAULT_COIS_CONFIG,
  ERF_WEIGHTS,
  CH_WEIGHTS,
  CQ_WEIGHTS,
  EG_WEIGHTS,
  S_WEIGHTS,
} from './types';

export { CoISScoringService } from './scoring-service';
export { MOCK_ORGANIZERS } from './mock-data';
export {
  useCoISScores,
  useCoISAllocation,
  useOrganizerScore,
  useOrganizerTier,
} from './hooks';
