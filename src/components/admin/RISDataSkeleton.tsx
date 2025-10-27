/**
 * RIS Data Skeleton
 * Loading state for RIS data section
 */

export function RISDataSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Last updated timestamp */}
      <div className="flex justify-end mb-4">
        <div className="h-5 w-40 bg-muted rounded" />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-4 space-y-2">
            <div className="h-4 w-32 bg-background rounded" />
            <div className="h-8 w-16 bg-background rounded" />
            <div className="h-3 w-40 bg-background rounded" />
          </div>
        ))}
      </div>

      {/* Collection Status */}
      <div className="p-3 bg-muted rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-background rounded" />
          <div className="h-6 w-20 bg-background rounded-full" />
        </div>
        <div className="h-4 w-full bg-background rounded" />
      </div>
    </div>
  );
}
