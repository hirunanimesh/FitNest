/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Development server configuration
  devIndicators: {
    buildActivity: true,
  },
  // Note: For port configuration, it's better to use package.json scripts
  // This config is for other development settings
}

export default nextConfig
