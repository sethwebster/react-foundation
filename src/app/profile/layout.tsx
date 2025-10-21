import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { UserManagementService } from "@/lib/admin/user-management-service";
import { ProfileLayoutClient } from "./layout-client";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Check admin status server-side
  const isAdmin = session.user.email
    ? await UserManagementService.isAdmin(session.user.email)
    : false;

  return (
    <>
      <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
        <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
          <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
        </div>

        <ProfileLayoutClient isAdmin={isAdmin}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ProfileLayoutClient>
      </div>

      <Footer />
    </>
  );
}
