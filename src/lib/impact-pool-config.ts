/**
 * Impact Pool Configuration
 * Configurable revenue distribution across RIS, CIS, and CoIS
 */

export interface ImpactPoolConfig {
  // Pool splits (must sum to 1.0)
  ris_pool_percent: number; // Library maintainers (default: 0.60)
  cis_pool_percent: number; // Educators (default: 0.24 = 60% of non-RIS)
  cois_pool_percent: number; // Community organizers (default: 0.16 = 40% of non-RIS)

  // Total store profit allocated to impact pools
  total_allocation_percent: number; // Default: 0.20 (20% of store profits)

  // Minimum thresholds
  minimum_quarterly_pool_usd: number; // Don't distribute if below this
}

/**
 * Default configuration
 * 60% RIS, 24% CIS (60% of remaining), 16% CoIS (40% of remaining)
 */
export const DEFAULT_IMPACT_POOL_CONFIG: ImpactPoolConfig = {
  ris_pool_percent: 0.60,
  cis_pool_percent: 0.24, // 60% of 40% = 24%
  cois_pool_percent: 0.16, // 40% of 40% = 16%
  total_allocation_percent: 0.20, // 20% of store profits
  minimum_quarterly_pool_usd: 10_000, // Don't distribute below $10k
};

/**
 * Calculate pool allocations from total store revenue
 */
export function calculatePoolAllocations(
  totalStoreRevenueUsd: number,
  config: ImpactPoolConfig = DEFAULT_IMPACT_POOL_CONFIG
): {
  total_impact_pool: number;
  ris_pool: number;
  cis_pool: number;
  cois_pool: number;
  should_distribute: boolean;
} {
  // Validate config
  const sum = config.ris_pool_percent + config.cis_pool_percent + config.cois_pool_percent;
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(
      `Pool percentages must sum to 1.0, got ${sum}. ` +
        `RIS: ${config.ris_pool_percent}, CIS: ${config.cis_pool_percent}, CoIS: ${config.cois_pool_percent}`
    );
  }

  const total_impact_pool = totalStoreRevenueUsd * config.total_allocation_percent;
  const should_distribute = total_impact_pool >= config.minimum_quarterly_pool_usd;

  return {
    total_impact_pool,
    ris_pool: total_impact_pool * config.ris_pool_percent,
    cis_pool: total_impact_pool * config.cis_pool_percent,
    cois_pool: total_impact_pool * config.cois_pool_percent,
    should_distribute,
  };
}

/**
 * Helper to adjust CIS/CoIS split while keeping RIS constant
 */
export function adjustEducatorOrganizerSplit(
  cisPercent: number, // 0-1, e.g., 0.6 for 60%
  config: ImpactPoolConfig = DEFAULT_IMPACT_POOL_CONFIG
): ImpactPoolConfig {
  const nonRisPool = 1 - config.ris_pool_percent;
  return {
    ...config,
    cis_pool_percent: nonRisPool * cisPercent,
    cois_pool_percent: nonRisPool * (1 - cisPercent),
  };
}

/**
 * Preset configurations for easy switching
 */
export const PRESET_CONFIGS = {
  // Equal split between educators and organizers
  equal_educator_organizer: adjustEducatorOrganizerSplit(0.5),

  // Heavy educator focus (75/25)
  educator_focused: adjustEducatorOrganizerSplit(0.75),

  // Heavy organizer focus (25/75)
  organizer_focused: adjustEducatorOrganizerSplit(0.25),

  // Default (60/40 educator/organizer)
  default: DEFAULT_IMPACT_POOL_CONFIG,
};
