/**
 * Base Email Layout
 * Provides consistent React Foundation branding across all emails
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { emailColors, emailTypography, emailSpacing, emailBorders } from '../design-tokens';

interface EmailLayoutProps {
  preview?: string;
  title: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  // Use production URL or fallback for development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://react.foundation';
  const logoUrl = `${baseUrl}/react-logo.png`;

  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Logo/Header */}
          <Section style={header}>
            <div style={logoContainer}>
              <div style={logoBackground}>
                <Img
                  src={logoUrl}
                  alt="React Foundation"
                  width="32"
                  height="32"
                  style={logoImage}
                />
              </div>
              <Text style={brandName}>REACT FOUNDATION</Text>
            </div>
          </Section>

          {/* Main Content Card */}
          <Section style={contentCard}>
            <Heading style={heading}>{title}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Supporting the React ecosystem</Text>
            <Text style={footerCopyright}>
              &copy; {new Date().getFullYear()} React Foundation. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles using design system tokens
const main = {
  backgroundColor: emailColors.background,
  fontFamily: emailTypography.fontFamily,
  padding: `${emailSpacing['2xl']} ${emailSpacing.lg}`,
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
};

const header = {
  padding: `0 0 ${emailSpacing.xl} 0`,
  textAlign: 'center' as const,
};

const logoContainer = {
  display: 'inline-block',
  textAlign: 'center' as const,
};

const logoBackground = {
  width: '56px',
  height: '56px',
  margin: `0 auto ${emailSpacing.md}`,
  background: emailColors.brandGradient,
  borderRadius: emailBorders.radiusXl,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
};

const logoImage = {
  display: 'block',
  margin: '0 auto',
};

const brandName = {
  margin: '0',
  fontSize: emailTypography.sm,
  fontWeight: emailTypography.weightSemibold,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: emailColors.mutedForeground,
};

const contentCard = {
  backgroundColor: emailColors.card,
  border: `${emailBorders.width} solid ${emailColors.cardBorder}`,
  borderRadius: emailBorders.radiusLg,
  padding: emailSpacing['2xl'],
};

const heading = {
  margin: `0 0 ${emailSpacing.lg} 0`,
  fontSize: emailTypography['3xl'],
  fontWeight: emailTypography.weightBold,
  color: emailColors.foreground,
  lineHeight: emailTypography.lineHeightTight,
};

const footer = {
  padding: `${emailSpacing.xl} 0 0 0`,
  textAlign: 'center' as const,
};

const footerText = {
  margin: `0 0 ${emailSpacing.xs} 0`,
  fontSize: emailTypography.sm,
  color: emailColors.mutedForeground,
  lineHeight: emailTypography.lineHeightNormal,
};

const footerCopyright = {
  margin: '0',
  fontSize: emailTypography.sm,
  color: emailColors.mutedForeground,
  lineHeight: emailTypography.lineHeightNormal,
};
