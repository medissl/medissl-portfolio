import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.MEDISSL_BUILD_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cegtlpoofkogscvopcug.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
