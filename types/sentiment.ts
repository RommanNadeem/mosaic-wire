import type { SentimentData } from './news'

export interface Sentiment {
  positive: number
  neutral: number
  negative: number
}

export type SentimentType = 'positive' | 'negative' | 'neutral'

export interface SentimentPercentages {
  positive: number
  neutral: number
  negative: number
}

export { type SentimentData } from './news'

