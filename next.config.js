/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Environment variables validation
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Webpack config for superjson
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
};

module.exports = nextConfig;
