import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BookingProvider } from "@/app/context/bookingcontext"
import { AuthProvider } from "@/app/context/auth-context"
import { SearchProvider } from "@/app/context/search-context"
import { ThemeProvider } from "@/app/context/theme-context"
import { TrackingProvider } from "@/app/context/tracking-context"
import { AuthModal } from "@/components/auth-modal"

export const metadata: Metadata = {
  title: 'HarGhar — Home Services On Demand',
  description:
    'Book trusted, hand-picked professionals for cleaning, salon, repairs, and wellness services at your doorstep.',
  keywords: ['Home services', 'Salon at home', 'Plumber', 'Electrician', 'HarGhar', 'Urban Company Alternative'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'HarGhar — Home Services On Demand',
    description: 'Book trusted, hand-picked professionals for cleaning, salon, repairs, and wellness services at your doorstep.',
    url: 'https://harghar.com',
    siteName: 'HarGhar',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HarGhar Home Services',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarGhar — Home Services On Demand',
    description: 'Book trusted professionals for cleaning, salon, repairs, and wellness at your doorstep.',
    images: ['/og-image.jpg'],
  },
  generator: 'HarGhar',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}
export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('hg-theme') || 'light';
                  var resolved = t === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : t;
                  document.documentElement.classList.add(resolved);
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <BookingProvider>
              <SearchProvider>
                <TrackingProvider>
                  {children}
                  <AuthModal />
                </TrackingProvider>
              </SearchProvider>
            </BookingProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
