/**
 * Structured Data (JSON-LD) generators for SEO and AI engines
 * Implements Schema.org schemas for better search engine understanding
 */

import type { NewsItem } from '@/types/news'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

/**
 * Generate Organization schema for MosaicBeat
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MosaicBeat',
    url: BASE_URL,
    logo: `${BASE_URL}/mosaicbeat-white.png`,
    description: "A real-time digest of Pakistan's most consequential stories with AI-powered sentiment analysis",
    sameAs: [
      // Add social media links if available
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Pakistan',
      identifier: 'PK',
    },
    foundingLocation: {
      '@type': 'Place',
      name: 'Pakistan',
      addressCountry: 'PK',
    },
  }
}

/**
 * Generate WebSite schema with SearchAction
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MosaicBeat',
    url: BASE_URL,
    description: "Pakistan's news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.",
    publisher: {
      '@type': 'Organization',
      name: 'MosaicBeat',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
    geographicCoverage: {
      '@type': 'Country',
      name: 'Pakistan',
      identifier: 'PK',
    },
  }
}

/**
 * Generate NewsArticle schema for individual articles
 */
export function generateNewsArticleSchema(newsItem: NewsItem, baseUrl: string = BASE_URL, slug?: string) {
  // Use slug if provided, otherwise generate from title and id
  const articleSlug = slug || `${newsItem.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}-${String(newsItem.id).slice(-6)}`
  const articleUrl = `${baseUrl}/news/${articleSlug}`
  const imageUrl = newsItem.image || `${baseUrl}/mosaicbeat-white.png`
  
  // Format dates
  const publishedDate = newsItem.updatedAt || new Date().toISOString()
  const modifiedDate = newsItem.updatedAt || publishedDate

  // Extract keywords from category and sources
  const keywords = [
    newsItem.category,
    'Pakistan news',
    'news aggregation',
    'sentiment analysis',
    ...(newsItem.sources?.map(s => s.source).filter(Boolean) || []),
  ].filter(Boolean).join(', ')

  // Calculate sentiment rating (convert to 1-5 scale)
  const { positive, neutral, negative } = newsItem.sentiment || { positive: 0, neutral: 0, negative: 0 }
  const total = positive + neutral + negative
  const sentimentScore = total > 0 
    ? Math.round((positive / total) * 5) 
    : 3 // Default neutral

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: newsItem.title,
    description: newsItem.summary || newsItem.title,
    image: imageUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Organization',
      name: 'MosaicBeat',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MosaicBeat',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/mosaicbeat-white.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: newsItem.category || 'General',
    keywords: keywords,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    contentLocation: {
      '@type': 'Place',
      name: 'Pakistan',
      addressCountry: 'PK',
    },
    about: {
      '@type': 'Thing',
      name: newsItem.category || 'News',
    },
  }

  // Add detailed summary if available
  if (newsItem.detailedSummary) {
    schema.articleBody = newsItem.detailedSummary
  }

  // Add sentiment as aggregate rating
  if (total > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: sentimentScore,
      ratingCount: total,
      bestRating: 5,
      worstRating: 1,
    }
  }

  // Add source citations
  if (newsItem.sources && newsItem.sources.length > 0) {
    schema.citation = newsItem.sources.map(source => ({
      '@type': 'NewsArticle',
      headline: source.headline,
      url: source.url,
      publisher: {
        '@type': 'Organization',
        name: source.source,
      },
    }))
  }

  return schema
}

/**
 * Generate ItemList schema for homepage/news feed
 */
export function generateItemListSchema(newsItems: NewsItem[], baseUrl: string = BASE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Pakistan's Latest News Stories",
    description: 'Real-time aggregated news from multiple verified sources with sentiment analysis',
    numberOfItems: newsItems.length,
    itemListElement: newsItems.map((item, index) => {
      const itemSlug = `${item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}-${String(item.id).slice(-6)}`
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'NewsArticle',
          headline: item.title,
          url: `${baseUrl}/news/${itemSlug}`,
          image: item.image || `${baseUrl}/mosaicbeat-white.png`,
          datePublished: item.updatedAt || new Date().toISOString(),
          articleSection: item.category || 'General',
        },
      }
    }),
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl: string = BASE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Generate Place schema for geographic context
 */
export function generatePlaceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: 'Pakistan',
    addressCountry: {
      '@type': 'Country',
      name: 'Pakistan',
      identifier: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.3753,
      longitude: 69.3451,
      addressCountry: 'PK',
    },
  }
}

/**
 * Generate FAQPage schema for common questions
 */
export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is MosaicBeat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "MosaicBeat is a real-time news aggregator that provides AI-powered sentiment analysis of Pakistan's most consequential stories from multiple verified sources.",
        },
      },
      {
        '@type': 'Question',
        name: 'How does sentiment analysis work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI analyzes articles from multiple sources and categorizes them as positive, neutral, or negative based on the overall tone and content of the coverage.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where does the news come from?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We aggregate news from verified Pakistani news outlets and analyze coverage across multiple sources to provide a comprehensive view of each story.',
        },
      },
    ],
  }
}

/**
 * Generate HowTo schema for "How to Read" section
 */
export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Read MosaicBeat News',
    description: 'Guide to understanding sentiment analysis and reading news on MosaicBeat',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Understand Sentiment Colors',
        text: 'Green represents positive sentiment (constructive or optimistic coverage), gray represents neutral sentiment (factual or balanced reporting), and red represents negative sentiment (critical or concerning coverage).',
      },
      {
        '@type': 'HowToStep',
        name: 'Read the Sentiment Bar',
        text: 'The sentiment bar visualizes the breakdown of viewpoints across all analyzed sources. Hover over any segment to see the exact percentage of coverage for that sentiment.',
      },
      {
        '@type': 'HowToStep',
        name: 'Verify Sources',
        text: 'Every story is aggregated from multiple verified outlets. Click any source icon or headline to read the original full-length article.',
      },
    ],
  }
}

