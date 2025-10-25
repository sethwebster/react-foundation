/**
 * Client-side interactive components for the community guide
 * These wrap the guide components with client-side interactivity
 */

'use client';

import { RFDS } from '@/components/rfds';

export function ScrollToButton({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <RFDS.SemanticButton variant="primary" size="lg" onClick={handleClick}>
      {children}
    </RFDS.SemanticButton>
  );
}

export function OpenLinkButton({ url, variant = 'secondary', children }: { url: string; variant?: 'primary' | 'secondary'; children: React.ReactNode }) {
  const handleClick = () => {
    if (url.startsWith('mailto:')) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <RFDS.SemanticButton variant={variant} size="lg" onClick={handleClick}>
      {children}
    </RFDS.SemanticButton>
  );
}
