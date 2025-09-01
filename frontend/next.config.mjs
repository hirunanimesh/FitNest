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
  disable: false, // Always enabled for PWA to work properly
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
