/**
 * Admin Notification Email - New Access Request
 * Sent to admins when someone requests access
 */

import { Button, Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { emailColors, emailTypography, emailSpacing, emailBorders } from './design-tokens';

interface AccessRequestNotificationProps {
  email: string;
  message: string;
  requestedAt: string;
  requestId: string;
  approveUrl: string;
  denyUrl: string;
  reviewUrl: string;
}

export function AccessRequestNotification({
  email,
  message,
  requestedAt,
  requestId,
  approveUrl,
  denyUrl,
  reviewUrl,
}: AccessRequestNotificationProps) {
  return (
    <EmailLayout
      preview={`New access request from ${email}`}
      title="Early Access Request"
    >
      <Section style={field}>
        <Text style={label}>EMAIL</Text>
        <Text style={value}>{email}</Text>
      </Section>

      <Section style={field}>
        <Text style={label}>MESSAGE</Text>
        <div style={messageBox}>
          <Text style={messageText}>{message}</Text>
        </div>
      </Section>

      <Section style={field}>
        <Text style={label}>REQUESTED AT</Text>
        <Text style={value}>{new Date(requestedAt).toLocaleString()}</Text>
      </Section>

      <Hr style={divider} />

      <Section style={actions}>
        <Button style={approveButton} href={approveUrl}>
          ✅ Approve
        </Button>
        <Button style={denyButton} href={denyUrl}>
          ❌ Deny
        </Button>
        <Button style={reviewButton} href={reviewUrl}>
          👁️ Review
        </Button>
      </Section>

      <Text style={requestIdText}>Request ID: {requestId}</Text>
    </EmailLayout>
  );
}

// Default export for React Email
export default AccessRequestNotification;

// Styles using design system tokens
const field = {
  marginBottom: emailSpacing.lg,
};

const label = {
  margin: `0 0 ${emailSpacing.xs} 0`,
  fontSize: emailTypography.xs,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: emailColors.primary,
  fontWeight: emailTypography.weightSemibold,
};

const value = {
  margin: '0',
  fontSize: emailTypography.base,
  color: emailColors.foreground,
  lineHeight: emailTypography.lineHeightNormal,
};

const messageBox = {
  backgroundColor: emailColors.background,
  border: `${emailBorders.width} solid ${emailColors.cardBorder}`,
  borderRadius: emailBorders.radius,
  padding: emailSpacing.md,
  marginTop: emailSpacing.xs,
};

const messageText = {
  margin: '0',
  fontSize: emailTypography.base,
  color: emailColors.foreground,
  lineHeight: emailTypography.lineHeightRelaxed,
  whiteSpace: 'pre-wrap' as const,
};

const divider = {
  margin: `${emailSpacing.xl} 0`,
  borderColor: emailColors.cardBorder,
};

const actions = {
  textAlign: 'center' as const,
  marginTop: emailSpacing.xl,
};

const buttonBase = {
  display: 'inline-block',
  padding: `14px 28px`,
  borderRadius: emailBorders.radius,
  fontSize: '15px',
  fontWeight: emailTypography.weightSemibold,
  textDecoration: 'none',
  margin: `0 ${emailSpacing.xs} ${emailSpacing.sm} ${emailSpacing.xs}`,
  textAlign: 'center' as const,
};

const approveButton = {
  ...buttonBase,
  backgroundColor: emailColors.success,
  color: emailColors.successForeground,
};

const denyButton = {
  ...buttonBase,
  backgroundColor: emailColors.destructive,
  color: emailColors.destructiveForeground,
};

const reviewButton = {
  ...buttonBase,
  backgroundColor: emailColors.primary,
  color: emailColors.primaryForeground,
};

const requestIdText = {
  margin: `${emailSpacing.lg} 0 0 0`,
  fontSize: emailTypography.xs,
  color: emailColors.mutedForeground,
  textAlign: 'center' as const,
};
