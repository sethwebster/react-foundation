/**
 * Library List Skeleton
 * Loading state for library list with shimmer effect
 */

export function LibraryListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats bar skeleton */}
      <div className="flex items-center gap-4 flex-wrap text-sm border-t border-b border-border py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 w-32 bg-muted rounded" />
        ))}
      </div>

      {/* Library table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <div className="h-4 w-20 bg-muted rounded" />
              </th>
              <th className="text-left py-3 px-4">
                <div className="h-4 w-24 bg-muted rounded" />
              </th>
              <th className="text-left py-3 px-4">
                <div className="h-4 w-28 bg-muted rounded" />
              </th>
              <th className="text-right py-3 px-4">
                <div className="h-4 w-20 bg-muted rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 px-4 space-y-2">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-muted rounded" />
                    <div className="h-2 w-24 bg-muted rounded-full" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-28 bg-muted rounded-full" />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="h-9 w-24 bg-muted rounded-md ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
