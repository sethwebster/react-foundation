/**
 * Minimal Sticky Test Page
 * Tests if position: sticky works at all in our app
 */

export default function StickyTestPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12">

        {/* Test 1: Inline style sticky */}
        <div className="mb-8 p-4 border border-border rounded">
          <h2 className="text-xl font-bold mb-4">Test 1: Inline Style Sticky</h2>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p>Main content</p>
              {Array.from({ length: 50 }).map((_, i) => (
                <p key={i} className="my-4">
                  Scroll content line {i + 1}
                </p>
              ))}
            </div>
            <div style={{ position: 'sticky', top: '5rem', width: '200px', padding: '1rem', backgroundColor: 'red', color: 'white' }}>
              I SHOULD BE STICKY (inline styles)
            </div>
          </div>
        </div>

        {/* Test 2: Tailwind classes sticky */}
        <div className="mb-8 p-4 border border-border rounded">
          <h2 className="text-xl font-bold mb-4">Test 2: Tailwind Classes Sticky</h2>
          <div className="flex gap-8 items-start">
            <div className="flex-1">
              <p>Main content</p>
              {Array.from({ length: 50 }).map((_, i) => (
                <p key={i} className="my-4">
                  Scroll content line {i + 1}
                </p>
              ))}
            </div>
            <div className="sticky top-20 w-48 p-4 bg-blue-500 text-white">
              I SHOULD BE STICKY (Tailwind)
            </div>
          </div>
        </div>

        {/* Test 3: Grid layout sticky */}
        <div className="mb-8 p-4 border border-border rounded">
          <h2 className="text-xl font-bold mb-4">Test 3: Grid Layout Sticky</h2>
          <div className="grid gap-8 lg:grid-cols-[1fr_200px] items-start">
            <div>
              <p>Main content</p>
              {Array.from({ length: 50 }).map((_, i) => (
                <p key={i} className="my-4">
                  Scroll content line {i + 1}
                </p>
              ))}
            </div>
            <div className="sticky top-20 p-4 bg-green-500 text-white">
              I SHOULD BE STICKY (Grid)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
