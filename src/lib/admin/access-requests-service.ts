/**
 * Access Request Service
 * Manages pending access requests in Redis
 */

import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';
import { getSiteUrl } from '@/lib/site-url';
import crypto from 'crypto';

export interface AccessRequest {
  id: string;
  email: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedAt?: string;
  reviewedBy?: string;
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
    role: 'user' | 'admin' = 'user'
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

    // Add user with specified role
    const { UserManagementService } = await import('./user-management-service');
    await UserManagementService.addUser(request.email, role, reviewedBy);

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
    const reviewUrl = `${baseUrl}/admin/requests?id=${request.id}`;
    const formattedMessage = request.message.replace(/\n/g, '<br>');

    logger.info(`📧 Sending admin notification for request ${request.id}`);
    logger.info(`   Recipients: ${recipients.join(', ')}`);
    logger.info(`   Base URL: ${baseUrl}`);

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: `🚀 Early Access Request - ${request.email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: #fff; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { border-left: 4px solid #06b6d4; padding-left: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; background: linear-gradient(to right, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .content { background: #111; border: 1px solid #06b6d4; border-radius: 8px; padding: 30px; }
              .field { margin-bottom: 20px; }
              .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #06b6d4; margin-bottom: 5px; }
              .value { font-size: 16px; color: #fff; }
              .message-box { background: #000; border: 1px solid #374151; border-radius: 4px; padding: 15px; margin-top: 10px; }
              .actions { margin-top: 30px; display: flex; gap: 10px; justify-content: center; }
              .button { display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-align: center; }
              .approve { background: #10b981; color: #000; }
              .deny { background: #ef4444; color: #fff; }
              .review { background: #06b6d4; color: #000; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Early Access Request</h1>
              </div>

              <div class="content">
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">${request.email}</div>
                </div>

                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${formattedMessage}</div>
                </div>

                <div class="field">
                  <div class="label">Requested At</div>
                  <div class="value">${new Date(request.requestedAt).toLocaleString()}</div>
                </div>
              </div>

              <div class="actions">
                <a href="${approveUrl}" class="button approve">✅ Approve</a>
                <a href="${denyUrl}" class="button deny">❌ Deny</a>
                <a href="${reviewUrl}" class="button review">👁️ Review</a>
              </div>

              <div class="footer">
                <p>Click a button above to take action, or visit the <a href="${baseUrl}/admin/requests" style="color: #06b6d4;">admin panel</a> to review.</p>
                <p style="margin-top: 10px; font-size: 10px; color: #444;">Request ID: ${request.id}</p>
              </div>
            </div>
          </body>
        </html>
      `,
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

      const result = await resend.emails.send({
        from: `React Foundation <noreply@${fromDomain}>`,
        to: [email],
        subject: '✅ Access Approved - React Foundation',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: system-ui; background: #000; color: #fff; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h1 style="color: #10b981; font-size: 32px;">🎉 Welcome!</h1>
                <p style="font-size: 18px; color: #fff;">Your access request has been approved.</p>
                <p style="color: #aaa; margin: 20px 0;">You can now sign in and access the React Foundation.</p>
                ${baseUrl ? `<a href="${baseUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 32px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Sign In Now
                </a>` : '<p style="color: #666; margin-top: 20px;">Please visit the React Foundation to sign in.</p>'}
              </div>
            </body>
          </html>
        `,
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

      const result = await resend.emails.send({
        from: `React Foundation <noreply@${fromDomain}>`,
        to: [email],
        subject: 'Access Request Update - React Foundation',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: system-ui; background: #000; color: #fff; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h1 style="color: #ef4444; font-size: 32px;">Access Request Update</h1>
                <p style="font-size: 16px; color: #fff;">Thank you for your interest in the React Foundation.</p>
                <p style="color: #aaa; margin: 20px 0;">
                  After review, we're unable to grant access at this time. We appreciate your understanding.
                </p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  If you have questions, please reply to this email.
                </p>
              </div>
            </body>
          </html>
        `,
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
    } catch (_error) {
      return null;
    }
  }
}
