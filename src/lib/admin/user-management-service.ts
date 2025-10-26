/**
 * User Management Service
 * Handles user roles and access control stored in Redis
 */

import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

export type UserRole = 'admin' | 'user';

export interface User {
  email: string;
  role: UserRole;
  addedAt: string;
  addedBy?: string;
}

const REDIS_KEYS = {
  user: (email: string) => `admin:user:${email.toLowerCase()}`,
  allUsers: 'admin:users:all',
  admins: 'admin:users:admins',
};

export class UserManagementService {
  // Super admin - always has access even if Redis is empty
  private static get SUPER_ADMIN(): string | undefined {
    return process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  }

  /**
   * Add or update a user
   */
  static async addUser(email: string, role: UserRole, addedBy?: string): Promise<void> {
    const client = getRedisClient();
    const normalizedEmail = email.toLowerCase().trim();

    const user: User = {
      email: normalizedEmail,
      role,
      addedAt: new Date().toISOString(),
      addedBy,
    };

    // Store user data
    await client.set(REDIS_KEYS.user(normalizedEmail), JSON.stringify(user));

    // Add to all users set
    await client.sadd(REDIS_KEYS.allUsers, normalizedEmail);

    // Add to admins set if admin role
    if (role === 'admin') {
      await client.sadd(REDIS_KEYS.admins, normalizedEmail);
    } else {
      // Remove from admins if downgraded
      await client.srem(REDIS_KEYS.admins, normalizedEmail);
    }

    logger.info(`✅ User ${normalizedEmail} added with role: ${role}`);
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
      return JSON.parse(data);
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
    for (let i = 0; i < values.length; i++) {
      const data = values[i];
      if (!data) continue;

      try {
        const user = JSON.parse(data);
        users.push(user);
      } catch (error) {
        logger.error(`Error parsing user data for ${emails[i]}:`, error);
      }
    }

    return users.sort((a, b) => a.email.localeCompare(b.email));
  }

  /**
   * Get all admins
   */
  static async getAdmins(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.role === 'admin');
  }

  /**
   * Update user role
   */
  static async updateUserRole(email: string, role: UserRole, updatedBy?: string): Promise<void> {
    const user = await this.getUser(email);
    if (!user) {
      throw new Error('User not found');
    }

    await this.addUser(email, role, updatedBy || user.addedBy);
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
