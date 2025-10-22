/**
 * Access Control Hooks
 * Custom hooks for access control, wrapping business logic
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AccessControlService } from './access-control-service';

/**
 * Hook to check if current user has access
 */
export function useAccessControl() {
  const { data: session, status } = useSession();

  const accessCheck = AccessControlService.checkUserAccess(session);

  return {
    isAllowed: accessCheck.isAllowed,
    reason: accessCheck.reason,
    userEmail: accessCheck.userEmail,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}

/**
 * Hook to auto-redirect allowlisted users away from Coming Soon page
 * Call this ONLY on the Coming Soon page
 * Uses server-side API to check allowlist (doesn't expose emails to client)
 * Polls every 5 seconds to detect when user is approved
 */
export function useComingSoonRedirect() {
  const { status } = useSession();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    async function checkAndRedirect() {
      if (status === 'loading') {
        return;
      }

      if (status === 'authenticated') {
        try {
          // Call server-side API to check access
          const response = await fetch('/api/check-access');
          const data = await response.json();

          if (data.isAllowed) {
            console.log('✅ User is allowlisted, redirecting to home...');
            router.push('/');
          } else if (!hasChecked) {
            console.log('ℹ️  User not on allowlist, staying on Coming Soon page');
            setHasChecked(true);
          }
        } catch (_error) {
          console.error('Error checking access:', _error);
          setHasChecked(true);
        }
      } else if (status === 'unauthenticated') {
        setHasChecked(true);
      }
    }

    // Check immediately
    checkAndRedirect();

    // Poll every 5 seconds to detect when access is granted
    const interval = setInterval(checkAndRedirect, 5000);

    return () => clearInterval(interval);
  }, [status, hasChecked, router]);

  return {
    isChecking: status === 'loading' || !hasChecked,
  };
}

/**
 * Hook for access request form
 */
export function useAccessRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async () => {
    // Validate inputs
    const validation = AccessControlService.validateAccessRequest(email, message);

    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
        setMessage('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send request');
      }
    } catch (err) {
      setError('Error sending request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    message,
    setMessage,
    isSubmitting,
    submitted,
    error,
    submitRequest,
  };
}
