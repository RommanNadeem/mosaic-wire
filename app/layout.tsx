import type { Metadata } from 'next'
import Script from 'next/script'
import { ThemeProvider } from '@/providers/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { generateOrganizationSchema } from '@/utils/seo/structured-data'
import { generateGeoMetaTags, PAKISTAN_GEO } from '@/utils/seo/geo-metadata'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories',
  description: 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.',
  keywords: 'Pakistan news, news aggregator, sentiment analysis, AI news, Pakistani journalism',
  authors: [{ name: 'MosaicBeat' }],
  creator: 'MosaicBeat',
  publisher: 'MosaicBeat',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories',
    description: 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.',
    type: 'website',
    siteName: 'MosaicBeat',
    locale: 'en_PK',
    alternateLocale: 'ur_PK',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/mosaicbeat-white.png`,
        width: 1200,
        height: 630,
        alt: 'MosaicBeat Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MosaicBeat - Pakistan News Aggregator',
    description: 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.',
    images: [`${BASE_URL}/mosaicbeat-white.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
  other: {
    ...generateGeoMetaTags(PAKISTAN_GEO),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://platform.twitter.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://platform.twitter.com" />
        <link rel="preload" href="https://platform.twitter.com/widgets.js" as="script" />
      </head>
      <body>
        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9NYQDTQ53Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9NYQDTQ53Z');
          `}
        </Script>
        {/* Twitter widgets - load early so tweets render faster on article pages */}
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
          id="twitter-widgets"
        />
        {/* Microsoft Clarity - Delayed initialization for better performance */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            window.addEventListener('load', function() {
              setTimeout(function() {
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "uw2ww3u2kd");
              }, 1000);
            });
          `}
        </Script>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col min-w-0">
            <Header />
            <main className="flex-1 min-w-0">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

