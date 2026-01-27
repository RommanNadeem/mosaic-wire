import type { TopicSnapshot } from './supabase'

export interface NewsItem {
  id: string
  title: string
  category: string | null
  timeAgo: string
  summary: string
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  image: string | null
  sources: Source[]
  recentArticlesCount?: number
  updatedAt?: string
  detailedSummary?: string | null
}

export interface Source {
  id: string
  source: string
  headline: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  timeAgo: string
  excerpt?: string | null
  summary?: string | null
  dateTime?: string
  category?: string | null
  topicId?: string
  topicName?: string
  author?: string | null
  favicon?: string | null
}

export interface SentimentData {
  positive: number
  neutral: number
  negative: number
}

export { type TopicSnapshot } from './supabase'

