
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Standalone output for efficient production builds in Next.js 15 */
  output: 'standalone',
  /* Security: Hide Next.js identity from DevTools headers for privacy */
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    /* Optimization: Disable image optimization to prevent memory bloat as requested */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
