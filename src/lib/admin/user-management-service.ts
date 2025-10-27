/**
 * User Management Service
 * Handles user roles and access control stored in Redis
 * Supports multiple roles per user with hierarchical permissions
 */

import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

// Re-export types and constants from shared types file
export type { User, UserRole } from './types';
export { ROLE_HIERARCHY, ROLE_LABELS, ROLE_DESCRIPTIONS } from './types';

import { ROLE_HIERARCHY, type UserRole, type User } from './types';

const REDIS_KEYS = {
  user: (email: string) => `admin:user:${email.toLowerCase()}`,
  allUsers: 'admin:users:all',
  admins: 'admin:users:admins',
};

export class UserManagementService {
  /**
   * Super admin email from environment variable
   * This user always has full admin access, even if not in Redis
   * Useful for initial setup and emergency access
   * Set via SUPER_ADMIN_EMAIL environment variable
   */
  private static get SUPER_ADMIN(): string | undefined {
    return process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  }

  /**
   * Check if a super admin is configured
   */
  static isSuperAdminConfigured(): boolean {
    return !!process.env.SUPER_ADMIN_EMAIL;
  }

  /**
   * Check if email is the super admin
   */
  static isSuperAdmin(email: string): boolean {
    const superAdmin = this.SUPER_ADMIN;
    if (!superAdmin) return false;
    return email.toLowerCase().trim() === superAdmin;
  }

  /**
   * Add or update a user with multiple roles
   */
  static async addUser(email: string, roles: UserRole | UserRole[], addedBy?: string): Promise<void> {
    const client = getRedisClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Normalize roles to array
    const rolesArray = Array.isArray(roles) ? roles : [roles];

    // Get existing user to preserve addedAt if updating
    const existing = await this.getUser(normalizedEmail);

    const user: User = {
      email: normalizedEmail,
      roles: rolesArray,
      addedAt: existing?.addedAt ?? new Date().toISOString(),
      addedBy: existing?.addedBy ?? addedBy,
    };

    // Store user data
    await client.set(REDIS_KEYS.user(normalizedEmail), JSON.stringify(user));

    // Add to all users set
    await client.sadd(REDIS_KEYS.allUsers, normalizedEmail);

    // Add to admins set if has admin role
    if (rolesArray.includes('admin')) {
      await client.sadd(REDIS_KEYS.admins, normalizedEmail);
    } else {
      // Remove from admins if no longer admin
      await client.srem(REDIS_KEYS.admins, normalizedEmail);
    }

    logger.info(`✅ User ${normalizedEmail} ${existing ? 'updated' : 'added'} with roles: ${rolesArray.join(', ')}`);
  }

  /**
   * Update user roles (replaces all existing roles)
   */
  static async updateUserRoles(email: string, roles: UserRole[], updatedBy?: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.getUser(normalizedEmail);

    if (!existing) {
      throw new Error(`User ${normalizedEmail} not found`);
    }

    await this.addUser(normalizedEmail, roles, updatedBy);
  }

  /**
   * Remove a user
   */
  static async removeUser(email: string): Promise<void> {
    const client = getRedisClient();
    const normalizedEmail = email.toLowerCase().trim();

    await client.del(REDIS_KEYS.user(normalizedEmail));
    await client.srem(REDIS_KEYS.allUsers, normalizedEmail);
    await client.srem(REDIS_KEYS.admins, normalizedEmail);

    logger.info(`✅ User ${normalizedEmail} removed`);
  }

  /**
   * Get user by email
   */
  static async getUser(email: string): Promise<User | null> {
    const client = getRedisClient();
    const normalizedEmail = email.toLowerCase().trim();

    const data = await client.get(REDIS_KEYS.user(normalizedEmail));
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);

      // Backward compatibility: migrate old 'role' field to 'roles' array
      if (parsed.role && !parsed.roles) {
        parsed.roles = [parsed.role];
        delete parsed.role;
        // Auto-save the migrated data
        await client.set(REDIS_KEYS.user(normalizedEmail), JSON.stringify(parsed));
        logger.info(`🔄 Migrated user ${normalizedEmail} from role to roles array`);
      }

      return parsed;
    } catch (error) {
      logger.error(`Error parsing user data for ${normalizedEmail}:`, error);
      return null;
    }
  }

  /**
   * Check if user has access (any role)
   */
  static async hasAccess(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    // Super admin always has access
    if (this.SUPER_ADMIN && normalizedEmail === this.SUPER_ADMIN) {
      logger.info(`✅ Super admin access granted: ${normalizedEmail}`);
      return true;
    }

    const client = getRedisClient();
    return await client.sismember(REDIS_KEYS.allUsers, normalizedEmail) === 1;
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    // Super admin is always admin
    if (this.SUPER_ADMIN && normalizedEmail === this.SUPER_ADMIN) {
      logger.info(`✅ Super admin detected: ${normalizedEmail} (from SUPER_ADMIN_EMAIL)`);
      return true;
    }

    const client = getRedisClient();
    return await client.sismember(REDIS_KEYS.admins, normalizedEmail) === 1;
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    const client = getRedisClient();

    const emails = await client.smembers(REDIS_KEYS.allUsers);

    if (emails.length === 0) return [];

    // Batch fetch all user data with MGET (single Redis call)
    const keys = emails.map(email => REDIS_KEYS.user(email));
    const values = await client.mget(...keys);

    const users: User[] = [];
    const migratedKeys: string[] = [];
    const migratedValues: string[] = [];

    for (let i = 0; i < values.length; i++) {
      const data = values[i];
      if (!data) continue;

      try {
        const user = JSON.parse(data);

        // Backward compatibility: migrate old 'role' field to 'roles' array
        if (user.role && !user.roles) {
          user.roles = [user.role];
          delete user.role;
          migratedKeys.push(REDIS_KEYS.user(emails[i]));
          migratedValues.push(JSON.stringify(user));
        }

        users.push(user);
      } catch (error) {
        logger.error(`Error parsing user data for ${emails[i]}:`, error);
      }
    }

    // Batch save migrated users
    if (migratedKeys.length > 0) {
      const pipeline = client.pipeline();
      for (let i = 0; i < migratedKeys.length; i++) {
        pipeline.set(migratedKeys[i], migratedValues[i]);
      }
      await pipeline.exec();
      logger.info(`🔄 Migrated ${migratedKeys.length} users from role to roles array`);
    }

    return users.sort((a, b) => a.email.localeCompare(b.email));
  }

  /**
   * Get all admins
   */
  static async getAdmins(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.roles.includes('admin'));
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(email: string, role: UserRole): Promise<boolean> {
    const user = await this.getUser(email);
    if (!user) return false;
    return user.roles.includes(role);
  }

  /**
   * Check if user has permission level (considering hierarchy)
   * @param email User email
   * @param requiredRole The minimum role required
   * @returns true if user has this role or a higher role in the hierarchy
   */
  static async hasPermission(email: string, requiredRole: UserRole): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    // Super admin has all permissions
    if (this.SUPER_ADMIN && normalizedEmail === this.SUPER_ADMIN) {
      return true;
    }

    const user = await this.getUser(normalizedEmail);
    if (!user) return false;

    const requiredLevel = ROLE_HIERARCHY[requiredRole];

    // Check if user has any role that meets or exceeds the required level
    return user.roles.some(userRole => {
      const userLevel = ROLE_HIERARCHY[userRole];
      return userLevel >= requiredLevel;
    });
  }

  /**
   * Get user's highest role level
   */
  static async getHighestRoleLevel(email: string): Promise<number> {
    const user = await this.getUser(email);
    if (!user || user.roles.length === 0) return 0;

    return Math.max(...user.roles.map(role => ROLE_HIERARCHY[role]));
  }

  /**
   * Migrate users from environment variable to Redis
   */
  static async migrateFromEnv(): Promise<void> {
    const allowedUsers = process.env.ALLOWED_USERS;
    if (!allowedUsers) return;

    const emails = allowedUsers.split(',').map(e => e.trim()).filter(Boolean);

    for (const email of emails) {
      const exists = await this.hasAccess(email);
      if (!exists) {
        await this.addUser(email, 'user', 'env-migration');
        logger.info(`Migrated ${email} from environment variable`);
      }
    }
  }
}
