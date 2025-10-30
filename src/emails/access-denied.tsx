/**
 * Access Denied Email
 * Sent to users when their access request cannot be granted
 */

import { Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';

export function AccessDenied() {
  return (
    <EmailLayout
      preview="Access request update"
      title="Access Request Update"
    >
      <Text style={paragraph}>
        Thank you for your interest in the React Foundation.
      </Text>

      <Text style={paragraph}>
        After careful review, we're unable to grant access at this time. We appreciate your
        understanding and your support for the React ecosystem.
      </Text>

      <Text style={footnote}>
        If you have questions or would like to discuss this decision, please feel free to reply to
        this email.
      </Text>
    </EmailLayout>
  );
}

export default AccessDenied;

// Styles
const paragraph = {
  margin: '0 0 20px 0',
  fontSize: '16px',
  color: '#e5e7eb',
  lineHeight: '1.6',
};

const footnote = {
  margin: '32px 0 0 0',
  fontSize: '14px',
  color: '#9ca3af',
  lineHeight: '1.6',
};
