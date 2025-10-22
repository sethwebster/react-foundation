/**
 * Mock data for RIS system testing
 * Generates realistic sample metrics for popular React libraries
 */

import type { LibraryRawMetrics } from './types';

/**
 * Sample raw metrics for popular React ecosystem libraries
 * Based on realistic ranges from actual library data
 */
export const SAMPLE_RAW_METRICS: LibraryRawMetrics[] = [
  {
    libraryName: 'react',
    owner: 'facebook',
    repo: 'react',
    collected_at: new Date().toISOString(),
    // EF - Very high (most popular)
    npm_downloads: 550_000_000,
    gh_dependents: 18_500_000,
    import_mentions: 8_500,
    cdn_hits: 125_000_000,
    // CQ - High quality
    pr_points: 12_500,
    issue_resolution_rate: 0.78,
    median_first_response_hours: 8,
    unique_contribs: 1_580,
    // MH - Very healthy
    active_maintainers: 45,
    release_cadence_days: 28,
    top_author_share: 0.18,
    triage_latency_hours: 4,
    maintainer_survey: 0.92,
    // CB - Excellent docs
    docs_completeness: 0.95,
    tutorials_refs: 15_000,
    helpful_events: 85_000,
    user_satisfaction: 0.89,
    // MA - Strong alignment
    a11y_advances: 1,
    perf_concurrency_support: 1,
    typescript_strictness: 0.95,
    rsc_compat_progress: 1,
    security_practices: 0.88,
  },
  {
    libraryName: 'next.js',
    owner: 'vercel',
    repo: 'next.js',
    collected_at: new Date().toISOString(),
    // EF - Very high
    npm_downloads: 180_000_000,
    gh_dependents: 1_250_000,
    import_mentions: 4_200,
    cdn_hits: 28_000_000,
    // CQ
    pr_points: 9_800,
    issue_resolution_rate: 0.72,
    median_first_response_hours: 12,
    unique_contribs: 2_420,
    // MH
    active_maintainers: 32,
    release_cadence_days: 14,
    top_author_share: 0.22,
    triage_latency_hours: 6,
    maintainer_survey: 0.88,
    // CB
    docs_completeness: 0.93,
    tutorials_refs: 8_500,
    helpful_events: 42_000,
    user_satisfaction: 0.91,
    // MA
    a11y_advances: 0.8,
    perf_concurrency_support: 0.95,
    typescript_strictness: 0.98,
    rsc_compat_progress: 1,
    security_practices: 0.85,
  },
  {
    libraryName: 'react-router',
    owner: 'remix-run',
    repo: 'react-router',
    collected_at: new Date().toISOString(),
    // EF
    npm_downloads: 132_000_000,
    gh_dependents: 780_000,
    import_mentions: 2_150,
    cdn_hits: 18_500_000,
    // CQ
    pr_points: 4_382,
    issue_resolution_rate: 0.76,
    median_first_response_hours: 9,
    unique_contribs: 324,
    // MH
    active_maintainers: 8,
    release_cadence_days: 38,
    top_author_share: 0.33,
    triage_latency_hours: 6,
    maintainer_survey: 0.78,
    // CB
    docs_completeness: 0.86,
    tutorials_refs: 3_240,
    helpful_events: 18_100,
    user_satisfaction: 0.82,
    // MA
    a11y_advances: 0.7,
    perf_concurrency_support: 0.75,
    typescript_strictness: 0.92,
    rsc_compat_progress: 0.6,
    security_practices: 0.82,
  },
  {
    libraryName: 'redux',
    owner: 'reduxjs',
    repo: 'redux',
    collected_at: new Date().toISOString(),
    // EF
    npm_downloads: 95_000_000,
    gh_dependents: 1_420_000,
    import_mentions: 3_800,
    cdn_hits: 14_200_000,
    // CQ
    pr_points: 3_250,
    issue_resolution_rate: 0.81,
    median_first_response_hours: 15,
    unique_contribs: 412,
    // MH
    active_maintainers: 6,
    release_cadence_days: 45,
    top_author_share: 0.38,
    triage_latency_hours: 8,
    maintainer_survey: 0.75,
    // CB
    docs_completeness: 0.91,
    tutorials_refs: 6_800,
    helpful_events: 32_000,
    user_satisfaction: 0.78,
    // MA
    a11y_advances: 0,
    perf_concurrency_support: 0.5,
    typescript_strictness: 0.95,
    rsc_compat_progress: 0.3,
    security_practices: 0.79,
  },
  {
    libraryName: 'zustand',
    collected_at: new Date().toISOString(),
    owner: 'pmndrs',
    repo: 'zustand',
    // EF - Growing
    npm_downloads: 18_500_000,
    gh_dependents: 85_000,
    import_mentions: 420,
    cdn_hits: 2_100_000,
    // CQ
    pr_points: 1_820,
    issue_resolution_rate: 0.88,
    median_first_response_hours: 6,
    unique_contribs: 156,
    // MH - Very healthy
    active_maintainers: 4,
    release_cadence_days: 21,
    top_author_share: 0.42,
    triage_latency_hours: 3,
    maintainer_survey: 0.91,
    // CB
    docs_completeness: 0.82,
    tutorials_refs: 850,
    helpful_events: 4_200,
    user_satisfaction: 0.92,
    // MA
    a11y_advances: 0,
    perf_concurrency_support: 0.8,
    typescript_strictness: 1,
    rsc_compat_progress: 0.9,
    security_practices: 0.76,
  },
  {
    libraryName: 'query',
    collected_at: new Date().toISOString(),
    owner: 'TanStack',
    repo: 'query',
    // EF
    npm_downloads: 72_000_000,
    gh_dependents: 320_000,
    import_mentions: 1_850,
    cdn_hits: 9_800_000,
    // CQ
    pr_points: 5_600,
    issue_resolution_rate: 0.79,
    median_first_response_hours: 7,
    unique_contribs: 285,
    // MH
    active_maintainers: 12,
    release_cadence_days: 18,
    top_author_share: 0.28,
    triage_latency_hours: 4,
    maintainer_survey: 0.87,
    // CB
    docs_completeness: 0.94,
    tutorials_refs: 4_200,
    helpful_events: 22_500,
    user_satisfaction: 0.93,
    // MA
    a11y_advances: 0,
    perf_concurrency_support: 0.85,
    typescript_strictness: 1,
    rsc_compat_progress: 0.85,
    security_practices: 0.81,
  },
  {
    libraryName: 'material-ui',
    collected_at: new Date().toISOString(),
    owner: 'mui',
    repo: 'material-ui',
    // EF
    npm_downloads: 88_000_000,
    gh_dependents: 1_850_000,
    import_mentions: 2_900,
    cdn_hits: 12_400_000,
    // CQ
    pr_points: 7_200,
    issue_resolution_rate: 0.68,
    median_first_response_hours: 18,
    unique_contribs: 2_180,
    // MH
    active_maintainers: 18,
    release_cadence_days: 7,
    top_author_share: 0.15,
    triage_latency_hours: 12,
    maintainer_survey: 0.82,
    // CB
    docs_completeness: 0.96,
    tutorials_refs: 9_800,
    helpful_events: 48_000,
    user_satisfaction: 0.86,
    // MA
    a11y_advances: 1,
    perf_concurrency_support: 0.7,
    typescript_strictness: 0.98,
    rsc_compat_progress: 0.7,
    security_practices: 0.84,
  },
  {
    libraryName: 'framer-motion',
    collected_at: new Date().toISOString(),
    owner: 'framer',
    repo: 'motion',
    // EF
    npm_downloads: 48_000_000,
    gh_dependents: 185_000,
    import_mentions: 1_240,
    cdn_hits: 6_200_000,
    // CQ
    pr_points: 2_850,
    issue_resolution_rate: 0.74,
    median_first_response_hours: 14,
    unique_contribs: 198,
    // MH
    active_maintainers: 5,
    release_cadence_days: 32,
    top_author_share: 0.45,
    triage_latency_hours: 9,
    maintainer_survey: 0.79,
    // CB
    docs_completeness: 0.89,
    tutorials_refs: 2_400,
    helpful_events: 12_800,
    user_satisfaction: 0.90,
    // MA
    a11y_advances: 0.6,
    perf_concurrency_support: 0.9,
    typescript_strictness: 0.96,
    rsc_compat_progress: 0.5,
    security_practices: 0.77,
  },
  {
    libraryName: 'vitest',
    collected_at: new Date().toISOString(),
    owner: 'vitest-dev',
    repo: 'vitest',
    // EF
    npm_downloads: 42_000_000,
    gh_dependents: 125_000,
    import_mentions: 980,
    cdn_hits: 1_200_000,
    // CQ
    pr_points: 4_100,
    issue_resolution_rate: 0.84,
    median_first_response_hours: 5,
    unique_contribs: 342,
    // MH
    active_maintainers: 14,
    release_cadence_days: 12,
    top_author_share: 0.24,
    triage_latency_hours: 3,
    maintainer_survey: 0.93,
    // CB
    docs_completeness: 0.92,
    tutorials_refs: 1_850,
    helpful_events: 8_900,
    user_satisfaction: 0.94,
    // MA
    a11y_advances: 0,
    perf_concurrency_support: 1,
    typescript_strictness: 1,
    rsc_compat_progress: 0.4,
    security_practices: 0.83,
  },
  {
    libraryName: 'storybook',
    collected_at: new Date().toISOString(),
    owner: 'storybookjs',
    repo: 'storybook',
    // EF
    npm_downloads: 65_000_000,
    gh_dependents: 420_000,
    import_mentions: 2_100,
    cdn_hits: 4_800_000,
    // CQ
    pr_points: 8_900,
    issue_resolution_rate: 0.71,
    median_first_response_hours: 11,
    unique_contribs: 1_820,
    // MH
    active_maintainers: 22,
    release_cadence_days: 10,
    top_author_share: 0.19,
    triage_latency_hours: 7,
    maintainer_survey: 0.85,
    // CB
    docs_completeness: 0.94,
    tutorials_refs: 5_600,
    helpful_events: 28_000,
    user_satisfaction: 0.88,
    // MA
    a11y_advances: 0.9,
    perf_concurrency_support: 0.6,
    typescript_strictness: 0.94,
    rsc_compat_progress: 0.75,
    security_practices: 0.81,
  },
];

/**
 * Generate a random realistic variance on a base metric
 * Used to create variations for testing
 */
function randomVariance(base: number, variancePercent: number = 0.2): number {
  const variance = base * variancePercent;
  return Math.max(0, base + (Math.random() - 0.5) * 2 * variance);
}

/**
 * Generate mock metrics with random variance for testing
 */
export function generateMockMetricsWithVariance(
  baseName: string = 'test-library',
  baseMetrics: Partial<LibraryRawMetrics> = {}
): LibraryRawMetrics {
  const defaults: LibraryRawMetrics = {
    libraryName: baseName,
    owner: 'test-org',
    repo: baseName,
    collected_at: new Date().toISOString(),
    npm_downloads: randomVariance(10_000_000),
    gh_dependents: randomVariance(50_000),
    import_mentions: randomVariance(500),
    cdn_hits: randomVariance(1_000_000),
    pr_points: randomVariance(1_000),
    issue_resolution_rate: Math.min(1, Math.max(0, 0.7 + (Math.random() - 0.5) * 0.4)),
    median_first_response_hours: randomVariance(12, 0.5),
    unique_contribs: randomVariance(100),
    active_maintainers: Math.max(1, Math.floor(randomVariance(5, 0.6))),
    release_cadence_days: randomVariance(30, 0.5),
    top_author_share: Math.min(1, Math.max(0, 0.3 + (Math.random() - 0.5) * 0.4)),
    triage_latency_hours: randomVariance(8, 0.6),
    maintainer_survey: Math.min(1, Math.max(0, 0.8 + (Math.random() - 0.5) * 0.3)),
    docs_completeness: Math.min(1, Math.max(0, 0.75 + (Math.random() - 0.5) * 0.4)),
    tutorials_refs: randomVariance(1_000),
    helpful_events: randomVariance(5_000),
    user_satisfaction: Math.min(1, Math.max(0, 0.8 + (Math.random() - 0.5) * 0.3)),
    a11y_advances: Math.random() > 0.5 ? 1 : 0,
    perf_concurrency_support: Math.min(1, Math.max(0, 0.6 + (Math.random() - 0.5) * 0.6)),
    typescript_strictness: Math.min(1, Math.max(0, 0.8 + (Math.random() - 0.5) * 0.3)),
    rsc_compat_progress: Math.min(1, Math.max(0, 0.5 + (Math.random() - 0.5) * 0.8)),
    security_practices: Math.min(1, Math.max(0, 0.75 + (Math.random() - 0.5) * 0.4)),
  };

  return { ...defaults, ...baseMetrics };
}
