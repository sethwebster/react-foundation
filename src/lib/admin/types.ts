/**
 * Admin Types and Constants
 * Shared types and constants that can be safely imported in client components
 */

export type UserRole = 'admin' | 'community_manager' | 'library_manager' | 'user';

/**
 * Assignable roles that can be given/removed from users
 * Note: 'user' is implicit for all authenticated users and not assignable
 */
export type AssignableRole = 'admin' | 'community_manager' | 'library_manager';

export interface User {
  email: string;
  roles: UserRole[]; // Multiple roles per user (user role is implicit)
  addedAt: string;
  addedBy?: string;
}

/**
 * Role hierarchy and permissions
 * Higher roles inherit all permissions from lower roles
 * Note: All authenticated users have implicit 'user' role
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  community_manager: 3,
  library_manager: 2,
  user: 1, // Implicit for all authenticated users
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  community_manager: 'Community Manager',
  library_manager: 'Library Manager',
  user: 'User', // Not shown in UI
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access - can do everything',
  community_manager: 'Can manage communities and members',
  library_manager: 'Can manage libraries and contributions',
  user: 'Basic access (implicit for all authenticated users)',
};

/**
 * Only these roles can be assigned in the UI
 * 'user' role is implicit and not assignable
 */
export const ASSIGNABLE_ROLES: AssignableRole[] = [
  'admin',
  'community_manager',
  'library_manager',
];
