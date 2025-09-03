import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitNest - Your Fitness Journey',
  description: 'Transform your fitness journey with FitNest - connecting you with the best gyms and trainers',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['fitness', 'gym', 'trainer', 'workout', 'health', 'exercise'],
  authors: [
    { name: 'FitNest Team' }
  ],
  creator: 'FitNest',
  publisher: 'FitNest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitNest',
  },
  openGraph: {
    type: 'website',
    siteName: 'FitNest',
    title: 'FitNest - Your Fitness Journey',
    description: 'Transform your fitness journey with FitNest - connecting you with the best gyms and trainers',
  },
  twitter: {
    card: 'summary',
    title: 'FitNest - Your Fitness Journey',
    description: 'Transform your fitness journey with FitNest - connecting you with the best gyms and trainers',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/register-sw-simple.js" defer></script>
        <script src="/pwa-diagnostic.js" defer></script>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
