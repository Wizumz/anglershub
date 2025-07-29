/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Simplified path configuration for Netlify
  basePath: '',
  assetPrefix: '',
  distDir: 'out',
};

module.exports = nextConfig;
