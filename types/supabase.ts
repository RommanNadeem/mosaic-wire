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
  id: string
  topic_id: string
  headline: string | null
  summary: string | null
  tag: string | null
  image_url?: string | null
  article_count: number
  source_count: number
  recent_articles_count: number
  signal_balance: SignalBalance | null
  overall_sentiment: string | null
  top_articles: TopArticle[] | null
  rank_score: number
  trending_score: number
  time_ago: string | null
  topic_time_ago: string | null
  topic_created_at: string | null
  updated_at: string
  created_at?: string
  snapshot_timestamp?: string
  date?: string
  semantic_importance_score?: number
  lifecycle_state?: string | null
  activity_state?: string | null
  quality_state?: string | null
  priority_score?: number
  importance_score?: number
  last_article_at?: string | null
  detailed_summary: string | null
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

