/**
 * Base abstraction for contribution providers (GitHub, GitLab, etc.)
 */

export type RepositoryIdentifier = {
  provider: 'github' | 'gitlab' | 'bitbucket' | 'gitea';
  owner: string;
  name: string;
};

export type UserContributions = {
  pullRequests: number;
  issues: number;
  commits: number;
};

export type RepositoryContributions = {
  repository: string; // "owner/name"
  provider: string;
  pullRequests: number;
  issues: number;
  commits: number;
};

export type AggregatedContributions = {
  pullRequests: number;
  issues: number;
  commits: number;
  score: number;
  perRepository: RepositoryContributions[];
};

/**
 * Base interface that all contribution providers must implement
 */
export interface ContributionProvider {
  /**
   * Provider identifier (github, gitlab, etc.)
   */
  readonly name: string;

  /**
   * Fetch user's contributions to a specific repository
   */
  fetchUserContributions(
    username: string,
    repo: RepositoryIdentifier,
    accessToken?: string
  ): Promise<UserContributions>;

  /**
   * Fetch user's contributions across multiple repositories
   * Returns contributions grouped by repository
   */
  fetchUserContributionsAcrossRepos(
    username: string,
    repos: RepositoryIdentifier[],
    accessToken?: string
  ): Promise<RepositoryContributions[]>;

  /**
   * Check if this provider can handle the given repository
   */
  canHandle(repo: RepositoryIdentifier): boolean;
}

/**
 * Base error class for provider errors
 */
export class ProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public cause?: unknown
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'ProviderError';
  }
}
