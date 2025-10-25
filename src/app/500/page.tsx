/**
 * Test route to trigger error page
 * Navigate to /500 to see the global error page
 */

'use client';

import { useEffect } from 'react';

export default function TestErrorPage() {
  useEffect(() => {
    // Throw error immediately when component mounts
    throw new Error('Test error triggered from /500 route');
  }, []);

  return null;
}
