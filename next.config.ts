import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// @ts-ignore - Turbopack/Next.js 16 type mismatch
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
  // Fix for Next.js 16 Turbopack/Webpack conflict
  // @ts-ignore
  turbopack: {},
};

export default withPWA(nextConfig);
