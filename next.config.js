/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // For local images
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 