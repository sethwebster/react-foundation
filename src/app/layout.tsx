import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { getServerAuthSession } from "@/lib/auth";

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
        <ThemeProvider defaultTheme="dark">
          <AuthProvider session={session}>
            <Header />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
