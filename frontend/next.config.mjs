import withPWA from 'next-pwa'

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
  // Suppress useLayoutEffect warning from Next.js dev overlay
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.tsx?$/,
        loader: 'string-replace-loader',
        options: {
          search: 'useLayoutEffect',
          replace: 'useEffect',
          flags: 'g',
        },
        include: [
          /node_modules\/next\/dist\/client\/components\/react-dev-overlay/
        ]
      })
    }
    return config
  },
  // Note: For port configuration, it's better to use package.json scripts
  // This config is for other development settings
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in development
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
})

export default pwaConfig(nextConfig)
