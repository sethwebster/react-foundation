/**
 * Library Approval System
 * Manages pending, approved, and rejected library installations
 */

import { getRedisClient } from '@/lib/redis';

export interface PendingLibrary {
  owner: string;
  repo: string;
  installationId: number;
  installedAt: string;
  githubUrl: string;
  description?: string;
  stars?: number;
  topics?: string[];
  language?: string;
  submittedBy?: string;
}

export interface ApprovedLibrary extends PendingLibrary {
  approvedAt: string;
  approvedBy: string;
}

export interface RejectedLibrary extends PendingLibrary {
  rejectedAt: string;
  rejectedBy: string;
  reason: string;
}

const REDIS_KEYS = {
  pending: 'ris:libraries:pending',
  approved: 'ris:libraries:approved',
  rejected: 'ris:libraries:rejected',
} as const;

/**
 * Add a library to the pending approval queue
 */
export async function addPendingLibrary(library: PendingLibrary): Promise<void> {
  const client = getRedisClient();
  const key = `${library.owner}/${library.repo}`;

  // Store in pending hash
  await client.hset(
    REDIS_KEYS.pending,
    key,
    JSON.stringify(library)
  );

  console.log(`📝 Added pending library: ${key}`);
}

/**
 * Get all pending libraries awaiting approval
 */
export async function getPendingLibraries(): Promise<PendingLibrary[]> {
  const client = getRedisClient();
  const pendingHash = await client.hgetall(REDIS_KEYS.pending);

  return Object.values(pendingHash).map(json => JSON.parse(json));
}

/**
 * Check if a library is already pending, approved, or rejected
 */
export async function getLibraryStatus(
  owner: string,
  repo: string
): Promise<'pending' | 'approved' | 'rejected' | 'none'> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  // Check pending
  const isPending = await client.hexists(REDIS_KEYS.pending, key);
  if (isPending) return 'pending';

  // Check approved
  const isApproved = await client.hexists(REDIS_KEYS.approved, key);
  if (isApproved) return 'approved';

  // Check rejected
  const isRejected = await client.hexists(REDIS_KEYS.rejected, key);
  if (isRejected) return 'rejected';

  return 'none';
}

/**
 * Approve a pending library
 */
export async function approveLibrary(
  owner: string,
  repo: string,
  approvedBy: string
): Promise<ApprovedLibrary | null> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  // Get from pending
  const pendingJson = await client.hget(REDIS_KEYS.pending, key);
  if (!pendingJson) {
    console.error(`❌ Library not found in pending: ${key}`);
    return null;
  }

  const pendingLib: PendingLibrary = JSON.parse(pendingJson);

  // Create approved library
  const approvedLib: ApprovedLibrary = {
    ...pendingLib,
    approvedAt: new Date().toISOString(),
    approvedBy,
  };

  // Move from pending to approved
  await client.hdel(REDIS_KEYS.pending, key);
  await client.hset(
    REDIS_KEYS.approved,
    key,
    JSON.stringify(approvedLib)
  );

  console.log(`✅ Approved library: ${key} by ${approvedBy}`);

  return approvedLib;
}

/**
 * Reject a pending library
 */
export async function rejectLibrary(
  owner: string,
  repo: string,
  rejectedBy: string,
  reason: string
): Promise<RejectedLibrary | null> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  // Get from pending
  const pendingJson = await client.hget(REDIS_KEYS.pending, key);
  if (!pendingJson) {
    console.error(`❌ Library not found in pending: ${key}`);
    return null;
  }

  const pendingLib: PendingLibrary = JSON.parse(pendingJson);

  // Create rejected library
  const rejectedLib: RejectedLibrary = {
    ...pendingLib,
    rejectedAt: new Date().toISOString(),
    rejectedBy,
    reason,
  };

  // Move from pending to rejected
  await client.hdel(REDIS_KEYS.pending, key);
  await client.hset(
    REDIS_KEYS.rejected,
    key,
    JSON.stringify(rejectedLib)
  );

  // Remove installation tracking if exists
  await client.hdel('ris:installations', key);

  console.log(`❌ Rejected library: ${key} by ${rejectedBy} - ${reason}`);

  return rejectedLib;
}

/**
 * Get all approved libraries
 */
export async function getApprovedLibraries(): Promise<ApprovedLibrary[]> {
  const client = getRedisClient();
  const approvedHash = await client.hgetall(REDIS_KEYS.approved);

  return Object.values(approvedHash).map(json => JSON.parse(json));
}

/**
 * Get all rejected libraries
 */
export async function getRejectedLibraries(): Promise<RejectedLibrary[]> {
  const client = getRedisClient();
  const rejectedHash = await client.hgetall(REDIS_KEYS.rejected);

  return Object.values(rejectedHash).map(json => JSON.parse(json));
}

/**
 * Check if a library is approved (used by RIS collection)
 */
export async function isLibraryApproved(owner: string, repo: string): Promise<boolean> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  const exists = await client.hexists(REDIS_KEYS.approved, key);
  return exists === 1;
}

/**
 * Get approved library details
 */
export async function getApprovedLibrary(
  owner: string,
  repo: string
): Promise<ApprovedLibrary | null> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  const json = await client.hget(REDIS_KEYS.approved, key);
  if (!json) return null;

  return JSON.parse(json);
}

/**
 * Re-submit a rejected library (moves back to pending)
 */
export async function resubmitLibrary(
  owner: string,
  repo: string
): Promise<PendingLibrary | null> {
  const client = getRedisClient();
  const key = `${owner}/${repo}`;

  // Get from rejected
  const rejectedJson = await client.hget(REDIS_KEYS.rejected, key);
  if (!rejectedJson) {
    console.error(`❌ Library not found in rejected: ${key}`);
    return null;
  }

  const rejectedLib: RejectedLibrary = JSON.parse(rejectedJson);

  // Create pending library (remove rejection metadata)
  const pendingLib: PendingLibrary = {
    owner: rejectedLib.owner,
    repo: rejectedLib.repo,
    installationId: rejectedLib.installationId,
    installedAt: new Date().toISOString(),
    githubUrl: rejectedLib.githubUrl,
    description: rejectedLib.description,
    stars: rejectedLib.stars,
    topics: rejectedLib.topics,
    language: rejectedLib.language,
    submittedBy: rejectedLib.submittedBy,
  };

  // Move from rejected to pending
  await client.hdel(REDIS_KEYS.rejected, key);
  await client.hset(
    REDIS_KEYS.pending,
    key,
    JSON.stringify(pendingLib)
  );

  console.log(`🔄 Re-submitted library: ${key}`);

  return pendingLib;
}
