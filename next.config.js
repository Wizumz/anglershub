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
  
  // Compiler options for better browser compatibility
  compiler: {
    // Target older browsers for better compatibility
    styledComponents: true,
  },
  
  // Webpack configuration for better browser support
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add polyfills for older browsers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Enable experimental features for better compatibility
  experimental: {
    esmExternals: false,
  },
  
  // Transpile packages for better browser support
  transpilePackages: ['date-fns'],
};

module.exports = nextConfig;
