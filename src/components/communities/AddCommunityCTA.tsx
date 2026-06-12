/**
 * Add Community CTA
 * Link to add community form
 */

import Link from 'next/link';

export function AddCommunityCTA() {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-[#5E687E]">
        Don't see your community listed?{' '}
        <Link
          href="/communities/add"
          className="font-semibold text-[#087EA4]! hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]"
        >
          Add it now →
        </Link>
      </p>
    </div>
  );
}
