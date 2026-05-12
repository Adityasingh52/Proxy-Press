import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ["192.168.56.1", "*.trycloudflare.com"],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
