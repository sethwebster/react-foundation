import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { getServerAuthSession } from "@/lib/auth";
import { SupportChat } from "@/features/support-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "React Foundation";
const siteUrl = "https://react.foundation"; 
const description =
  "Supporting the React ecosystem through community funding, transparent governance, and official merchandise. Every purchase funds maintainers of 54+ React libraries.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description,
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: "React Foundation - Supporting the React Ecosystem",
    description,
    images: [
      {
        url: "/opengraph-image", // Next.js will generate this
        width: 1200,
        height: 630,
        alt: "React Foundation - Supporting the React Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@reactjs",
    creator: "@reactjs",
    title: "React Foundation - Supporting the React Ecosystem",
    description,
    images: ["/opengraph-image"],
  },
  icons: [
    { rel: "icon", url: "/favicon.ico", sizes: "any" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    { rel: "icon", url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    { rel: "icon", url: "/favicon-256.png", sizes: "256x256", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  const isChatEnabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT === "true";
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <AuthProvider session={session}>
            <Header />
            {children}
            {isChatEnabled ? <SupportChat /> : null}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
