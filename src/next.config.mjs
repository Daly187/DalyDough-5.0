
import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: `https://financialmodelingprep.com/api/v3/:path*?apikey=${process.env.FMP_API_KEY}`,
      },
    ]
  },
};

export default nextConfig;
