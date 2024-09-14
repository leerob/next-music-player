import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    ppr: true,
  },
};

export default nextConfig;
