import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jacmiyasafaris.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
