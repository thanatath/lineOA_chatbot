import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.line-scdn.net",
      },
      {
        protocol: "https",
        hostname: "*.line.me",
      },
    ],
  },
};

export default nextConfig;
