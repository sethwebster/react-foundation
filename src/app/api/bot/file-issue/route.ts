/**
 * API endpoint for filing GitHub issues via bot
 *
 * POST /api/bot/file-issue
 *
 * This endpoint allows authenticated users to file issues on GitHub
 * without needing write permissions. The bot account handles the actual
 * issue creation and attributes it to the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { fileIssue, isBotConfigured } from '@/lib/github-bot';

export async function POST(request: NextRequest) {
  try {
    // Check if bot is configured
    if (!isBotConfigured()) {
      return NextResponse.json(
        {
          error: 'Bot is not configured',
          message: 'GITHUB_BOT_TOKEN is not set. Please configure a bot account.',
        },
        { status: 503 }
      );
    }

    // Check authentication
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to file issues.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { owner, repo, title, body: issueBody, labels, assignees } = body;

    // Validate required fields
    if (!owner || typeof owner !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Owner is required' },
        { status: 400 }
      );
    }

    if (!repo || typeof repo !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Repository is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Title is required' },
        { status: 400 }
      );
    }

    if (title.length > 256) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Title is too long (max 256 characters)' },
        { status: 400 }
      );
    }

    if (!issueBody || typeof issueBody !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Body is required' },
        { status: 400 }
      );
    }

    // Validate optional arrays
    if (labels && !Array.isArray(labels)) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Labels must be an array' },
        { status: 400 }
      );
    }

    if (assignees && !Array.isArray(assignees)) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Assignees must be an array' },
        { status: 400 }
      );
    }

    // File the issue via bot
    const issue = await fileIssue({
      owner,
      repo,
      title,
      body: issueBody,
      labels,
      assignees,
      filedBy: {
        username: session.user.githubLogin || session.user.name || 'Unknown',
        name: session.user.name || undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        issue: {
          number: issue.number,
          url: issue.html_url,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error filing issue via bot:', error);

    // Handle GitHub API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const githubError = error as { status: number; message?: string };

      if (githubError.status === 404) {
        return NextResponse.json(
          {
            error: 'Repository not found',
            message: 'The specified repository does not exist or is not accessible.',
          },
          { status: 404 }
        );
      }

      if (githubError.status === 403) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'The bot does not have permission to create issues in this repository.',
          },
          { status: 403 }
        );
      }

      if (githubError.status === 410) {
        return NextResponse.json(
          {
            error: 'Issues disabled',
            message: 'Issues are disabled for this repository.',
          },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while filing the issue.',
      },
      { status: 500 }
    );
  }
}
