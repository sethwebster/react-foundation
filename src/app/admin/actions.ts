/**
 * Admin Server Actions
 * Server-side actions for user and request management
 */

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { revalidatePath } from 'next/cache';

/**
 * Add or update a user
 */
export async function addUserAction(email: string, role: 'user' | 'admin') {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  await UserManagementService.addUser(email, role, session.user.email);

  revalidatePath('/admin/users');

  return { success: true };
}

/**
 * Remove a user
 */
export async function removeUserAction(email: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  // Prevent removing yourself
  if (email.toLowerCase() === session.user.email.toLowerCase()) {
    throw new Error('Cannot remove yourself');
  }

  await UserManagementService.removeUser(email);

  revalidatePath('/admin/users');

  return { success: true };
}

/**
 * Update user role
 */
export async function updateUserRoleAction(email: string, role: 'user' | 'admin') {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  await UserManagementService.updateUserRole(email, role, session.user.email);

  revalidatePath('/admin/users');

  return { success: true };
}

/**
 * Approve access request
 */
export async function approveRequestAction(id: string, role: 'user' | 'admin' = 'user') {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  await AccessRequestsService.approveRequest(id, session.user.email, role);

  revalidatePath('/admin/requests');
  revalidatePath('/admin/users');

  return { success: true };
}

/**
 * Deny access request
 */
export async function denyRequestAction(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  await AccessRequestsService.denyRequest(id, session.user.email);

  revalidatePath('/admin/requests');

  return { success: true };
}

/**
 * Resend admin notification email for a request
 */
export async function resendAdminNotificationAction(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const isAdmin = await UserManagementService.isAdmin(session.user.email);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  const request = await AccessRequestsService.getRequest(id);
  if (!request) {
    throw new Error('Request not found');
  }

  await AccessRequestsService.sendAdminNotificationEmail(request);

  return { success: true };
}
