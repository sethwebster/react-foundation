/**
 * Access Approved Email
 * Sent to users when their access request is approved
 */

import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';

interface AccessApprovedProps {
  signInUrl: string;
}

export function AccessApproved({ signInUrl }: AccessApprovedProps) {
  return (
    <EmailLayout
      preview="Your access has been approved!"
      title="🎉 Welcome to React Foundation!"
    >
      <Text style={paragraph}>
        Great news! Your access request has been approved.
      </Text>

      <Text style={paragraph}>
        You can now sign in and start exploring the React Foundation platform, including:
      </Text>

      <ul style={list}>
        <li style={listItem}>Access to the official React Foundation store</li>
        <li style={listItem}>Contributor status tracking and perks</li>
        <li style={listItem}>Community resources and guides</li>
        <li style={listItem}>Behind-the-scenes updates</li>
      </ul>

      <Section style={actions}>
        <Button style={button} href={signInUrl}>
          Sign In Now
        </Button>
      </Section>

      <Text style={footnote}>
        Welcome to the community! We're excited to have you here.
      </Text>
    </EmailLayout>
  );
}

export default AccessApproved;

// Styles
const paragraph = {
  margin: '0 0 16px 0',
  fontSize: '16px',
  color: '#e5e7eb',
  lineHeight: '1.6',
};

const list = {
  margin: '0 0 24px 0',
  paddingLeft: '24px',
  color: '#e5e7eb',
};

const listItem = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  lineHeight: '1.6',
};

const actions = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#06b6d4',
  color: '#000000',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const footnote = {
  margin: '24px 0 0 0',
  fontSize: '14px',
  color: '#9ca3af',
  textAlign: 'center' as const,
};
