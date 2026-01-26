'use client'

import type { NewsItem, Source } from '@/types/news'
import { calculateTimeAgo, formatTimeAgo } from '@/utils/formatting/time'

interface LatestStoriesProps {
  newsData: NewsItem[]
}

export default function LatestStories({ newsData }: LatestStoriesProps) {
  // Get the most recent article from each topic based on publication time
  const latestArticles: Array<{ newsItem: NewsItem; latestSource: Source }> = []
  
  newsData.forEach((item) => {
    if (item.sources && item.sources.length > 0) {
      // Sort sources by dateTime (most recent first)
      const sortedSources = [...item.sources].sort((a, b) => {
        const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0
        const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0
        return dateB - dateA // Most recent first
      })
      
      // If no dateTime, fallback to sorting by timeAgo
      if (!sortedSources[0]?.dateTime) {
        sortedSources.sort((a, b) => {
          const timeA = typeof a.timeAgo === 'string' ? a.timeAgo : String(a.timeAgo)
          const timeB = typeof b.timeAgo === 'string' ? b.timeAgo : String(b.timeAgo)
          // Parse timeAgo strings for comparison
          const getMinutes = (timeStr: string): number => {
            const str = timeStr.toUpperCase()
            if (str.includes('M AGO')) {
              const match = str.match(/(\d+)\s*M\s*AGO/)
              return match ? parseInt(match[1]) : 0
            }
            if (str.includes('H AGO')) {
              const match = str.match(/(\d+)\s*H\s*AGO/)
              return match ? parseInt(match[1]) * 60 : 0
            }
            if (str.includes('D AGO')) {
              const match = str.match(/(\d+)\s*D\s*AGO/)
              return match ? parseInt(match[1]) * 1440 : 0
            }
            return 0
          }
          return getMinutes(timeA) - getMinutes(timeB)
        })
      }
      
      latestArticles.push({
        newsItem: item,
        latestSource: sortedSources[0]
      })
    }
  })
  
  // Sort by publication time (most recent first)
  latestArticles.sort((a, b) => {
    const dateA = a.latestSource.dateTime ? new Date(a.latestSource.dateTime).getTime() : 0
    const dateB = b.latestSource.dateTime ? new Date(b.latestSource.dateTime).getTime() : 0
    
    if (dateA && dateB) {
      return dateB - dateA // Most recent first
    }
    
    // Fallback to timeAgo if dateTime not available
    const timeA = typeof a.latestSource.timeAgo === 'string' ? a.latestSource.timeAgo : String(a.latestSource.timeAgo)
    const timeB = typeof b.latestSource.timeAgo === 'string' ? b.latestSource.timeAgo : String(b.latestSource.timeAgo)
    const getMinutes = (timeStr: string): number => {
      const str = timeStr.toUpperCase()
      if (str.includes('M AGO')) {
        const match = str.match(/(\d+)\s*M\s*AGO/)
        return match ? parseInt(match[1]) : 0
      }
      if (str.includes('H AGO')) {
        const match = str.match(/(\d+)\s*H\s*AGO/)
        return match ? parseInt(match[1]) * 60 : 0
      }
      if (str.includes('D AGO')) {
        const match = str.match(/(\d+)\s*D\s*AGO/)
        return match ? parseInt(match[1]) * 1440 : 0
      }
      return 0
    }
    return getMinutes(timeA) - getMinutes(timeB)
  })

  if (latestArticles.length === 0) {
    return null
  }

  return (
    <div className="p-4 border border-[var(--border-subtle)]">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wide">
        The Latest
      </h2>
      <div className="space-y-3">
        {latestArticles.slice(0, 10).map(({ newsItem, latestSource }) => {
          // Calculate time from publication date (dateTime)
          let displayTime: string
          if (latestSource.dateTime) {
            const minutesAgo = calculateTimeAgo(latestSource.dateTime)
            displayTime = formatTimeAgo(minutesAgo).toUpperCase()
          } else {
            // Fallback to timeAgo if dateTime not available
            displayTime = typeof latestSource.timeAgo === 'string' 
              ? latestSource.timeAgo.toUpperCase()
              : String(latestSource.timeAgo).toUpperCase()
          }
          
          return (
            <div key={`${newsItem.id}-${latestSource.id}`} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[var(--text-primary)]">
                  {latestSource.source || 'Unknown'}:
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {displayTime}
                </span>
              </div>
              <a
                href={latestSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-positive)] block break-words"
              >
                {latestSource.headline}
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

