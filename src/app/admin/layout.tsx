/**
 * Admin Layout
 * Renders admin shell immediately, checks auth in background
 */

import { Suspense } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminAuthGuard } from './admin-auth-guard';

/**
 * Layout renders immediately - just the shell
 * Auth check happens inside Suspense boundary
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sidebar - renders immediately */}
      <AdminSidebar />

      {/* Content - streams in after auth check */}
      <div className="fixed top-16 bottom-0 left-16 lg:left-64 right-0 overflow-y-auto bg-background">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </Suspense>
      </div>
    </>
  );
}
