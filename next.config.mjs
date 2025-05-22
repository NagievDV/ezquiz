/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { "cloudinary": "commonjs cloudinary" }];
    return config;
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig; 