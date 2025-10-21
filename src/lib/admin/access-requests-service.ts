/**
 * Access Request Service
 * Manages pending access requests in Redis
 */

import { getRedisClient } from '@/lib/redis';
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

    console.log(`✅ Access request created: ${id} for ${email}`);

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
    } catch (error) {
      console.error(`Error parsing request ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all pending requests
   */
  static async getPendingRequests(): Promise<AccessRequest[]> {
    const client = getRedisClient();

    const ids = await client.smembers(REDIS_KEYS.pendingRequests);
    const requests: AccessRequest[] = [];

    for (const id of ids) {
      const request = await this.getRequest(id);
      if (request) {
        requests.push(request);
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
    const requests: AccessRequest[] = [];

    for (const id of ids) {
      const request = await this.getRequest(id);
      if (request) {
        requests.push(request);
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

    console.log(`✅ Request ${id} approved for ${request.email}`);
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

    console.log(`✅ Request ${id} denied for ${request.email}`);
  }

  /**
   * Send approval email to requestor
   */
  private static async sendApprovalEmail(email: string): Promise<void> {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

      await resend.emails.send({
        from: `React Foundation Store <noreply@${fromDomain}>`,
        to: [email],
        subject: '✅ Access Approved - React Foundation Store',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: system-ui; background: #000; color: #fff; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h1 style="color: #10b981; font-size: 32px;">🎉 Welcome!</h1>
                <p style="font-size: 18px; color: #fff;">Your access request has been approved.</p>
                <p style="color: #aaa; margin: 20px 0;">You can now sign in and access the React Foundation Store.</p>
                <a href="${baseUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 32px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Sign In Now
                </a>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`📧 Approval email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending approval email to ${email}:`, error);
    }
  }

  /**
   * Send denial email to requestor
   */
  private static async sendDenialEmail(email: string): Promise<void> {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';

      await resend.emails.send({
        from: `React Foundation Store <noreply@${fromDomain}>`,
        to: [email],
        subject: 'Access Request Update - React Foundation Store',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: system-ui; background: #000; color: #fff; padding: 40px;">
              <div style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h1 style="color: #ef4444; font-size: 32px;">Access Request Update</h1>
                <p style="font-size: 16px; color: #fff;">Thank you for your interest in the React Foundation Store.</p>
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

      console.log(`📧 Denial email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending denial email to ${email}:`, error);
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
    } catch (error) {
      return null;
    }
  }
}
