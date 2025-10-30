#!/usr/bin/env node

/**
 * Email Testing Script
 * Send test emails to verify templates and deliverability
 *
 * Usage:
 *   npm run email:test                           # Interactive menu
 *   npm run email:test -- --template=approval    # Send specific template
 *   npm run email:test -- --to=you@example.com   # Send to specific email
 */

import { render } from '@react-email/render';
import { Resend } from 'resend';
import { createInterface } from 'readline';
import type { ReactElement } from 'react';
import { config } from 'dotenv';

// Load environment variables
config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromDomain = process.env.RESEND_FROM_DOMAIN || 'yourdomain.com';
const defaultTo = process.env.ADMIN_EMAIL?.split(',')[0] || 'test@example.com';

interface TemplateConfig {
  name: string;
  file: string;
  subject: string;
  props: Record<string, unknown>;
}

// Parse command line args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value || true;
  return acc;
}, {} as Record<string, string | boolean>);

const templates: Record<string, TemplateConfig> = {
  'admin-notification': {
    name: 'Admin Notification (New Access Request)',
    file: '../src/emails/access-request-notification',
    subject: '🚀 Early Access Request - test@example.com',
    props: {
      email: 'test@example.com',
      message: 'I would love to get early access! I\'m a React maintainer and excited about what you\'re building.',
      requestedAt: new Date().toISOString(),
      requestId: 'test-123',
      approveUrl: 'https://react.foundation/api/admin/request-action?token=test-approve',
      denyUrl: 'https://react.foundation/api/admin/request-action?token=test-deny',
      reviewUrl: 'https://react.foundation/admin/users/requests?id=test-123',
    },
  },
  'approval': {
    name: 'Access Approved',
    file: '../src/emails/access-approved',
    subject: '✅ Access Approved - React Foundation',
    props: {
      signInUrl: 'https://react.foundation',
    },
  },
  'denial': {
    name: 'Access Denied',
    file: '../src/emails/access-denied',
    subject: 'Access Request Update - React Foundation',
    props: {},
  },
  'bucketed': {
    name: 'Access Bucketed (Waitlist)',
    file: '../src/emails/access-bucketed',
    subject: 'Access Request Update - React Foundation',
    props: {
      message: 'Thanks for your interest! We\'re rolling out access in phases. You\'re in our priority queue based on your React contributions.',
      bucket: 'Contributors Waitlist',
    },
  },
  'chatbot-handoff': {
    name: 'Chatbot Handoff',
    file: '../src/emails/chatbot-handoff',
    subject: 'Chatbot handoff: User needs help with contributor status',
    props: {
      summary: 'User needs help with contributor status',
      reason: 'Unable to find contributor information',
      details: 'User has made contributions but they\'re not showing up in their profile',
      contact: 'user@example.com',
      conversationMessages: [
        { role: 'user', content: 'Why isn\'t my contributor status showing up?' },
        { role: 'assistant', content: 'Let me check on that for you. Can you share your GitHub username?' },
        { role: 'user', content: 'It\'s @testuser' },
        { role: 'assistant', content: 'I\'m having trouble finding that information. Let me connect you with our team.' },
      ],
      metadata: {
        url: 'https://react.foundation/profile',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        conversationId: 'test-conv-123',
      },
    },
  },
};

async function sendEmail(templateKey: string, toEmail: string): Promise<void> {
  const template = templates[templateKey];

  if (!template) {
    console.error(`❌ Template "${templateKey}" not found`);
    console.log('Available templates:', Object.keys(templates).join(', '));
    process.exit(1);
  }

  console.log(`\n📧 Sending: ${template.name}`);
  console.log(`   To: ${toEmail}`);
  console.log(`   Subject: ${template.subject}`);

  try {
    // Import template
    const templateModule = await import(template.file);
    const Template = templateModule.default as (props: Record<string, unknown>) => ReactElement;

    // Render HTML
    const html = await render(Template(template.props));

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: `React Foundation <noreply@${fromDomain}>`,
      to: [toEmail],
      subject: template.subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log(`   Email ID: ${data?.id}`);

    if (fromDomain === 'yourdomain.com') {
      console.log('\n⚠️  Warning: Using default domain "yourdomain.com"');
      console.log('   Set RESEND_FROM_DOMAIN in your .env file for production');
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

async function interactiveMenu(): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log('\n🎨 React Foundation Email Tester\n');
  console.log('Available templates:');
  Object.entries(templates).forEach(([key, template], index) => {
    console.log(`  ${index + 1}. ${template.name} (${key})`);
  });

  const choice = await question('\nSelect template (1-5): ');
  const templateKey = Object.keys(templates)[parseInt(choice as string) - 1];

  if (!templateKey) {
    console.error('❌ Invalid choice');
    rl.close();
    process.exit(1);
  }

  const email = await question(`\nSend to email [${defaultTo}]: `);
  const toEmail = (email as string).trim() || defaultTo;

  rl.close();

  await sendEmail(templateKey, toEmail);
}

// Main execution
async function main() {
  // Check environment
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set in .env file');
    process.exit(1);
  }

  // Run based on args
  if (args.template) {
    await sendEmail(args.template as string, (args.to as string) || defaultTo);
  } else {
    await interactiveMenu();
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
