'use client'

import type { NewsItem } from '@/types/news'

interface PakistanMoodProps {
  newsData: NewsItem[]
}

export default function PakistanMood({ newsData }: PakistanMoodProps) {
  if (!newsData || newsData.length === 0) return null

  // Calculate statistics
  const allArticles = newsData.flatMap(item => item.sources || [])
  const totalArticles = allArticles.length
  
  if (totalArticles === 0) return null

  // Calculate sentiment percentages based on all articles
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

  const percentages = {
    positive: totalArticles > 0 ? Math.round((sentimentCounts.positive / totalArticles) * 100) : 0,
    neutral: totalArticles > 0 ? Math.round((sentimentCounts.neutral / totalArticles) * 100) : 0,
    negative: 0, // Calculated below to ensure 100% sum
  }
  
  // Ensure the sum is exactly 100% by adjusting the largest segment or negative
  percentages.negative = totalArticles > 0 ? 100 - (percentages.positive + percentages.neutral) : 0;

  return (
    <div className="flex flex-col bg-black text-white p-4 border border-white/10">
      {/* Pakistan's Mood Today Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-1 uppercase tracking-wide">
          Pakistan's Mood Today
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          A snapshot of how today's major stories are being framed across the media landscape.
        </p>
        
        <div className="space-y-3">
          {/* Negative */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white uppercase">NEGATIVE:</span>
              <span className="text-xs font-semibold text-white">{percentages.negative}%</span>
            </div>
            <div className="h-2 bg-gray-800 overflow-hidden">
              <div
                className="bg-[var(--accent-negative)] h-full"
                style={{ width: `${percentages.negative}%` }}
              />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white uppercase">NEUTRAL:</span>
              <span className="text-xs font-semibold text-white">{percentages.neutral}%</span>
            </div>
            <div className="h-2 bg-gray-800 overflow-hidden">
              <div
                className="bg-[var(--accent-neutral)] h-full"
                style={{ width: `${percentages.neutral}%` }}
              />
            </div>
          </div>

          {/* Positive */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white uppercase">POSITIVE:</span>
              <span className="text-xs font-semibold text-white">{percentages.positive}%</span>
            </div>
            <div className="h-2 bg-gray-800 overflow-hidden">
              <div
                className="bg-[var(--accent-positive)] h-full"
                style={{ width: `${percentages.positive}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

