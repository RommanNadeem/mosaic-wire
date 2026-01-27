import type { Metadata } from 'next'
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

