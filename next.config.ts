import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // AVIF first (smallest for the transparent desk PNGs), WebP as fallback.
    formats: ["image/avif", "image/webp"],
  },
  // Browsers and crawlers still ask for /favicon.ico at the root; serve the real
  // one from public/favicon/ instead of keeping a second copy.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon/favicon.ico" }];
  },
};

export default nextConfig;
