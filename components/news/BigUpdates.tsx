'use client'

import type { NewsItem } from '@/types/news'
import NewsCard from './NewsCard'

interface BigUpdatesProps {
  newsItems: NewsItem[]
  onTitleClick?: (id: string) => void
  onShare?: (url: string) => void
}

export default function BigUpdates({ newsItems, onTitleClick, onShare }: BigUpdatesProps) {
  if (!newsItems || newsItems.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          The Big Story
        </h2>
        <a
          href="#more-stories"
          className="text-sm text-[var(--accent-positive)] hover:underline"
        >
          SEE ALL STORIES
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {newsItems.map((item) => (
          <NewsCard
            key={item.id}
            newsItem={item}
            layout="horizontal"
            onTitleClick={onTitleClick}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  )
}

