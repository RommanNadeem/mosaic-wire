import type { TopicSnapshot, ArticleSnapshot } from '@/types/supabase'
import type { NewsItem, Source } from '@/types/news'
import { calculateTimeAgo, formatTimeAgo } from '@/utils/formatting/time'

/**
 * Calculate sentiment percentages from articles
 */
function calculateSentiment(articles: Source[]) {
  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0,
    }
  }

  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  }

  articles.forEach((article) => {
    const sentiment = article.sentiment?.toLowerCase() || 'neutral'
    if (sentiment in counts) {
      counts[sentiment as keyof typeof counts]++
    } else {
      counts.neutral++
    }
  })

  const total = articles.length
  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  }
}

/**
 * Transform article from Supabase format to component format
 */
export function transformArticle(article: any): Source | null {
  if (!article) {
    return null
  }

  let timeAgo: string
  if (article.time_ago) {
    timeAgo = article.time_ago
  } else {
    const timestamp = article.published_at || article.date_time || article.created_at
    if (timestamp) {
      const minutesAgo = calculateTimeAgo(timestamp)
      timeAgo = formatTimeAgo(minutesAgo)
    } else {
      timeAgo = 'Unknown'
    }
  }

  const sentimentValue = (article.sentiment_label || article.sentiment)?.toLowerCase() || 'neutral'
  const sentiment: 'positive' | 'negative' | 'neutral' = 
    sentimentValue === 'positive' || sentimentValue === 'negative' || sentimentValue === 'neutral'
      ? sentimentValue
      : 'neutral'

  return {
    id: String(article.article_id || article.id),
    source: article.source_name || article.source || 'Unknown',
    headline: article.title || article.headline,
    url: article.url || article.hyperlink,
    sentiment: sentiment,
    timeAgo: timeAgo,
    excerpt: article.snippet || article.excerpt,
    summary: article.summary,
    dateTime: article.published_at || article.date_time,
    category: article.category || article.tag,
    topicId: article.topic_ids?.[0] || article.topic_id,
    topicName: article.topic_name,
    author: article.author || article.author_name || null,
    favicon: article.favicon || null,
  }
}

/**
 * Transform topic from Supabase format to news item format
 */
export function transformTopicToNewsItem(topic: TopicSnapshot, articles: any[] = []): NewsItem | null {
  if (!topic) {
    return null
  }

  const articlesToUse = topic.top_articles || articles
  const transformedArticles = (articlesToUse || [])
    .map(transformArticle)
    .filter((article): article is Source => article !== null)

  let sentiment
  if (topic.signal_balance) {
    const { positive, neutral, negative } = topic.signal_balance
    const total = positive + neutral + negative
    if (total > 0) {
      sentiment = {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      }
    } else {
      sentiment = calculateSentiment(transformedArticles)
    }
  } else {
    sentiment = calculateSentiment(transformedArticles)
  }

  // Calculate time difference from topic_created_at on the frontend
  // Use topic_created_at if available, otherwise fallback to created_at or updated_at
  let timeAgo: string
  const creationTime = topic.topic_created_at || topic.created_at || topic.updated_at
  if (creationTime) {
    const minutesAgo = calculateTimeAgo(creationTime)
    timeAgo = formatTimeAgo(minutesAgo)
  } else {
    // Last resort: use pre-calculated fields if timestamp not available
    if (topic.topic_time_ago) {
      timeAgo = topic.topic_time_ago
    } else if (topic.time_ago) {
      timeAgo = topic.time_ago
    } else {
      timeAgo = 'Unknown'
    }
  }

  return {
    id: topic.topic_id || (topic as any).id,
    title: topic.headline || (topic as any).topic_name || '',
    category: topic.tag || (topic as any).category || null,
    timeAgo: timeAgo,
    summary: topic.summary || (topic as any).ai_summary || '',
    detailedSummary: topic.detailed_summary || null,
    sentiment: sentiment,
    image: topic.image_url || null,
    sources: transformedArticles,
    recentArticlesCount: topic.recent_articles_count,
    publishedAt: topic.topic_created_at || topic.created_at || null,
    updatedAt: topic.updated_at,
  }
}

/**
 * Transform Supabase data to frontend format
 */
export function transformSupabaseData(topics: TopicSnapshot[], articles: any[] = []): NewsItem[] {
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return []
  }

  return topics
    .map((topic) => {
      if (!topic) {
        return null
      }

      let topicArticles: any[] = []
      if (
        topic.top_articles &&
        Array.isArray(topic.top_articles) &&
        topic.top_articles.length > 0
      ) {
        topicArticles = topic.top_articles
      } else if (articles && articles.length > 0 && topic.topic_id) {
        topicArticles = articles.filter(
          (article) =>
            article &&
            article.topic_ids &&
            article.topic_ids.includes(topic.topic_id)
        )
      }

      return transformTopicToNewsItem(topic, topicArticles)
    })
    .filter((item): item is NewsItem => item !== null)
}

