/**
 * Request Access API Route
 * Sends email notification when someone requests early access
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccessRequestsService } from '@/lib/admin/access-requests-service';

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
    const emailId = await AccessRequestsService.sendAdminNotificationEmail(accessRequest);

    console.log(`✅ Email sent successfully!`);
    console.log(`   Email ID: ${emailId}`);
    console.log(`   Requester: ${email}`);
    console.log(`   Message preview: ${message.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      message: 'Request sent successfully',
      emailId,
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
