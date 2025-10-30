/**
 * Access Bucketed Email
 * Sent to users when they're placed in a specific waitlist bucket with a custom message
 */

import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';

interface AccessBucketedProps {
  message: string;
  bucket: string;
}

export function AccessBucketed({ message, bucket }: AccessBucketedProps) {
  return (
    <EmailLayout
      preview="Access request update"
      title="Access Request Update"
    >
      <Text style={paragraph}>
        Thank you for your request—here's the latest update.
      </Text>

      <Section style={messageBox}>
        <Text style={messageLabel}>MESSAGE</Text>
        <Text style={messageText}>{message}</Text>
      </Section>

      <Section style={bucketSection}>
        <Text style={bucketText}>
          You're currently in: <strong style={bucketName}>{bucket}</strong>
        </Text>
      </Section>

      <Text style={footnote}>
        We'll reach out as soon as it's your turn. Thanks for your patience!
      </Text>
    </EmailLayout>
  );
}

export default AccessBucketed;

// Styles
const paragraph = {
  margin: '0 0 24px 0',
  fontSize: '16px',
  color: '#e5e7eb',
  lineHeight: '1.6',
};

const messageBox = {
  backgroundColor: '#000000',
  border: '1px solid #1f2937',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const messageLabel = {
  margin: '0 0 12px 0',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#06b6d4',
  fontWeight: '600',
};

const messageText = {
  margin: '0',
  fontSize: '16px',
  color: '#e5e7eb',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
};

const bucketSection = {
  marginBottom: '24px',
};

const bucketText = {
  margin: '0',
  fontSize: '14px',
  color: '#9ca3af',
  textAlign: 'center' as const,
};

const bucketName = {
  color: '#a855f7',
  fontWeight: '700',
};

const footnote = {
  margin: '24px 0 0 0',
  fontSize: '14px',
  color: '#9ca3af',
  textAlign: 'center' as const,
};
