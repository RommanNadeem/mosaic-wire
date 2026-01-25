'use client'

import type { NewsItem } from '@/types/news'

interface BiasDistributionProps {
  newsData: NewsItem[]
}

export default function BiasDistribution({ newsData }: BiasDistributionProps) {
  if (!newsData || newsData.length === 0) return null

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap(item => item.sources || [])
  
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  }

  allArticles.forEach(article => {
    const sentiment = article.sentiment?.toLowerCase() || 'neutral'
    if (sentiment in sentimentCounts) {
      sentimentCounts[sentiment as keyof typeof sentimentCounts]++
    } else {
      sentimentCounts.neutral++
    }
  })

  const totalArticles = allArticles.length
  if (totalArticles === 0) return null

  // Count unique sources
  const uniqueSources = new Set(allArticles.map(a => a.source).filter(Boolean))
  const totalSources = uniqueSources.size

  const percentages = {
    positive: totalArticles > 0 ? Math.round((sentimentCounts.positive / totalArticles) * 1000) / 10 : 0,
    neutral: totalArticles > 0 ? Math.round((sentimentCounts.neutral / totalArticles) * 1000) / 10 : 0,
    negative: totalArticles > 0 ? Math.round((sentimentCounts.negative / totalArticles) * 1000) / 10 : 0,
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wide flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--accent-positive)]"></span>
        Pakistan's Mood Today
      </h2>
      
      <div className="space-y-3">
        {/* Negative */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">NEGATIVE:</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{percentages.negative}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="bg-[var(--accent-negative)] h-full"
              style={{ width: `${percentages.negative}%` }}
            />
          </div>
        </div>

        {/* Neutral */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">NEUTRAL:</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{percentages.neutral}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="bg-[var(--accent-neutral)] h-full"
              style={{ width: `${percentages.neutral}%` }}
            />
          </div>
        </div>

        {/* Positive */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">POSITIVE:</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{percentages.positive}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-surface)] overflow-hidden">
            <div
              className="bg-[var(--accent-positive)] h-full"
              style={{ width: `${percentages.positive}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4">
        ANALYSIS BASED ON TODAY'S COVERAGE ACROSS {totalSources} SOURCE{totalSources !== 1 ? 'S' : ''}.
      </p>
    </div>
  )
}
