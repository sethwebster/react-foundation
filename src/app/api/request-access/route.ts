/**
 * Request Access API Route
 * Sends email notification when someone requests early access
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Access request received');

    const body = await request.json();
    const { email, message } = body;

    console.log(`   Requester email: ${email}`);
    console.log(`   Message length: ${message?.length || 0} chars`);

    if (!email || !message) {
      console.error('❌ Missing email or message');
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`❌ Invalid email format: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check Resend configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured - RESEND_API_KEY missing' },
        { status: 500 }
      );
    }

    console.log(`   Resend API key: ${resendApiKey.substring(0, 7)}...${resendApiKey.substring(resendApiKey.length - 4)}`);

    // Get your email from environment
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL not configured');
      return NextResponse.json(
        { error: 'Email service not configured - ADMIN_EMAIL missing' },
        { status: 500 }
      );
    }

    console.log(`   Admin email (to): ${adminEmail}`);

    // Determine from address
    const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';
    const fromAddress = `React Foundation <noreply@${fromDomain}>`;

    console.log(`   From address: ${fromAddress}`);
    console.log(`   Sending via Resend...`);

    // Store request in Redis
    const accessRequest = await AccessRequestsService.createRequest(email, message);

    // Generate action tokens
    const approveToken = AccessRequestsService.generateActionToken(accessRequest.id, 'approve');
    const denyToken = AccessRequestsService.generateActionToken(accessRequest.id, 'deny');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const approveUrl = `${baseUrl}/api/admin/request-action?token=${approveToken}`;
    const denyUrl = `${baseUrl}/api/admin/request-action?token=${denyToken}`;
    const reviewUrl = `${baseUrl}/admin/requests?id=${accessRequest.id}`;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [adminEmail],
      subject: `🚀 Early Access Request - ${email}`,
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
                  <div class="value">${email}</div>
                </div>

                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                </div>

                <div class="field">
                  <div class="label">Timestamp</div>
                  <div class="value">${new Date().toLocaleString()}</div>
                </div>
              </div>

              <div class="actions">
                <a href="${approveUrl}" class="button approve">✅ Approve</a>
                <a href="${denyUrl}" class="button deny">❌ Deny</a>
                <a href="${reviewUrl}" class="button review">👁️ Review</a>
              </div>

              <div class="footer">
                <p>Click a button above to take action, or visit the <a href="${baseUrl}/admin/requests" style="color: #06b6d4;">admin panel</a> to review.</p>
                <p style="margin-top: 10px; font-size: 10px; color: #444;">Request ID: ${accessRequest.id}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log(`✅ Email sent successfully!`);
    console.log(`   Email ID: ${data?.id}`);
    console.log(`   Requester: ${email}`);
    console.log(`   Message preview: ${message.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      message: 'Request sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Request access error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
