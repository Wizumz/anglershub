import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves from a subdirectory, so we need to set the basePath
  // This will be set via environment variable for flexibility
  basePath: process.env.NODE_ENV === 'production' ? '/noaa-marine-weather' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/noaa-marine-weather/' : '',
};

export default nextConfig;
