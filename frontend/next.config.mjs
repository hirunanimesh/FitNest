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
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Suppress useLayoutEffect warning from Next.js dev overlay
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve hot module replacement
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
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
  disable: process.env.NODE_ENV === 'development', // Disable in development to prevent warnings
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  // Add additional PWA configurations
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
})

export default pwaConfig(nextConfig)
