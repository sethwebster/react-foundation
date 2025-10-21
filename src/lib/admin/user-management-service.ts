/**
 * User Management Service
 * Handles user roles and access control stored in Redis
 */

import { getRedisClient } from '@/lib/redis';

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
  private static readonly SUPER_ADMIN = 'sethwebster@gmail.com';

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

    console.log(`✅ User ${normalizedEmail} added with role: ${role}`);
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

    console.log(`✅ User ${normalizedEmail} removed`);
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
      console.error(`Error parsing user data for ${normalizedEmail}:`, error);
      return null;
    }
  }

  /**
   * Check if user has access (any role)
   */
  static async hasAccess(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    // Super admin always has access
    if (normalizedEmail === this.SUPER_ADMIN) {
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
    if (normalizedEmail === this.SUPER_ADMIN) {
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
    const users: User[] = [];

    for (const email of emails) {
      const user = await this.getUser(email);
      if (user) {
        users.push(user);
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
        console.log(`Migrated ${email} from environment variable`);
      }
    }
  }
}
