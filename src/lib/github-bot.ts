/**
 * GitHub Bot Service
 *
 * This service uses a dedicated bot account to perform write operations
 * on behalf of users, reducing OAuth scope requirements.
 *
 * Users only need read:user and user:email scopes.
 * Bot handles all write operations (issues, PRs, comments).
 */

import { Octokit } from '@octokit/rest';
import { getOptionalEnvVar } from './env';

/**
 * Get Octokit instance authenticated as the bot
 */
function getBotOctokit(): Octokit {
  const botToken = getOptionalEnvVar('GITHUB_BOT_TOKEN');

  if (!botToken) {
    throw new Error(
      'GITHUB_BOT_TOKEN is not configured. Please set up a bot account and add the token to your environment variables.'
    );
  }

  return new Octokit({ auth: botToken });
}

/**
 * Issue filing parameters
 */
export interface FileIssueParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  filedBy?: {
    username: string;
    name?: string;
  };
}

/**
 * Filed issue response
 */
export interface FiledIssueResult {
  number: number;
  url: string;
  html_url: string;
}

/**
 * File an issue on behalf of a user
 *
 * @param params Issue parameters including optional user attribution
 * @returns The created issue details
 *
 * @example
 * ```typescript
 * const issue = await fileIssue({
 *   owner: 'facebook',
 *   repo: 'react',
 *   title: 'Bug: useEffect runs twice',
 *   body: 'Description of the bug...',
 *   filedBy: {
 *     username: 'johndoe',
 *     name: 'John Doe'
 *   }
 * });
 * ```
 */
export async function fileIssue(params: FileIssueParams): Promise<FiledIssueResult> {
  const octokit = getBotOctokit();

  // Build the issue body with attribution
  let issueBody = '';

  if (params.filedBy) {
    issueBody = `> **Filed by [@${params.filedBy.username}](https://github.com/${params.filedBy.username})** via [React Foundation Store](https://react.foundation)\n\n`;
  }

  issueBody += params.body;

  // Create the issue
  const response = await octokit.rest.issues.create({
    owner: params.owner,
    repo: params.repo,
    title: params.title,
    body: issueBody,
    labels: params.labels,
    assignees: params.assignees,
  });

  return {
    number: response.data.number,
    url: response.data.url,
    html_url: response.data.html_url,
  };
}

/**
 * Comment parameters
 */
export interface AddCommentParams {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
  commentBy?: {
    username: string;
    name?: string;
  };
}

/**
 * Add a comment to an existing issue on behalf of a user
 *
 * @param params Comment parameters including optional user attribution
 * @returns The created comment details
 */
export async function addComment(params: AddCommentParams) {
  const octokit = getBotOctokit();

  // Build the comment body with attribution
  let commentBody = '';

  if (params.commentBy) {
    commentBody = `> **Comment by [@${params.commentBy.username}](https://github.com/${params.commentBy.username})**\n\n`;
  }

  commentBody += params.body;

  // Create the comment
  const response = await octokit.rest.issues.createComment({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issue_number,
    body: commentBody,
  });

  return {
    id: response.data.id,
    url: response.data.url,
    html_url: response.data.html_url,
  };
}

/**
 * Check if the bot token is configured
 */
export function isBotConfigured(): boolean {
  return !!getOptionalEnvVar('GITHUB_BOT_TOKEN');
}

/**
 * Get bot account information
 */
export async function getBotInfo() {
  const octokit = getBotOctokit();
  const response = await octokit.rest.users.getAuthenticated();

  return {
    login: response.data.login,
    name: response.data.name,
    avatar_url: response.data.avatar_url,
    html_url: response.data.html_url,
  };
}
