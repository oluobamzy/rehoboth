import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // During development we'll handle TypeScript errors at runtime
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
