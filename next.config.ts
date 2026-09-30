import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // AVIF first (smallest for the transparent desk PNGs), WebP as fallback.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
