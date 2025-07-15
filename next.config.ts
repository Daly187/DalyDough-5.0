import 'dotenv/config';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/fmp/:path*',
        destination: 'https://financialmodelingprep.com/api/v3/:path*',
      },
    ]
  },
};

export default nextConfig;
