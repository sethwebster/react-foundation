/**
 * GitHub contribution provider implementation
 */

import type {
  ContributionProvider,
  RepositoryIdentifier,
  UserContributions,
  RepositoryContributions,
} from './base';
import { ProviderError } from './base';

export class GitHubProvider implements ContributionProvider {
  readonly name = 'github';

  canHandle(repo: RepositoryIdentifier): boolean {
    return repo.provider === 'github';
  }

  async fetchUserContributions(
    username: string,
    repo: RepositoryIdentifier,
    accessToken?: string
  ): Promise<UserContributions> {
    if (!this.canHandle(repo)) {
      throw new ProviderError(
        this.name,
        `Cannot handle repository with provider: ${repo.provider}`
      );
    }

    // For now, return zeros - full implementation would use GitHub GraphQL API
    // This will be populated from the existing GitHub query logic
    return {
      pullRequests: 0,
      issues: 0,
      commits: 0,
    };
  }

  async fetchUserContributionsAcrossRepos(
    username: string,
    repos: RepositoryIdentifier[],
    accessToken?: string
  ): Promise<RepositoryContributions[]> {
    const githubRepos = repos.filter((r) => this.canHandle(r));

    if (githubRepos.length === 0) {
      return [];
    }

    // Use GitHub GraphQL API to fetch all contributions at once
    // This is more efficient than individual queries
    const query = this.buildContributionsQuery();

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken || process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          query,
          variables: { username } // Use variables to prevent injection
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return this.parseContributionsResponse(data, githubRepos);
    } catch (error) {
      throw new ProviderError(
        this.name,
        'Failed to fetch GitHub contributions',
        error
      );
    }
  }

  private buildContributionsQuery(): string {
    // Build GraphQL query for user's contribution stats
    // Username is passed as a variable to prevent injection
    return `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalPullRequestContributions
            totalIssueContributions
            totalCommitContributions
            pullRequestContributionsByRepository(maxRepositories: 100) {
              repository {
                owner { login }
                name
              }
              contributions { totalCount }
            }
            issueContributionsByRepository(maxRepositories: 100) {
              repository {
                owner { login }
                name
              }
              contributions { totalCount }
            }
            commitContributionsByRepository(maxRepositories: 100) {
              repository {
                owner { login }
                name
              }
              contributions { totalCount }
            }
          }
        }
      }
    `;
  }

  private parseContributionsResponse(
    data: unknown,
    repos: RepositoryIdentifier[]
  ): RepositoryContributions[] {
    const typedData = data as { data?: { user?: { contributionsCollection?: Record<string, unknown> } } };
    const collection = typedData?.data?.user?.contributionsCollection;

    if (!collection) {
      return [];
    }

    const allowedRepos = new Set(
      repos.map((r) => `${r.owner}/${r.name}`.toLowerCase())
    );

    const contributionsByRepo: Record<string, RepositoryContributions> = {};

    // Aggregate PR contributions
    const prs = collection.pullRequestContributionsByRepository as Array<{
      repository?: { owner?: { login?: string }; name?: string };
      contributions?: { totalCount?: number };
    }> | undefined;
    prs?.forEach((entry) => {
      const owner = entry.repository?.owner?.login;
      const name = entry.repository?.name;
      if (!owner || !name) return;

      const repoKey = `${owner}/${name}`.toLowerCase();
      if (!allowedRepos.has(repoKey)) return;

      if (!contributionsByRepo[repoKey]) {
        contributionsByRepo[repoKey] = {
          repository: `${owner}/${name}`,
          provider: 'github',
          pullRequests: 0,
          issues: 0,
          commits: 0,
        };
      }

      contributionsByRepo[repoKey].pullRequests +=
        entry?.contributions?.totalCount || 0;
    });

    // Aggregate issue contributions
    const issues = collection.issueContributionsByRepository as Array<{
      repository?: { owner?: { login?: string }; name?: string };
      contributions?: { totalCount?: number };
    }> | undefined;
    issues?.forEach((entry) => {
      const owner = entry.repository?.owner?.login;
      const name = entry.repository?.name;
      if (!owner || !name) return;

      const repoKey = `${owner}/${name}`.toLowerCase();
      if (!allowedRepos.has(repoKey)) return;

      if (!contributionsByRepo[repoKey]) {
        contributionsByRepo[repoKey] = {
          repository: `${owner}/${name}`,
          provider: 'github',
          pullRequests: 0,
          issues: 0,
          commits: 0,
        };
      }

      contributionsByRepo[repoKey].issues += entry?.contributions?.totalCount || 0;
    });

    // Aggregate commit contributions
    const commits = collection.commitContributionsByRepository as Array<{
      repository?: { owner?: { login?: string }; name?: string };
      contributions?: { totalCount?: number };
    }> | undefined;
    commits?.forEach((entry) => {
      const owner = entry.repository?.owner?.login;
      const name = entry.repository?.name;
      if (!owner || !name) return;

      const repoKey = `${owner}/${name}`.toLowerCase();
      if (!allowedRepos.has(repoKey)) return;

      if (!contributionsByRepo[repoKey]) {
        contributionsByRepo[repoKey] = {
          repository: `${owner}/${name}`,
          provider: 'github',
          pullRequests: 0,
          issues: 0,
          commits: 0,
        };
      }

      contributionsByRepo[repoKey].commits += entry?.contributions?.totalCount || 0;
    });

    return Object.values(contributionsByRepo);
  }
}
