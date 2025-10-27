/**
 * Access Request Action Handler
 * Handles approve/deny actions from email links
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';

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
      const statusEmoji = accessRequest.status === 'approved' ? '&#x2705;' : '&#x274C;';
      const statusText = accessRequest.status === 'approved' ? 'Approved' : 'Denied';
      const statusColor = accessRequest.status === 'approved' ? '#10b981' : '#ef4444';

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Processed</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                min-height: 100vh;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                max-width: 500px;
                padding: 40px;
                text-align: center;
              }
              .icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 32px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 16px;
              }
              .status {
                color: ${statusColor};
                font-weight: 600;
              }
              p {
                color: #a0a0a0;
                margin-bottom: 32px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: #06b6d4;
                color: #000;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                transition: background 0.2s;
              }
              .button:hover {
                background: #0891b2;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">${statusEmoji}</div>
              <h1>Already Processed</h1>
              <p>This request was <span class="status">${statusText}</span> on ${new Date(accessRequest.reviewedAt!).toLocaleDateString()} at ${new Date(accessRequest.reviewedAt!).toLocaleTimeString()}</p>
              <a href="/admin/users/requests" class="button">View All Requests</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
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
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Approved</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                min-height: 100vh;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                max-width: 500px;
                padding: 40px;
                text-align: center;
              }
              .success-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 32px;
                font-weight: bold;
                background: linear-gradient(to right, #10b981, #06b6d4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
              }
              p {
                color: #a0a0a0;
                margin-bottom: 32px;
              }
              .email {
                color: #06b6d4;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: #06b6d4;
                color: #000;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                transition: background 0.2s;
              }
              .button:hover {
                background: #0891b2;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">&#x2705;</div>
              <h1>Approved!</h1>
              <p><span class="email">${accessRequest.email}</span> has been granted access</p>
              <a href="/admin/users" class="button">View Users</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    } else {
      await AccessRequestsService.denyRequest(requestId, reviewerEmail);

      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Denied</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                min-height: 100vh;
                background: #000;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                max-width: 500px;
                padding: 40px;
                text-align: center;
              }
              .denied-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 32px;
                font-weight: bold;
                background: linear-gradient(to right, #ef4444, #f97316);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
              }
              p {
                color: #a0a0a0;
                margin-bottom: 32px;
              }
              .email {
                color: #ef4444;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: #06b6d4;
                color: #000;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                transition: background 0.2s;
              }
              .button:hover {
                background: #0891b2;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="denied-icon">&#x274C;</div>
              <h1>Request Denied</h1>
              <p>Request from <span class="email">${accessRequest.email}</span> has been denied</p>
              <a href="/admin/users/requests" class="button">View Requests</a>
            </div>
          </body>
        </html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
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
