'use client'

import type { NewsItem } from '@/types/news'
import NewsCard from './NewsCard'

interface MoreStoriesProps {
  newsItems: NewsItem[]
  highlightedNewsId?: string | null
  expandedNewsId?: string | null
  onTitleClick?: (id: string) => void
  onCloseHighlight?: () => void
  onShare?: (url: string) => void
}

export default function MoreStories({
  newsItems,
  highlightedNewsId,
  expandedNewsId,
  onTitleClick,
  onCloseHighlight,
  onShare,
}: MoreStoriesProps) {
  if (!newsItems || newsItems.length === 0) {
    return null
  }

  return (
    <div id="more-stories" className="mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wide">
        More Stories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsItems.map((item) => (
          <NewsCard
            key={item.id}
            newsItem={item}
            layout="vertical"
            isHighlighted={highlightedNewsId === String(item.id)}
            highlightedNewsId={highlightedNewsId}
            isExpanded={expandedNewsId === String(item.id)}
            onTitleClick={onTitleClick}
            onCloseHighlight={onCloseHighlight}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  )
}

