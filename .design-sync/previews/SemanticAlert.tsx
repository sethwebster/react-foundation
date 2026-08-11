// SemanticAlert carries its own border/tinted background plus an optional title slot.
import { SemanticAlert, SemanticButton } from 'storefront';

export const Variants = () => (
  <div className="flex w-full max-w-xl flex-col gap-4">
    <SemanticAlert variant="default" title="RFC comment period open">
      RFC 0063 (Compiler opt-out directive) is accepting feedback until 12 September.
    </SemanticAlert>
    <SemanticAlert variant="success" title="Membership confirmed">
      Vercel is now a Platinum member of the React Foundation. Invoices go to sponsors@vercel.com.
    </SemanticAlert>
    <SemanticAlert variant="warning" title="Maintainer health declining">
      redux has had a single active maintainer for 90 days. Consider opening a succession plan.
    </SemanticAlert>
    <SemanticAlert variant="destructive" title="Impact sync failed">
      Could not reach the GitHub GraphQL API. Contributor scores are 6 hours stale.
    </SemanticAlert>
  </div>
);

export const WithoutTitle = () => (
  <div className="flex w-full max-w-xl flex-col gap-4">
    <SemanticAlert variant="default">
      <p>54 ecosystem libraries were re-scored in last night&rsquo;s RIS run.</p>
    </SemanticAlert>
    <SemanticAlert variant="warning">
      <p>Your GitHub token expires in 3 days — contributor tiers will stop unlocking.</p>
    </SemanticAlert>
  </div>
);

export const WithAction = () => (
  <SemanticAlert variant="destructive" title="Sponsorship payment declined" className="w-full max-w-xl">
    <p>
      The card on file for Shopify&rsquo;s Gold sponsorship was declined on 3 August. Access to
      member-only drops pauses in 7 days.
    </p>
    <div className="mt-4 flex gap-3">
      <SemanticButton variant="destructive" size="sm">
        Update payment method
      </SemanticButton>
      <SemanticButton variant="ghost" size="sm">
        Contact the treasurer
      </SemanticButton>
    </div>
  </SemanticAlert>
);
