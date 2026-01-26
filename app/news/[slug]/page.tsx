import { getTopicBySlug, getLatestTopicsServer } from '@/lib/supabase/queries'
import { getArticlesForTopicServer } from '@/lib/supabase/queries'
import { transformTopicToNewsItem, transformSupabaseData } from '@/utils/data/transformers'
import { generateNewsMetadata } from '@/utils/meta/generate'
import { processImageForMetaTags } from '@/utils/images/meta-processing'
import { formatTimeAgo, calculateTimeAgo } from '@/utils/formatting/time'
import { createSlug } from '@/utils/routing/navigation'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NewsDetailClient from './NewsDetailClient'
import LatestStories from '@/components/news/LatestStories'
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
  
  const metadata = generateNewsMetadata(newsItem, baseUrl)
  
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: newsItem.title,
      }] : metadata.openGraph?.images,
    },
    twitter: {
      ...metadata.twitter,
      images: imageUrl ? [imageUrl] : metadata.twitter?.images,
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

  // Fetch all topics for sidebar statistics
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

  return (
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
  )
}
