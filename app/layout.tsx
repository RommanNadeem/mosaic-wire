import type { Metadata } from 'next'
import Script from 'next/script'
import { ThemeProvider } from '@/providers/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories',
  description: 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.',
  keywords: 'Pakistan news, news aggregator, sentiment analysis',
  openGraph: {
    title: 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories',
    description: 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.',
    type: 'website',
    siteName: 'MosaicBeat',
  },
  icons: {
    icon: '/favicon.jpeg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

