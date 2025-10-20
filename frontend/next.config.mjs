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
  register: true, // Enable service worker for PWA installation
  skipWaiting: true, // Auto-update without showing "new version" message
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development, enable in production
  // Disable update notifications
  reloadOnOnline: false,
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  // No fallbacks - no offline functionality
  // fallbacks: {
  //   document: '/offline',
  // },
  // NO CACHING AT ALL - PWA installation only
  runtimeCaching: [],
})

export default pwaConfig(nextConfig)
