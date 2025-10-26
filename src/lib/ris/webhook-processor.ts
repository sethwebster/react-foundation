/**
 * Webhook Event Processor
 * Processes queued webhook events and updates library activity data
 */

import type { LibraryActivityData, PullRequestActivity, IssueActivity, CommitActivity, ReleaseActivity } from './activity-types';
import { getCachedLibraryActivity, cacheLibraryActivity, cacheLibraryMetrics } from '../redis';
import { calculateMetricsFromActivity } from './activity-calculator';
import { dequeueWebhookEvent, markEventProcessed, logWebhookError, type WebhookEvent } from './webhook-queue';
import { logger } from '../logger';

/**
 * Process one webhook event from the queue
 * Returns true if an event was processed, false if queue is empty
 */
export async function processNextWebhookEvent(): Promise<boolean> {
  const event = await dequeueWebhookEvent();

  if (!event) {
    return false; // Queue is empty
  }

  try {
    await processWebhookEvent(event);
    await markEventProcessed(event.eventId);
    return true;
  } catch (error) {
    await logWebhookError(
      event.eventId,
      error instanceof Error ? error.message : String(error),
      { type: event.type, owner: event.owner, repo: event.repo }
    );

    logger.error(`Failed to process webhook event ${event.eventId}:`, error);
    return true; // Event was attempted (don't retry immediately)
  }
}

/**
 * Process all pending webhook events
 * Returns number of events processed
 */
export async function processAllWebhookEvents(maxEvents: number = 100): Promise<number> {
  let processed = 0;

  while (processed < maxEvents) {
    const hadEvent = await processNextWebhookEvent();

    if (!hadEvent) {
      break; // Queue is empty
    }

    processed++;
  }

  if (processed > 0) {
    logger.info(`Processed ${processed} webhook event(s)`);
  }

  return processed;
}

/**
 * Process a single webhook event
 */
async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  logger.debug(`Processing ${event.type} event for ${event.owner}/${event.repo}`);

  // Get existing activity data
  let activity = await getCachedLibraryActivity(event.owner, event.repo);

  if (!activity) {
    // No existing data - skip webhook events until we have a baseline
    // (first collection needs to happen via full collection)
    logger.warn(`No cached activity for ${event.owner}/${event.repo} - skipping webhook event`);
    return;
  }

  // Process event based on type
  switch (event.type) {
    case 'push':
      activity = await processPushEvent(activity, event);
      break;

    case 'pull_request':
      activity = await processPullRequestEvent(activity, event);
      break;

    case 'issues':
      activity = await processIssuesEvent(activity, event);
      break;

    case 'release':
      activity = await processReleaseEvent(activity, event);
      break;

    default:
      logger.warn(`Unhandled webhook event type: ${event.type}`);
      return;
  }

  // Update last_updated_at timestamp
  activity.last_updated_at = new Date().toISOString();

  // Cache updated activity
  await cacheLibraryActivity(event.owner, event.repo, activity);

  // Recalculate and cache metrics
  const metrics = calculateMetricsFromActivity(activity);
  await cacheLibraryMetrics(event.owner, event.repo, metrics);

  logger.debug(`✓ Updated activity for ${event.owner}/${event.repo}`);
}

/**
 * Process push event (new commits)
 */
async function processPushEvent(
  activity: LibraryActivityData,
  event: WebhookEvent
): Promise<LibraryActivityData> {
  const payload = event.payload;
  const commits = payload.commits as Array<Record<string, unknown>> | undefined;

  if (!commits || commits.length === 0) {
    return activity;
  }

  // Add new commits to activity
  const newCommits: CommitActivity[] = commits.map(commit => ({
    sha: commit.id as string,
    date: commit.timestamp as string || new Date().toISOString(),
    author: (commit.author as Record<string, unknown>)?.username as string ||
             (commit.author as Record<string, unknown>)?.name as string ||
             'unknown',
    message: commit.message as string,
  }));

  // Prepend new commits (most recent first)
  activity.commits = [...newCommits, ...activity.commits];

  // Update collection window
  activity.collection_window_end = new Date().toISOString();

  logger.debug(`Added ${newCommits.length} commit(s) to ${event.owner}/${event.repo}`);

  return activity;
}

/**
 * Process pull request event
 */
async function processPullRequestEvent(
  activity: LibraryActivityData,
  event: WebhookEvent
): Promise<LibraryActivityData> {
  const payload = event.payload;
  const action = payload.action as string;
  const pr = payload.pull_request as Record<string, unknown>;

  if (!pr) {
    return activity;
  }

  const prActivity: PullRequestActivity = {
    id: pr.id as number,
    number: pr.number as number,
    title: pr.title as string,
    created_at: pr.created_at as string,
    merged_at: pr.merged_at as string | null,
    closed_at: pr.closed_at as string | null,
    state: pr.state as 'open' | 'closed',
    merged: pr.merged_at !== null,
    author: (pr.user as Record<string, unknown>)?.login as string || 'unknown',
    additions: (pr.additions as number) || 0,
    deletions: (pr.deletions as number) || 0,
    changed_files: (pr.changed_files as number) || 0,
  };

  // Find existing PR in activity
  const existingIndex = activity.prs.findIndex(p => p.number === prActivity.number);

  if (existingIndex >= 0) {
    // Update existing PR
    activity.prs[existingIndex] = prActivity;
    logger.debug(`Updated PR #${prActivity.number} (${action})`);
  } else {
    // Add new PR
    activity.prs.unshift(prActivity); // Add at beginning (most recent first)
    logger.debug(`Added new PR #${prActivity.number}`);
  }

  return activity;
}

/**
 * Process issues event
 */
async function processIssuesEvent(
  activity: LibraryActivityData,
  event: WebhookEvent
): Promise<LibraryActivityData> {
  const payload = event.payload;
  const action = payload.action as string;
  const issue = payload.issue as Record<string, unknown>;

  if (!issue) {
    return activity;
  }

  // Skip if it's actually a PR (issues API includes PRs)
  if (issue.pull_request) {
    return activity;
  }

  const labels = Array.isArray(issue.labels)
    ? issue.labels.map((l: unknown) => {
        if (typeof l === 'object' && l !== null && 'name' in l) {
          return String((l as Record<string, unknown>).name);
        }
        return '';
      }).filter(Boolean)
    : [];

  const issueActivity: IssueActivity = {
    id: issue.id as number,
    number: issue.number as number,
    title: issue.title as string,
    created_at: issue.created_at as string,
    closed_at: issue.closed_at as string | null,
    state: issue.state as 'open' | 'closed',
    author: (issue.user as Record<string, unknown>)?.login as string || 'unknown',
    comments: (issue.comments as number) || 0,
    labels,
  };

  // Find existing issue in activity
  const existingIndex = activity.issues.findIndex(i => i.number === issueActivity.number);

  if (existingIndex >= 0) {
    // Update existing issue
    activity.issues[existingIndex] = issueActivity;
    logger.debug(`Updated issue #${issueActivity.number} (${action})`);
  } else {
    // Add new issue
    activity.issues.unshift(issueActivity); // Add at beginning (most recent first)
    logger.debug(`Added new issue #${issueActivity.number}`);
  }

  return activity;
}

/**
 * Process release event
 */
async function processReleaseEvent(
  activity: LibraryActivityData,
  event: WebhookEvent
): Promise<LibraryActivityData> {
  const payload = event.payload;
  const action = payload.action as string;
  const release = payload.release as Record<string, unknown>;

  if (!release || action !== 'published') {
    return activity; // Only track published releases
  }

  const releaseActivity: ReleaseActivity = {
    id: release.id as number,
    tag_name: release.tag_name as string,
    name: release.name as string || release.tag_name as string,
    published_at: release.published_at as string || release.created_at as string,
    prerelease: (release.prerelease as boolean) || false,
    draft: (release.draft as boolean) || false,
  };

  // Find existing release in activity
  const existingIndex = activity.releases.findIndex(r => r.id === releaseActivity.id);

  if (existingIndex >= 0) {
    // Update existing release
    activity.releases[existingIndex] = releaseActivity;
    logger.debug(`Updated release ${releaseActivity.tag_name}`);
  } else {
    // Add new release
    activity.releases.unshift(releaseActivity); // Add at beginning (most recent first)
    logger.debug(`Added new release ${releaseActivity.tag_name}`);
  }

  return activity;
}
