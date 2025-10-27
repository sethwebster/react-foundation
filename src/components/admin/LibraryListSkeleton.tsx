/**
 * Library List Skeleton
 * Loading state for library list with shimmer effect
 */

export function LibraryListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats bar skeleton */}
      <div className="flex items-center gap-4 flex-wrap text-sm py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 w-32 bg-muted rounded" />
        ))}
      </div>

      {/* Library cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            {/* Badge skeleton */}
            <div className="h-5 w-28 bg-muted rounded-full" />

            {/* Title skeleton */}
            <div className="h-6 w-3/4 bg-muted rounded" />

            {/* GitHub link skeleton */}
            <div className="h-4 w-1/2 bg-muted rounded" />

            {/* Button skeleton */}
            <div className="h-9 w-full bg-muted rounded-lg mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
