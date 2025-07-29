/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves from a subdirectory, so we need to set the basePath
  // This will be set via environment variable for flexibility
  basePath: process.env.NODE_ENV === 'production' ? '/anglershub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/anglershub/' : '',
};

module.exports = nextConfig;
