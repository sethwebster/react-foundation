/**
 * Access Request Service
 * Manages pending access requests in Redis
 */

import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';
import { getSiteUrl } from '@/lib/site-url';
import { render } from '@react-email/render';
import crypto from 'crypto';

export interface AccessRequest {
  id: string;
  email: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied' | 'bucketed';
  reviewedAt?: string;
  reviewedBy?: string;
  bucket?: string;
  replyMessage?: string;
  replySentAt?: string;
  seededBy?: string;
}

const REDIS_KEYS = {
  request: (id: string) => `admin:request:${id}`,
  pendingRequests: 'admin:requests:pending',
  allRequests: 'admin:requests:all',
  requestByEmail: (email: string) => `admin:request:email:${email.toLowerCase()}`,
};

export class AccessRequestsService {
  /**
   * Create a new access request
   */
  static async createRequest(email: string, message: string): Promise<AccessRequest> {
    const client = getRedisClient();

    // Generate unique ID
    const id = crypto.randomBytes(16).toString('hex');

    const request: AccessRequest = {
      id,
      email: email.toLowerCase().trim(),
      message,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store request
    await client.set(REDIS_KEYS.request(id), JSON.stringify(request));

    // Add to pending set
    await client.sadd(REDIS_KEYS.pendingRequests, id);

    // Add to all requests set
    await client.sadd(REDIS_KEYS.allRequests, id);

    // Map email to request ID
    await client.set(REDIS_KEYS.requestByEmail(email), id);

    logger.info(`✅ Access request created: ${id} for ${email}`);

    return request;
  }

  /**
   * Get request by ID
   */
  static async getRequest(id: string): Promise<AccessRequest | null> {
    const client = getRedisClient();

    const data = await client.get(REDIS_KEYS.request(id));
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (_error) {
      logger.error(`Error parsing request ${id}:`, _error);
      return null;
    }
  }

  /**
   * Get all pending requests
   */
  static async getPendingRequests(): Promise<AccessRequest[]> {
    const client = getRedisClient();

    const ids = await client.smembers(REDIS_KEYS.pendingRequests);

    if (ids.length === 0) return [];

    // Batch fetch all request data with MGET (single Redis call)
    const keys = ids.map(id => REDIS_KEYS.request(id));
    const values = await client.mget(...keys);

    const requests: AccessRequest[] = [];
    for (let i = 0; i < values.length; i++) {
      const data = values[i];
      if (!data) continue;

      try {
        const request = JSON.parse(data);
        requests.push(request);
      } catch (error) {
        logger.error(`Error parsing request ${ids[i]}:`, error);
      }
    }

    return requests.sort((a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  /**
   * Get all requests (pending + processed)
   */
  static async getAllRequests(): Promise<AccessRequest[]> {
    const client = getRedisClient();

    const ids = await client.smembers(REDIS_KEYS.allRequests);

    if (ids.length === 0) return [];

    // Batch fetch all request data with MGET (single Redis call)
    const keys = ids.map(id => REDIS_KEYS.request(id));
    const values = await client.mget(...keys);

    const requests: AccessRequest[] = [];
    for (let i = 0; i < values.length; i++) {
      const data = values[i];
      if (!data) continue;

      try {
        const request = JSON.parse(data);
        requests.push(request);
      } catch (error) {
        logger.error(`Error parsing request ${ids[i]}:`, error);
      }
    }

    return requests.sort((a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  /**
   * Approve request (grant access)
   */
  static async approveRequest(
    id: string,
    reviewedBy: string,
    roles: import('./types').UserRole | import('./types').UserRole[] = 'user'
  ): Promise<void> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new Error('Request not found');
    }

    const client = getRedisClient();

    // Update request status
    request.status = 'approved';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewedBy;

    await client.set(REDIS_KEYS.request(id), JSON.stringify(request));

    // Remove from pending
    await client.srem(REDIS_KEYS.pendingRequests, id);

    // Add user with specified role(s)
    const { UserManagementService } = await import('./user-management-service');
    await UserManagementService.addUser(request.email, roles, reviewedBy);

    // Send approval email
    await this.sendApprovalEmail(request.email);

    logger.info(`✅ Request ${id} approved for ${request.email}`);
  }

  /**
   * Deny request
   */
  static async denyRequest(id: string, reviewedBy: string): Promise<void> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new Error('Request not found');
    }

    const client = getRedisClient();

    // Update request status
    request.status = 'denied';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewedBy;

    await client.set(REDIS_KEYS.request(id), JSON.stringify(request));

    // Remove from pending
    await client.srem(REDIS_KEYS.pendingRequests, id);

    // Send denial email
    await this.sendDenialEmail(request.email);

    logger.info(`✅ Request ${id} denied for ${request.email}`);
  }

  /**
   * Reply to a request and assign a bucket
   */
  static async replyToRequest(
    id: string,
    reviewedBy: string,
    replyMessage: string,
    bucket: string
  ): Promise<void> {
    const request = await this.getRequest(id);
    if (!request) {
      throw new Error('Request not found');
    }

    const client = getRedisClient();
    const now = new Date().toISOString();
    const normalizedBucket = bucket.trim() || 'General waitlist';
    const trimmedMessage = replyMessage.trim();

    request.status = 'bucketed';
    request.reviewedAt = now;
    request.reviewedBy = reviewedBy;
    request.replyMessage = trimmedMessage;
    request.replySentAt = now;
    request.bucket = normalizedBucket;

    await client.set(REDIS_KEYS.request(id), JSON.stringify(request));
    await client.srem(REDIS_KEYS.pendingRequests, id);

    await this.sendReplyEmail(request.email, trimmedMessage, normalizedBucket);

    logger.info(`✅ Request ${id} bucketed (${normalizedBucket}) for ${request.email}`);
  }

  /**
   * Send notification email to admins for a specific request
   */
  static async sendAdminNotificationEmail(request: AccessRequest): Promise<string | undefined> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL not configured');
    }

    const recipients = adminEmail
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      throw new Error('ADMIN_EMAIL has no valid recipients');
    }

    const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';
    const fromAddress = `React Foundation <noreply@${fromDomain}>`;
    const baseUrl = getSiteUrl();
    const approveToken = this.generateActionToken(request.id, 'approve');
    const denyToken = this.generateActionToken(request.id, 'deny');
    const approveUrl = `${baseUrl}/api/admin/request-action?token=${approveToken}`;
    const denyUrl = `${baseUrl}/api/admin/request-action?token=${denyToken}`;
    const reviewUrl = `${baseUrl}/admin/users/requests?id=${request.id}`;
    const formattedMessage = request.message.replace(/\n/g, '<br>');

    logger.info(`📧 Sending admin notification for request ${request.id}`);
    logger.info(`   Recipients: ${recipients.join(', ')}`);
    logger.info(`   Base URL: ${baseUrl}`);

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    // Render React Email template
    const { default: AccessRequestNotification } = await import('@/emails/access-request-notification');
    const html = await render(
      AccessRequestNotification({
        email: request.email,
        message: request.message,
        requestedAt: request.requestedAt,
        requestId: request.id,
        approveUrl,
        denyUrl,
        reviewUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: `🚀 Early Access Request - ${request.email}`,
      html,
    });

    if (error) {
      logger.error('❌ Failed to send admin notification:', error);
      throw new Error('Failed to send admin notification email');
    }

    logger.info(`✅ Admin notification sent. Email ID: ${data?.id ?? 'unknown'}`);
    return data?.id;
  }

  /**
   * Send approval email to requestor
   */
  private static async sendApprovalEmail(email: string): Promise<void> {
    try {
      logger.info(`📧 Sending approval email to ${email}...`);

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        logger.error('❌ RESEND_API_KEY not configured - skipping email');
        return;
      }

      const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';
      const baseUrl = getSiteUrl();

      logger.info(`   From: noreply@${fromDomain}`);
      logger.info(`   To: ${email}`);
      logger.info(`   Using base URL: ${baseUrl}`);

      // Render React Email template
      const { default: AccessApproved } = await import('@/emails/access-approved');
      const html = await render(AccessApproved({ signInUrl: baseUrl }));

      const result = await resend.emails.send({
        from: `React Foundation <noreply@${fromDomain}>`,
        to: [email],
        subject: '✅ Access Approved - React Foundation',
        html,
      });

      if (result.data) {
        logger.info(`✅ Approval email sent! ID: ${result.data.id}`);
      } else if (result.error) {
        logger.error(`❌ Resend error:`, result.error);
      }
    } catch (_error) {
      logger.error(`❌ Error sending approval email to ${email}:`, _error);
    }
  }

  /**
   * Send denial email to requestor
   */
  private static async sendDenialEmail(email: string): Promise<void> {
    try {
      logger.info(`📧 Sending denial email to ${email}...`);

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        logger.error('❌ RESEND_API_KEY not configured - skipping email');
        return;
      }

      const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';

      logger.info(`   From: noreply@${fromDomain}`);
      logger.info(`   To: ${email}`);

      // Render React Email template
      const { default: AccessDenied } = await import('@/emails/access-denied');
      const html = await render(AccessDenied());

      const result = await resend.emails.send({
        from: `React Foundation <noreply@${fromDomain}>`,
        to: [email],
        subject: 'Access Request Update - React Foundation',
        html,
      });

      if (result.data) {
        logger.info(`✅ Denial email sent! ID: ${result.data.id}`);
      } else if (result.error) {
        logger.error(`❌ Resend error:`, result.error);
      }
    } catch (_error) {
      logger.error(`❌ Error sending denial email to ${email}:`, _error);
    }
  }

  /**
   * Send custom reply email with bucket information
   */
  private static async sendReplyEmail(email: string, replyMessage: string, bucket: string): Promise<void> {
    try {
      logger.info(`📧 Sending bucket reply email to ${email}...`);

      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      if (!process.env.RESEND_API_KEY) {
        logger.error('❌ RESEND_API_KEY not configured - skipping email');
        return;
      }

      const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';

      // Render React Email template
      const { default: AccessBucketed } = await import('@/emails/access-bucketed');
      const html = await render(
        AccessBucketed({
          message: replyMessage,
          bucket: bucket || 'General waitlist',
        })
      );

      const result = await resend.emails.send({
        from: `React Foundation <noreply@${fromDomain}>`,
        to: [email],
        subject: 'Access Request Update - React Foundation',
        html,
      });

      if (result.data) {
        logger.info(`✅ Bucket reply email sent! ID: ${result.data.id}`);
      } else if (result.error) {
        logger.error(`❌ Resend error:`, result.error);
      }
    } catch (_error) {
      logger.error(`❌ Error sending bucket reply email to ${email}:`, _error);
    }
  }

  /**
   * Generate action token for email links
   */
  static generateActionToken(requestId: string, action: 'approve' | 'deny'): string {
    // Simple token: base64(requestId:action:timestamp)
    const payload = `${requestId}:${action}:${Date.now()}`;
    return Buffer.from(payload).toString('base64url');
  }

  /**
   * Verify and parse action token
   */
  static parseActionToken(token: string): { requestId: string; action: 'approve' | 'deny' } | null {
    try {
      const decoded = Buffer.from(token, 'base64url').toString();
      const [requestId, action] = decoded.split(':');

      if (!requestId || (action !== 'approve' && action !== 'deny')) {
        return null;
      }

      return { requestId, action };
    } catch {
      return null;
    }
  }
}
