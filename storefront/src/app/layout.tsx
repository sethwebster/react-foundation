import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { getServerAuthSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "React Foundation Store";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description:
    "Official React Foundation storefront featuring limited drops, past releases, and impact-driven merch.",
  openGraph: {
    siteName,
    title: siteName,
    description:
      "Shop limited React Foundation drops and support open-source initiatives.",
  },
  twitter: {
    title: siteName,
    description:
      "Shop limited React Foundation drops and support open-source initiatives.",
  },
  icons: [
    { rel: "icon", url: "/favicon-32.png", sizes: "32x32" },
    { rel: "icon", url: "/favicon-16.png", sizes: "16x16" },
    { rel: "apple-touch-icon", url: "/favicon-192.png" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon.png" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
