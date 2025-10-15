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
  disable: false, // Enable PWA in all environments
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  fallbacks: {
    document: '/offline', // fallback for document (page) requests
  },
  // Enhanced PWA configurations for better offline support
  runtimeCaching: [
    // Cache page navigations (documents) with NetworkFirst strategy
    {
      urlPattern: /^https?.*\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        networkTimeoutSeconds: 3,
      },
    },
    // Cache static resources with CacheFirst strategy
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache API calls with NetworkFirst strategy
    {
      urlPattern: /^https?.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 5,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Cache Google Fonts with CacheFirst strategy
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Cache images with CacheFirst strategy
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
})

export default pwaConfig(nextConfig)
