/**
 * Chatbot Handoff Email
 * Sent to admins when the chatbot escalates a conversation to humans
 */

import { Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';

interface ChatbotHandoffProps {
  summary: string;
  reason?: string;
  details?: string;
  contact: string;
  conversationMessages: Array<{
    role: string;
    content: string;
  }>;
  metadata: Record<string, string>;
}

export function ChatbotHandoff({
  summary,
  reason,
  details,
  contact,
  conversationMessages,
  metadata,
}: ChatbotHandoffProps) {
  return (
    <EmailLayout
      preview={`Chatbot handoff: ${summary}`}
      title="Chatbot Handoff"
    >
      <Section style={field}>
        <Text style={label}>SUMMARY</Text>
        <Text style={value}>{summary}</Text>
      </Section>

      {reason && (
        <Section style={field}>
          <Text style={label}>REASON</Text>
          <Text style={value}>{reason}</Text>
        </Section>
      )}

      {details && (
        <Section style={field}>
          <Text style={label}>DETAILS</Text>
          <Text style={value}>{details}</Text>
        </Section>
      )}

      <Section style={field}>
        <Text style={label}>CONTACT INFO</Text>
        <Text style={value}>{contact}</Text>
      </Section>

      <Hr style={divider} />

      <Section style={metadataSection}>
        <Text style={sectionHeading}>Metadata</Text>
        {Object.entries(metadata).length > 0 ? (
          <ul style={list}>
            {Object.entries(metadata).map(([key, value]) => (
              <li key={key} style={listItem}>
                <strong style={listKey}>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        ) : (
          <Text style={emptyText}>No metadata provided</Text>
        )}
      </Section>

      <Hr style={divider} />

      <Section style={transcriptSection}>
        <Text style={sectionHeading}>Conversation Transcript</Text>
        <ol style={transcript}>
          {conversationMessages.map((msg, index) => (
            <li key={index} style={transcriptItem}>
              <strong style={transcriptRole}>
                {msg.role === 'assistant' ? 'Assistant' : msg.role === 'user' ? 'Visitor' : msg.role}:
              </strong>
              <Text style={transcriptContent}>{msg.content}</Text>
            </li>
          ))}
        </ol>
      </Section>
    </EmailLayout>
  );
}

export default ChatbotHandoff;

// Styles
const field = {
  marginBottom: '20px',
};

const label = {
  margin: '0 0 8px 0',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#06b6d4',
  fontWeight: '600',
};

const value = {
  margin: '0',
  fontSize: '16px',
  color: '#ffffff',
  lineHeight: '1.5',
};

const divider = {
  margin: '32px 0',
  borderColor: '#1f2937',
};

const metadataSection = {
  marginBottom: '24px',
};

const transcriptSection = {
  marginBottom: '24px',
};

const sectionHeading = {
  margin: '0 0 16px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#06b6d4',
};

const list = {
  margin: '0',
  paddingLeft: '24px',
  color: '#e5e7eb',
};

const listItem = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#e5e7eb',
};

const listKey = {
  color: '#9ca3af',
};

const emptyText = {
  margin: '0',
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic' as const,
};

const transcript = {
  margin: '0',
  paddingLeft: '24px',
  color: '#e5e7eb',
};

const transcriptItem = {
  margin: '0 0 16px 0',
  fontSize: '14px',
  lineHeight: '1.6',
};

const transcriptRole = {
  display: 'block',
  color: '#06b6d4',
  marginBottom: '4px',
};

const transcriptContent = {
  margin: '0',
  color: '#e5e7eb',
  whiteSpace: 'pre-wrap' as const,
};
