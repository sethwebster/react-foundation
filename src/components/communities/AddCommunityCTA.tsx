/**
 * Add Community CTA
 * Link to add community form
 */

import Link from 'next/link';

export function AddCommunityCTA() {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Don't see your community listed?{' '}
        <Link
          href="/communities/add"
          className="text-primary font-medium hover:underline focus:outline-none focus:underline"
        >
          Add it now →
        </Link>
      </p>
    </div>
  );
}
