import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "github.com",
      },
    ],
  },
};

export default withMDX(nextConfig);
