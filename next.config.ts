import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export YOQILMAGAN — generateMetadata (SEO) va sitemap.ts ishlashi uchun SSR kerak.
  // Cloudflare Pages > Settings > Build > Framework: "Next.js" preset orqali deploy qilinadi.
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Cloudflare CDN dan kelayotgan rasmlar uchun unoptimized: true (next/image replacament)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.aninov.uz',
      },
      {
        protocol: 'https',
        hostname: 'cdn.aninov.uz',
      },
      {
        protocol: 'https',
        hostname: 'aninovuz-backend.xudoyqulovabdulaziz08.workers.dev',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;