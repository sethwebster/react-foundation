// Rating draws `max` React-logo glyphs masked in ratings gold, partially
// clipped for fractional values, with an optional review count. count={0} is a
// distinct state: no glyphs, "No reviews yet". Usage ported from
// src/components/ui/product-card.tsx (sm + count) and
// src/components/home/hero.tsx (md + count).
import { Rating } from 'storefront';

export const WithReviewCount = () => (
  <div className="flex flex-col gap-4">
    <Rating value={4.5} count={128} />
    <Rating value={4.5} count={128} size="md" />
  </div>
);

export const Values = () => (
  <div className="flex flex-col gap-3">
    {[5, 4.2, 3, 1.5, 0].map((value) => (
      <div key={value} className="flex items-center gap-4">
        <span className="w-8 text-xs tabular-nums text-muted-foreground">
          {value.toFixed(1)}
        </span>
        <Rating value={value} />
      </div>
    ))}
  </div>
);

export const NoReviews = () => (
  <div className="max-w-sm rounded-2xl border border-border bg-card p-5">
    <p className="text-sm font-semibold text-foreground">Server Components tee</p>
    <p className="mt-1 text-sm text-muted-foreground">Just added to Drop 004</p>
    <Rating value={0} count={0} className="mt-3" />
  </div>
);

export const InProductCard = () => (
  <div className="max-w-sm rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-foreground">Maintainer hoodie</p>
      <span className="text-sm font-medium text-muted-foreground">$78</span>
    </div>
    <Rating value={4.8} count={1342} className="mt-3" />
  </div>
);
