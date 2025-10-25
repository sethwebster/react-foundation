/**
 * Admin Layout - Server Component
 * Checks admin access before rendering admin UI
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { AdminSidebar } from './admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to sign in if not authenticated
  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  // Check if user is admin
  const isAdmin = await UserManagementService.isAdmin(session.user.email);

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 mt-20">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-red-400/80">Admin role required to access this area.</p>
          <p className="text-foreground/60 mt-4 text-sm">
            If you believe you should have access, please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // Render admin UI for authorized users
  return (
    <>
      {/* Client-side sidebar for navigation */}
      <AdminSidebar />

      {/* Main Content - scrollable area with margin for sidebar */}
      <main className="ml-16 lg:ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </>
  );
}
