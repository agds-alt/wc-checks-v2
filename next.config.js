/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // ESLint configuration - ignore warnings during build
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings during build
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Still check TypeScript errors
  },

  // Webpack config for superjson
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
};

export default nextConfig;
