import { Resend } from 'resend';
import { render } from '@react-email/render';
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

  // Render React Email template
  const { default: ChatbotHandoff } = await import('@/emails/chatbot-handoff');
  const html = await render(
    ChatbotHandoff({
      summary: payload.summary,
      reason: payload.reason,
      details: payload.details,
      contact: payload.contact,
      conversationMessages: payload.conversation.messages,
      metadata: Object.fromEntries(
        Object.entries(payload.metadata)
          .filter(([, value]) => value != null && value !== '')
          .map(([key, value]) => [key, String(value)])
      ),
    })
  );

  await resend.emails.send({
    from: `Foundation Assistant <noreply@${domain}>`,
    to: recipients,
    subject,
    html,
  });

  logger.info('Sent human handoff notification', {
    conversationId: payload.conversation.id,
    summary: payload.summary,
    contact: payload.contact,
  });
}
