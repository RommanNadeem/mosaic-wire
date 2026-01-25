'use client'

import { useState } from 'react'
import type { Source } from '@/types/news'
import { formatTimeAgo } from '@/utils/formatting/time'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface SourceListProps {
  sources: Source[]
  onMoreSourcesClick?: () => void
  showAll?: boolean
}

export default function SourceList({ sources, onMoreSourcesClick, showAll = false }: SourceListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [brokenFavicons, setBrokenFavicons] = useState<Set<string>>(new Set())

  if (!sources || sources.length === 0) {
    return (
      <div className="text-sm text-[var(--text-muted)] py-4 text-left">
        No sources available
      </div>
    )
  }

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral' | null | undefined) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-[var(--accent-positive)]'
      case 'negative':
        return 'bg-[var(--accent-negative)]'
      case 'neutral':
      default:
        return 'bg-[var(--accent-neutral)]'
    }
  }

  // Group sources by source name
  const sourcesBySourceName: Record<string, Source[]> = {}
  sources.forEach((source) => {
    const sourceName = source.source || 'Unknown'
    if (!sourcesBySourceName[sourceName]) {
      sourcesBySourceName[sourceName] = []
    }
    sourcesBySourceName[sourceName].push(source)
  })

  // Get unique source names and take first article from each
  const uniqueSourceNames = Object.keys(sourcesBySourceName)
  const INITIAL_COUNT = 5
  const visibleSourceNames = uniqueSourceNames.slice(0, INITIAL_COUNT)
  const hiddenSourceNames = uniqueSourceNames.slice(INITIAL_COUNT)

  // Get first article from each visible source (one per unique source)
  const visibleSources = visibleSourceNames.map(
    (name) => sourcesBySourceName[name][0]
  )

  // Get all remaining articles (rest from visible sources + all from hidden sources)
  const hiddenSources: Source[] = []
  // Add remaining articles from visible sources (skip first one)
  visibleSourceNames.forEach((name) => {
    const sourceArticles = sourcesBySourceName[name]
    if (sourceArticles.length > 1) {
      hiddenSources.push(...sourceArticles.slice(1))
    }
  })
  // Add all articles from hidden sources
  hiddenSourceNames.forEach((name) => {
    hiddenSources.push(...sourcesBySourceName[name])
  })

  const shouldShowExpandButton = hiddenSources.length > 0 && !showAll
  const displaySources = showAll || isExpanded ? sources : visibleSources

  // Helper function to extract domain from URL
  const getDomainFromUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
      return match ? match[1] : null
    }
  }

  // Helper function to get Google favicon URL
  const getGoogleFaviconUrl = (domain: string | null): string | null => {
    if (!domain) return null
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  }

  return (
    <div className="flex flex-col space-y-2">
      {displaySources.map((source) => {
        const domain = getDomainFromUrl(source.url)
        const faviconUrl = source.favicon || getGoogleFaviconUrl(domain)
        const isBroken = brokenFavicons.has(source.id)

        return (
          <div
            key={source.id}
            className="flex items-start gap-2 text-sm hover:bg-[var(--bg-surface)] p-2 rounded transition-colors"
          >
            {/* Sentiment indicator */}
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSentimentColor(source.sentiment)}`}
              title={`${source.sentiment || 'neutral'} sentiment`}
            />

            {/* Avatar/Favicon */}
            <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
              {faviconUrl && !isBroken ? (
                <AvatarImage
                  src={faviconUrl}
                  alt={source.source || 'Source'}
                  onError={() => {
                    setBrokenFavicons((prev) => new Set(prev).add(source.id))
                  }}
                />
              ) : null}
              <AvatarFallback className="text-[10px] bg-[var(--bg-surface)] text-[var(--text-muted)]">
                {(source.source || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Source content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {source.source || 'Unknown'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {typeof source.timeAgo === 'string' ? source.timeAgo : formatTimeAgo(source.timeAgo)}
                </span>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-primary)] hover:text-[var(--accent-positive)] line-clamp-2 break-words"
                onClick={(e) => e.stopPropagation()}
              >
                {source.headline}
              </a>
              {source.excerpt && (
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                  {source.excerpt}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {/* Show more button */}
      {shouldShowExpandButton && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsExpanded(true)
          }}
          className="text-xs text-[var(--accent-positive)] hover:underline text-left py-2"
        >
          Show {hiddenSources.length} more source{hiddenSources.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Show less button */}
      {isExpanded && !showAll && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsExpanded(false)
          }}
          className="text-xs text-[var(--text-muted)] hover:underline text-left py-2"
        >
          Show less
        </button>
      )}
    </div>
  )
}

