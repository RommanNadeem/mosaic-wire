import { getTopicBySlug, getLatestTopicsServer, getArticlesForTopicServer } from '@/lib/supabase/queries'
import { transformTopicToNewsItem, transformSupabaseData } from '@/utils/data/transformers'
import { generateNewsMetadata } from '@/utils/meta/generate'
import { processImageForMetaTags } from '@/utils/images/meta-processing'
import { formatTimeAgo, calculateTimeAgo } from '@/utils/formatting/time'
import { createSlug } from '@/utils/routing/navigation'
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '@/utils/seo/structured-data'
import { generateGeoMetaTags, getArticleGeoContext } from '@/utils/seo/geo-metadata'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import NewsDetailClient from './NewsDetailClient'
import type { NewsItem } from '@/types/news'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = await getTopicBySlug(params.slug)
  
  if (!topic) {
    return {
      title: 'News Not Found - MosaicBeat',
    }
  }

  const newsItem = transformTopicToNewsItem(topic)
  if (!newsItem) {
    return {
      title: 'News Not Found - MosaicBeat',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'
  const imageUrl = await processImageForMetaTags(newsItem.image, baseUrl)
  const articleUrl = `${baseUrl}/news/${params.slug}`
  const geoContext = getArticleGeoContext(newsItem)
  const geoMetaTags = generateGeoMetaTags(geoContext)
  
  const metadata = generateNewsMetadata(newsItem, baseUrl)
  const publishedTime = newsItem.updatedAt || new Date().toISOString()
  const modifiedTime = newsItem.updatedAt || publishedTime
  
  // Ensure description is never null for OpenGraph
  const ogDescription = newsItem.summary || newsItem.detailedSummary || undefined
  
  return {
    ...metadata,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      ...metadata.openGraph,
      url: articleUrl,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: ['MosaicBeat'],
      section: newsItem.category || 'General',
      tags: [
        newsItem.category,
        'Pakistan news',
        'news aggregation',
        'sentiment analysis',
        ...(newsItem.sources?.map(s => s.source).filter(Boolean).slice(0, 5) || []),
      ].filter(Boolean) as string[],
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: newsItem.title,
      }] : metadata.openGraph?.images,
      locale: 'en_PK',
      siteName: 'MosaicBeat',
      description: ogDescription,
    },
    twitter: {
      ...metadata.twitter,
      card: 'summary_large_image',
      images: imageUrl ? [imageUrl] : metadata.twitter?.images,
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

export default async function NewsPage({ params }: PageProps) {
  const topic = await getTopicBySlug(params.slug)
  
  if (!topic) {
    notFound()
  }

  const newsItem = transformTopicToNewsItem(topic)
  
  if (!newsItem) {
    notFound()
  }

  // Fetch all topics for trending sidebar
  const allTopics = await getLatestTopicsServer()
  const allNewsData = transformSupabaseData(allTopics)

  // Get articles for this topic
  const articles = await getArticlesForTopicServer(String(newsItem.id))
  
  // Format date
  const date = newsItem.updatedAt 
    ? new Date(newsItem.updatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-')
    : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-')

  // Calculate dominant sentiment for verdict
  const { positive, neutral, negative } = newsItem.sentiment || { positive: 0, neutral: 0, negative: 0 }
  let verdict = 'NEUTRAL'
  if (positive > neutral && positive > negative) {
    verdict = 'POSITIVE'
  } else if (negative > positive && negative > neutral) {
    verdict = 'NEGATIVE'
  }

  // Calculate data snapshot metrics
  const primarySourcesCount = newsItem.sources?.length || 0
  const keywordDensity = primarySourcesCount > 5 ? 'HIGH' : primarySourcesCount > 2 ? 'MEDIUM' : 'LOW'
  const aggregationLatency = '14ms' // This would come from actual data if available

  // Generate structured data schemas
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'
  const newsArticleSchema = generateNewsArticleSchema(newsItem, baseUrl, params.slug)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'News', url: '/' },
    { name: newsItem.title, url: `/news/${params.slug}` },
  ], baseUrl)

  return (
    <>
      {/* NewsArticle Schema */}
      <Script
        id="news-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsDetailClient 
        newsItem={newsItem}
        allNewsData={allNewsData}
        articles={articles}
        date={date}
        verdict={verdict}
        primarySourcesCount={primarySourcesCount}
        keywordDensity={keywordDensity}
        aggregationLatency={aggregationLatency}
      />
    </>
  )
}
