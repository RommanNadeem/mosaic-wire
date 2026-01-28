/**
 * AI Engine Specific Optimizations
 * Utilities to make content more parseable and understandable for AI search engines
 */

import type { NewsItem, Source } from '@/types/news'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

/**
 * Generate entity relationships for AI understanding
 * Maps topics, sources, and sentiment into structured relationships
 */
export function generateEntityRelationships(newsItem: NewsItem) {
  const entities = {
    topics: [newsItem.category].filter(Boolean),
    sources: newsItem.sources?.map(s => s.source).filter(Boolean) || [],
    sentiment: {
      positive: newsItem.sentiment?.positive || 0,
      neutral: newsItem.sentiment?.neutral || 0,
      negative: newsItem.sentiment?.negative || 0,
    },
    keywords: extractKeywords(newsItem),
  }

  return entities
}

/**
 * Extract keywords from news item for better AI understanding
 */
export function extractKeywords(newsItem: NewsItem): string[] {
  const keywords: string[] = []

  // Add category
  if (newsItem.category) {
    keywords.push(newsItem.category)
  }

  // Add source names
  if (newsItem.sources) {
    newsItem.sources.forEach(source => {
      if (source.source) {
        keywords.push(source.source)
      }
    })
  }

  // Extract keywords from title (common Pakistan news terms)
  const titleKeywords = newsItem.title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'from', 'that', 'this'].includes(word)
    )
  
  keywords.push(...titleKeywords)

  // Add Pakistan-specific terms
  keywords.push('Pakistan', 'Pakistani news', 'news aggregation')

  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Generate clear summary/abstract for AI parsing
 * Ensures content is parseable without JavaScript
 */
export function generateAISummary(newsItem: NewsItem): string {
  const parts: string[] = []

  // Title
  parts.push(`Title: ${newsItem.title}`)

  // Summary
  if (newsItem.summary) {
    parts.push(`Summary: ${newsItem.summary}`)
  }

  // Category
  if (newsItem.category) {
    parts.push(`Category: ${newsItem.category}`)
  }

  // Sentiment breakdown
  if (newsItem.sentiment) {
    const { positive, neutral, negative } = newsItem.sentiment
    const total = positive + neutral + negative
    if (total > 0) {
      parts.push(
        `Sentiment Analysis: ${Math.round((positive / total) * 100)}% positive, ` +
        `${Math.round((neutral / total) * 100)}% neutral, ` +
        `${Math.round((negative / total) * 100)}% negative`
      )
    }
  }

  // Source count
  if (newsItem.sources && newsItem.sources.length > 0) {
    parts.push(`Sources: ${newsItem.sources.length} verified news outlets`)
  }

  return parts.join('. ')
}

/**
 * Generate structured content hierarchy for AI parsing
 * Ensures clear H1 → H2 → H3 structure
 */
export interface ContentHierarchy {
  h1: string
  h2: string[]
  h3: string[]
}

export function generateContentHierarchy(newsItem: NewsItem): ContentHierarchy {
  return {
    h1: newsItem.title,
    h2: [
      'Summary',
      'Sentiment Analysis',
      'Sources in Cluster',
    ],
    h3: newsItem.sources?.map(s => s.headline).filter(Boolean).slice(0, 5) || [],
  }
}

/**
 * Generate entity markup for better AI understanding
 * Creates a structured representation of entities in the article
 */
export function generateEntityMarkup(newsItem: NewsItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: newsItem.title,
    about: [
      {
        '@type': 'Thing',
        name: newsItem.category || 'News',
      },
      {
        '@type': 'Place',
        name: 'Pakistan',
        addressCountry: 'PK',
      },
    ],
    mentions: newsItem.sources?.map(source => ({
      '@type': 'NewsArticle',
      headline: source.headline,
      publisher: {
        '@type': 'Organization',
        name: source.source,
      },
    })) || [],
  }
}

/**
 * Ensure content is accessible without JavaScript
 * Returns plain text version of content
 */
export function generatePlainTextContent(newsItem: NewsItem): string {
  const lines: string[] = []

  lines.push(newsItem.title)
  lines.push('')
  
  if (newsItem.summary) {
    lines.push(newsItem.summary)
    lines.push('')
  }

  if (newsItem.detailedSummary) {
    lines.push(newsItem.detailedSummary)
    lines.push('')
  }

  if (newsItem.sources && newsItem.sources.length > 0) {
    lines.push('Sources:')
    newsItem.sources.forEach((source, index) => {
      lines.push(`${index + 1}. ${source.headline} - ${source.source}`)
    })
  }

  return lines.join('\n')
}

/**
 * Generate FAQ schema for common questions about the platform
 */
export function generatePlatformFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is MosaicBeat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "MosaicBeat is a real-time news aggregator that provides AI-powered sentiment analysis of Pakistan's most consequential stories from multiple verified sources. It helps readers understand how different news outlets are covering the same story.",
        },
      },
      {
        '@type': 'Question',
        name: 'How does sentiment analysis work on MosaicBeat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI analyzes articles from multiple sources and categorizes them as positive (green), neutral (gray), or negative (red) based on the overall tone and content of the coverage. The sentiment bar visualizes the breakdown of viewpoints across all analyzed sources.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where does MosaicBeat get its news?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We aggregate news from verified Pakistani news outlets and analyze coverage across multiple sources to provide a comprehensive view of each story. Every article links back to the original source.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often is the news updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MosaicBeat updates in real-time, aggregating the latest stories from multiple sources as they are published. The platform provides hourly updates to ensure you have access to the most current news coverage.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is MosaicBeat free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, MosaicBeat is completely free to use. All news articles and sentiment analysis are available without any subscription or payment required.',
        },
      },
    ],
  }
}

