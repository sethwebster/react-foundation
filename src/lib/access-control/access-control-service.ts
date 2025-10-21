/**
 * Access Control Service
 * Business logic for checking allowlist and managing access
 */

import type { Session } from 'next-auth';

export interface AccessCheckResult {
  isAllowed: boolean;
  reason: 'not-authenticated' | 'not-on-allowlist' | 'allowed';
  userEmail?: string;
}

export class AccessControlService {
  /**
   * Check if a user is on the allowlist
   */
  static checkUserAccess(session: Session | null): AccessCheckResult {
    // Not authenticated
    if (!session || !session.user?.email) {
      return {
        isAllowed: false,
        reason: 'not-authenticated',
      };
    }

    // Get allowlist from environment
    const allowedUsers = this.getAllowedUsers();
    const userEmail = session.user.email.toLowerCase();

    // Check if user is on allowlist
    const isAllowed = allowedUsers.includes(userEmail);

    return {
      isAllowed,
      reason: isAllowed ? 'allowed' : 'not-on-allowlist',
      userEmail,
    };
  }

  /**
   * Get allowed users from environment variable
   * Note: Must use NEXT_PUBLIC_ prefix for client-side access
   */
  static getAllowedUsers(): string[] {
    // Check both client and server environment
    const allowedUsersRaw =
      (typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_ALLOWED_USERS
        : process.env.ALLOWED_USERS) || '';

    if (!allowedUsersRaw) {
      return [];
    }

    return allowedUsersRaw
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);
  }

  /**
   * Check if user should be redirected to Coming Soon page
   */
  static shouldRedirectToComingSoon(
    session: Session | null,
    currentPath: string
  ): boolean {
    // Already on Coming Soon page
    if (currentPath === '/coming-soon') {
      return false;
    }

    // Check access
    const { isAllowed } = this.checkUserAccess(session);

    // Not allowed = should redirect
    return !isAllowed;
  }

  /**
   * Check if user should be redirected away from Coming Soon page
   */
  static shouldRedirectFromComingSoon(session: Session | null): boolean {
    const { isAllowed } = this.checkUserAccess(session);

    // Allowed = should redirect to home
    return isAllowed;
  }

  /**
   * Validate access request
   */
  static validateAccessRequest(email: string, message: string): {
    valid: boolean;
    error?: string;
  } {
    if (!email || !message) {
      return {
        valid: false,
        error: 'Email and message are required',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format',
      };
    }

    if (message.trim().length < 10) {
      return {
        valid: false,
        error: 'Please provide a more detailed message (at least 10 characters)',
      };
    }

    return { valid: true };
  }
}
