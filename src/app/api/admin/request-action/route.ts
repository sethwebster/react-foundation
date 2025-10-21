/**
 * Access Request Action Handler
 * Handles approve/deny actions from email links
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';
import { UserManagementService } from '@/lib/admin/user-management-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(
        '<html><body><h1>Invalid Link</h1><p>Token missing</p></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Parse token
    const parsed = AccessRequestsService.parseActionToken(token);
    if (!parsed) {
      return new NextResponse(
        '<html><body><h1>Invalid Token</h1><p>This link is invalid or expired</p></body></html>',
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const { requestId, action } = parsed;

    // Get request
    const accessRequest = await AccessRequestsService.getRequest(requestId);
    if (!accessRequest) {
      return new NextResponse(
        '<html><body><h1>Request Not Found</h1><p>This request may have already been processed</p></body></html>',
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check if already processed
    if (accessRequest.status !== 'pending') {
      return new NextResponse(
        `<html><body><h1>Already Processed</h1><p>This request was ${accessRequest.status} on ${new Date(accessRequest.reviewedAt!).toLocaleString()}</p></body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Get session to see who's approving
    const session = await getServerSession(authOptions);
    const reviewerEmail = session?.user?.email || 'email-link';

    // Perform action
    if (action === 'approve') {
      await AccessRequestsService.approveRequest(requestId, reviewerEmail, 'user');

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; background: #000; color: #fff; }
              .success { padding: 20px; background: #10b981; border-radius: 8px; text-align: center; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ Approved!</h1>
              <p>${accessRequest.email} has been granted access</p>
              <a href="/admin/users" class="button">View Users</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    } else {
      await AccessRequestsService.denyRequest(requestId, reviewerEmail);

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; background: #000; color: #fff; }
              .denied { padding: 20px; background: #ef4444; border-radius: 8px; text-align: center; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #06b6d4; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="denied">
              <h1>❌ Denied</h1>
              <p>Request from ${accessRequest.email} has been denied</p>
              <a href="/admin/requests" class="button">View Requests</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error) {
    console.error('Action handler error:', error);

    return new NextResponse(
      '<html><body><h1>Error</h1><p>Something went wrong</p></body></html>',
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
