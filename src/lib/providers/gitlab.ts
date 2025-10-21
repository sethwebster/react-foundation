/**
 * GitLab contribution provider implementation
 */

import type {
  ContributionProvider,
  RepositoryIdentifier,
  UserContributions,
  RepositoryContributions,
} from './base';
import { ProviderError } from './base';

export class GitLabProvider implements ContributionProvider {
  readonly name = 'gitlab';

  canHandle(repo: RepositoryIdentifier): boolean {
    return repo.provider === 'gitlab';
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

    // GitLab API implementation
    // For now, return zeros - will implement GitLab REST API calls
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
    const gitlabRepos = repos.filter((r) => this.canHandle(r));

    if (gitlabRepos.length === 0) {
      return [];
    }

    try {
      // Fetch contributions for each GitLab repo
      // GitLab doesn't have a single query like GitHub GraphQL,
      // so we need to make individual API calls

      const contributions: RepositoryContributions[] = [];

      for (const repo of gitlabRepos) {
        const repoPath = `${repo.owner}/${repo.name}`;

        // Fetch merge requests (GitLab's equivalent of pull requests)
        const mrs = await this.fetchMergeRequests(username, repoPath, accessToken);

        // Fetch issues
        const issues = await this.fetchIssues(username, repoPath, accessToken);

        // Fetch commits
        const commits = await this.fetchCommits(username, repoPath, accessToken);

        contributions.push({
          repository: repoPath,
          provider: 'gitlab',
          pullRequests: mrs,
          issues,
          commits,
        });
      }

      return contributions;
    } catch (error) {
      throw new ProviderError(
        this.name,
        'Failed to fetch GitLab contributions',
        error
      );
    }
  }

  private async fetchMergeRequests(
    username: string,
    repoPath: string,
    accessToken?: string
  ): Promise<number> {
    // GitLab API: GET /projects/:id/merge_requests?author_username=:username&state=all
    // For now, return 0 - will implement full API call
    return 0;
  }

  private async fetchIssues(
    username: string,
    repoPath: string,
    accessToken?: string
  ): Promise<number> {
    // GitLab API: GET /projects/:id/issues?author_username=:username&state=all
    // For now, return 0 - will implement full API call
    return 0;
  }

  private async fetchCommits(
    username: string,
    repoPath: string,
    accessToken?: string
  ): Promise<number> {
    // GitLab API: GET /projects/:id/repository/commits?author=:username
    // For now, return 0 - will implement full API call
    return 0;
  }
}
