import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GitLabProvider from "next-auth/providers/gitlab";
import { getRequiredEnvVar, getOptionalEnvVar } from "./env";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: getRequiredEnvVar('GITHUB_CLIENT_ID'),
      clientSecret: getRequiredEnvVar('GITHUB_CLIENT_SECRET'),
      authorization: {
        params: {
          scope: "read:user public_repo",
        },
      },
    }),
    GitLabProvider({
      clientId: getOptionalEnvVar('GITLAB_CLIENT_ID'),
      clientSecret: getOptionalEnvVar('GITLAB_CLIENT_SECRET'),
      authorization: {
        params: {
          scope: "read_user read_api",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/", // Redirect to home after signout (no confirmation page)
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && typeof profile === "object" && "login" in profile) {
        token.githubLogin = String((profile as { login?: string }).login ?? "");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.githubLogin = token.githubLogin as string | undefined;
      }
      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
