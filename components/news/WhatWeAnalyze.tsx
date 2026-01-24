'use client'

import type { NewsItem } from '@/types/news'

interface WhatWeAnalyzeProps {
  newsData: NewsItem[]
}

export default function WhatWeAnalyze({ newsData }: WhatWeAnalyzeProps) {
  // Calculate statistics
  const totalStories = newsData.length
  const totalTopics = newsData.length
  const allSources = newsData.flatMap(item => item.sources || [])
  const uniqueSources = new Set(allSources.map(s => s.source).filter(Boolean))
  const totalSources = uniqueSources.size

  return (
    <div className="bg-black text-white p-4 border border-[var(--border-subtle)]">
      <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
        What We Analyze
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">STORIES ANALYZED:</span>
          <span className="font-semibold text-white">{totalStories}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">TOPICS CLUSTERED:</span>
          <span className="font-semibold text-white">{totalTopics}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">SOURCES COMPARED:</span>
          <span className="font-semibold text-white">{totalSources}</span>
        </div>
      </div>
    </div>
  )
}
