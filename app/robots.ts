import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
        ],
        crawlDelay: 1, // 1 second delay for respectful crawling
      },
      // Explicitly allow AI crawlers with optimized settings
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'PerplexityBot',
          'Applebot-Extended',
          'Google-Extended',
          'Bingbot',
          'Googlebot',
        ],
        allow: '/',
        disallow: ['/api/', '/_next/'],
        crawlDelay: 0.5, // Faster crawling for AI bots
      },
      // Google News bot
      {
        userAgent: 'Googlebot-News',
        allow: '/',
        disallow: ['/api/', '/_next/'],
        crawlDelay: 0.5,
      },
      // Twitter bot
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Facebook bot
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-news.xml`, // Google News sitemap (route handler)
    ],
  }
}

