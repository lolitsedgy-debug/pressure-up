import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Retained application Server Action limit. This does NOT raise Vercel's
  // separate Function request limit or the limits enforced by API routes.
  experimental: { serverActions: { bodySizeLimit: '52mb' } },
};

export default nextConfig;
