import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = {
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
