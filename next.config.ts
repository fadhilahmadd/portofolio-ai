import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for slimmer Docker images
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
