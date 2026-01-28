import { generateNewsUrl } from '@/utils/routing/navigation'
import { generateGeoMetaTags, getArticleGeoContext } from '@/utils/seo/geo-metadata'
import type { NewsItem } from '@/types/news'

export function generateNewsMetadata(newsItem: NewsItem, baseUrl: string) {
  const imageUrl = newsItem.image || `${baseUrl}/mosaicbeat-white.png`
  const geoContext = getArticleGeoContext(newsItem)
  const geoMetaTags = generateGeoMetaTags(geoContext)
  const publishedTime = newsItem.updatedAt || new Date().toISOString()
  const modifiedTime = newsItem.updatedAt || publishedTime
  
  // Extract keywords from category and sources
  const keywords = [
    newsItem.category,
    'Pakistan news',
    'news aggregation',
    'sentiment analysis',
    ...(newsItem.sources?.map(s => s.source).filter(Boolean).slice(0, 5) || []),
  ].filter(Boolean).join(', ')
  
  // Ensure description is never null (convert null to undefined or provide fallback)
  const description = newsItem.summary || newsItem.detailedSummary || 'Real-time analysis of how Pakistan\'s news is told'
  const ogDescription = newsItem.summary || newsItem.detailedSummary || undefined
  const twitterDescription = newsItem.summary || newsItem.detailedSummary || undefined

  return {
    title: newsItem.title || 'MosaicBeat',
    description: description,
    keywords,
    authors: [{ name: 'MosaicBeat' }],
    openGraph: {
      title: newsItem.title,
      description: ogDescription,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: newsItem.title,
      }],
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['MosaicBeat'],
      section: newsItem.category || 'General',
      tags: keywords.split(', '),
      locale: 'en_PK',
      siteName: 'MosaicBeat',
    },
    twitter: {
      card: 'summary_large_image',
      title: newsItem.title,
      description: twitterDescription,
      images: [imageUrl],
    },
    other: {
      ...geoMetaTags,
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:author': 'MosaicBeat',
      'article:section': newsItem.category || 'General',
    },
  }
}

export function generateDefaultMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'
  const geoMetaTags = generateGeoMetaTags()
  
  return {
    title: 'MosaicBeat - Real-time analysis of how Pakistan\'s news is told',
    description: 'Real-time analysis of how Pakistan\'s news is told',
    keywords: 'Pakistan news, news aggregator, sentiment analysis, AI news, Pakistani journalism',
    openGraph: {
      title: 'MosaicBeat - Real-time analysis of how Pakistan\'s news is told',
      description: 'Real-time analysis of how Pakistan\'s news is told',
      type: 'website',
      locale: 'en_PK',
      siteName: 'MosaicBeat',
      url: baseUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MosaicBeat',
      description: 'Real-time analysis of how Pakistan\'s news is told',
    },
    other: {
      ...geoMetaTags,
    },
  }
}

