/**
 * React hook for filing GitHub issues via bot
 *
 * Provides a simple interface for components to file issues
 * without requiring users to grant public_repo OAuth scope.
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export interface FileIssueParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

export interface FileIssueResult {
  number: number;
  url: string;
}

export interface UseGitHubBotReturn {
  fileIssue: (params: FileIssueParams) => Promise<FileIssueResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for filing GitHub issues via bot
 *
 * @example
 * ```tsx
 * function IssueForm() {
 *   const { fileIssue, isLoading, error } = useGitHubBot();
 *
 *   async function handleSubmit(e: FormEvent) {
 *     e.preventDefault();
 *     const issue = await fileIssue({
 *       owner: 'facebook',
 *       repo: 'react',
 *       title: 'Bug report',
 *       body: 'Description...'
 *     });
 *     console.log('Filed issue:', issue.url);
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div>Error: {error}</div>}
 *       <button disabled={isLoading}>File Issue</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useGitHubBot(): UseGitHubBotReturn {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fileIssue(params: FileIssueParams): Promise<FileIssueResult> {
    // Check authentication
    if (status === 'unauthenticated' || !session) {
      const authError = 'You must be logged in to file issues';
      setError(authError);
      throw new Error(authError);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bot/file-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Failed to file issue';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      return data.issue;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    fileIssue,
    isLoading,
    error,
  };
}
