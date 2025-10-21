/**
 * Provider registry and factory
 */

import type { ContributionProvider, RepositoryIdentifier, AggregatedContributions } from './base';
import { GitHubProvider } from './github';
import { GitLabProvider } from './gitlab';

/**
 * Registry of all available contribution providers
 */
class ProviderRegistry {
  private providers: Map<string, ContributionProvider> = new Map();

  constructor() {
    // Register built-in providers
    this.register(new GitHubProvider());
    this.register(new GitLabProvider());
  }

  /**
   * Register a new provider
   */
  register(provider: ContributionProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get provider by name
   */
  get(name: string): ContributionProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get provider that can handle the given repository
   */
  getForRepository(repo: RepositoryIdentifier): ContributionProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.canHandle(repo)) {
        return provider;
      }
    }
    return undefined;
  }

  /**
   * Get all registered providers
   */
  getAll(): ContributionProvider[] {
    return Array.from(this.providers.values());
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();

/**
 * Fetch user contributions across multiple repositories and providers
 */
export async function fetchAggregatedContributions(
  username: string,
  repos: RepositoryIdentifier[],
  accessToken?: string,
  weights = { pullRequests: 8, issues: 3, commits: 1 }
): Promise<AggregatedContributions> {
  // Group repositories by provider
  const reposByProvider = new Map<string, RepositoryIdentifier[]>();

  for (const repo of repos) {
    const provider = providerRegistry.getForRepository(repo);
    if (!provider) {
      console.warn(`No provider found for repository: ${repo.owner}/${repo.name} (${repo.provider})`);
      continue;
    }

    if (!reposByProvider.has(provider.name)) {
      reposByProvider.set(provider.name, []);
    }

    reposByProvider.get(provider.name)!.push(repo);
  }

  // Fetch from all providers in parallel
  const contributionPromises = Array.from(reposByProvider.entries()).map(
    async ([providerName, providerRepos]) => {
      const provider = providerRegistry.get(providerName);
      if (!provider) return [];

      try {
        return await provider.fetchUserContributionsAcrossRepos(
          username,
          providerRepos,
          accessToken
        );
      } catch (error) {
        console.error(`Error fetching from ${providerName}:`, error);
        return [];
      }
    }
  );

  const allContributions = (await Promise.all(contributionPromises)).flat();

  // Aggregate totals
  const totals = allContributions.reduce(
    (acc, repo) => {
      acc.pullRequests += repo.pullRequests;
      acc.issues += repo.issues;
      acc.commits += repo.commits;
      return acc;
    },
    { pullRequests: 0, issues: 0, commits: 0 }
  );

  // Calculate score
  const score =
    totals.pullRequests * weights.pullRequests +
    totals.issues * weights.issues +
    totals.commits * weights.commits;

  return {
    ...totals,
    score,
    perRepository: allContributions.sort(
      (a, b) =>
        b.pullRequests + b.issues + b.commits - (a.pullRequests + a.issues + a.commits)
    ),
  };
}
