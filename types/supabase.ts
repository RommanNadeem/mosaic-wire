/**
 * TypeScript interfaces for Supabase snapshot tables
 * These match the schema from topic_snapshots and article_snapshots tables
 */

export interface SignalBalance {
  positive: number
  neutral: number
  negative: number
}

export interface TopArticle {
  id: string
  title: string
  url: string
  source: string
  sentiment: 'positive' | 'negative' | 'neutral'
  published_at: string
  favicon?: string
}

export interface TopicSnapshot {
  topic_id: string
  headline: string
  summary: string
  tag?: string | null
  image_url?: string | null
  article_count: number
  source_count?: number
  recent_articles_count?: number
  signal_balance: SignalBalance
  overall_sentiment: number
  top_articles: TopArticle[]
  rank_score: number
  trending_score?: number
  time_ago?: string
  topic_time_ago?: string
  updated_at: string
  created_at?: string
  snapshot_timestamp?: string
  date?: string
}

export interface ArticleSnapshot {
  article_id: string
  title: string
  url: string
  source_name: string
  published_at: string
  sentiment_label: 'positive' | 'negative' | 'neutral'
  sentiment_score: number
  topic_ids: string[]
  snippet?: string | null
  updated_at: string
}

