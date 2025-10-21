/**
 * Loading state for admin users page
 */

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12 mt-20">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-48 animate-pulse rounded bg-white/5" />
        </div>

        {/* Form Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="mb-4 h-7 w-32 animate-pulse rounded bg-white/10" />
          <div className="flex gap-4">
            <div className="h-10 flex-1 animate-pulse rounded bg-white/5" />
            <div className="h-10 w-32 animate-pulse rounded bg-white/5" />
            <div className="h-10 w-32 animate-pulse rounded bg-white/5" />
          </div>
        </div>

        {/* Users List Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="mb-4 h-7 w-40 animate-pulse rounded bg-white/10" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-64 animate-pulse rounded bg-white/5" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-16 animate-pulse rounded bg-white/10" />
                    <div className="h-8 w-24 animate-pulse rounded bg-white/5" />
                    <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
