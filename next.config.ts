import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true, // Enable React Compiler v1.0 (moved from experimental)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
    ],
  },
  outputFileTracingIncludes: {
    // This is the route PATH, not a file path:
    '/api/admin/ingest': ['node_modules/jsdom/**'],
    // If your cron endpoint (/api/ris/collect) triggers crawling too,
    // include it as well so it has the files at runtime:
    '/api/ris/collect': ['node_modules/jsdom/**']
  }
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
