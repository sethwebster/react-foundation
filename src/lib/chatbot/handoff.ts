import { Resend } from 'resend';
import { logger } from '../logger';
import type { ConversationState } from './store';

interface HandoffPayload {
  conversation: ConversationState;
  contact: string;
  summary: string;
  details?: string;
  reason?: string;
  metadata: Record<string, unknown>;
}

function getRecipients(): string[] {
  const raw = process.env.ADMIN_EMAIL;
  if (!raw) {
    throw new Error('ADMIN_EMAIL is required to notify the foundation team.');
  }
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

function formatHtml(payload: HandoffPayload): string {
  const { conversation, contact, summary, details, reason, metadata } = payload;
  const conversationList = conversation.messages
    .map((message) => {
      const who = message.role === 'assistant' ? 'Assistant' : message.role === 'user' ? 'Visitor' : message.role;
      return `<li><strong>${who}:</strong> ${escapeHtml(message.content)}</li>`;
    })
    .join('');

  const metaList = Object.entries(metadata)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</li>`)
    .join('');

  return `
    <!doctype html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0b1120; color: #e2e8f0; padding: 24px;">
        <h1 style="color: #67e8f9;">Foundation chatbot handoff</h1>
        <p><strong>Summary:</strong> ${escapeHtml(summary)}</p>
        ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
        ${details ? `<p><strong>Details:</strong> ${escapeHtml(details)}</p>` : ''}
        <p><strong>Contact info:</strong> ${escapeHtml(contact)}</p>
        <h2 style="margin-top: 24px; color: #38bdf8;">Metadata</h2>
        <ul>${metaList || '<li>No metadata provided.</li>'}</ul>
        <h2 style="margin-top: 24px; color: #38bdf8;">Conversation transcript</h2>
        <ol>${conversationList}</ol>
      </body>
    </html>
  `;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function notifyHumanHandoff(payload: HandoffPayload): Promise<void> {
  const recipients = getRecipients();
  const apiKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_FROM_DOMAIN;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required to send handoff notifications.');
  }
  if (!domain) {
    throw new Error('RESEND_FROM_DOMAIN is required to send handoff notifications.');
  }

  const resend = new Resend(apiKey);
  const subject = `Chatbot handoff: ${payload.summary}`;

  await resend.emails.send({
    from: `Foundation Assistant <noreply@${domain}>`,
    to: recipients,
    subject,
    html: formatHtml(payload),
  });

  logger.info('Sent human handoff notification', {
    conversationId: payload.conversation.id,
    summary: payload.summary,
    contact: payload.contact,
  });
}
