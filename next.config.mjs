import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'layar18.top',
        pathname: '/media/**',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
