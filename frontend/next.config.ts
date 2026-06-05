import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: './',
  },
  allowedDevOrigins: ['192.168.1.4'],
};

export default nextConfig;
