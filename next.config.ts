import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every screen in this app is backed by live PostgreSQL data through Prisma,
  // so pages render at request time rather than being prerendered/cached.
  cacheComponents: false,
  partialPrefetching: false,
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
