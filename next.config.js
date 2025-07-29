/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only use basePath for GitHub Pages, not for Netlify
  basePath: process.env.NETLIFY ? '' : (process.env.NODE_ENV === 'production' ? '/anglershub' : ''),
  assetPrefix: process.env.NETLIFY ? '' : (process.env.NODE_ENV === 'production' ? '/anglershub/' : ''),
};

module.exports = nextConfig;
