import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add other domains here if you host images elsewhere
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  // Enable compression
  compress: true,
  // Enable production source maps for better debugging
  productionBrowserSourceMaps: true,
  // Optimize fonts
  optimizeFonts: true,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Enable page level caching
  staticPageGenerationTimeout: 120,
  // Enable experimental features for better performance
  experimental: {
    // Enable server actions
    serverActions: true,
    // Enable optimistic updates
    optimisticClientCache: true,
    // Enable modern JavaScript features
    modernBrowsers: true,
  },
  // Configure headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
  // Configure caching policy
  async rewrites() {
    return {
      beforeFiles: [
        // Add caching for static assets
        {
          source: '/static/:path*',
          destination: '/_next/static/:path*',
          has: [
            {
              type: 'header',
              key: 'x-matched-path',
            },
          ],
        },
      ],
    };
  },
};

export default nextConfig;
