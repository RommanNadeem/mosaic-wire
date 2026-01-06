import { useState } from 'react'
import { formatTimeAgo } from '../utils/dataTransformers'

function SourceList({ sources, onMoreSourcesClick }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!sources || sources.length === 0) {
    return (
      <div className="text-sm text-[var(--text-muted)] py-4 text-left">
        No sources available
      </div>
    )
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-[var(--accent-positive)]'
      case 'negative':
        return 'bg-[var(--accent-negative)]'
      default:
        return 'bg-[var(--accent-neutral)]'
    }
  }

  // Group sources by source name
  const sourcesBySourceName = {}
  sources.forEach(source => {
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
  const visibleSources = visibleSourceNames.map(name => sourcesBySourceName[name][0])
  
  // Get all remaining articles (rest from visible sources + all from hidden sources)
  const hiddenSources = []
  // Add remaining articles from visible sources (skip first one)
  visibleSourceNames.forEach(name => {
    const articles = sourcesBySourceName[name]
    if (articles.length > 1) {
      hiddenSources.push(...articles.slice(1))
    }
  })
  // Add all articles from hidden sources
  hiddenSourceNames.forEach(name => {
    hiddenSources.push(...sourcesBySourceName[name])
  })

  const hiddenCount = hiddenSources.length

  // Get sentiment distribution of hidden sources
  const hiddenSentiments = hiddenSources.map(s => s.sentiment?.toLowerCase() || 'neutral')
  const sentimentCounts = {
    positive: hiddenSentiments.filter(s => s === 'positive').length,
    neutral: hiddenSentiments.filter(s => s === 'neutral').length,
    negative: hiddenSentiments.filter(s => s === 'negative').length
  }

  const renderSource = (source) => (
    <div key={source.id} className="flex items-start gap-2 py-1.5">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${getSentimentColor(source.sentiment)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap text-left">
          <span className="text-sm font-medium text-[var(--text-primary)]">{source.source}</span>
          {source.author && (
            <span className="text-xs text-[var(--text-muted)]">•</span>
          )}
          {source.author && (
            <span className="text-xs text-[var(--text-muted)]">{source.author}</span>
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {typeof source.timeAgo === 'string' ? source.timeAgo : formatTimeAgo(source.timeAgo)}
          </span>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors leading-relaxed text-left block"
        >
          {source.headline}
        </a>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 space-y-0">
        {visibleSources.map(renderSource)}
      </div>

      {hiddenCount > 0 && !isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            if (onMoreSourcesClick) {
              onMoreSourcesClick()
            } else {
              setIsExpanded(true)
            }
          }}
          className="w-full flex items-center gap-2 py-2 text-sm text-[var(--text-muted)] transition-colors cursor-pointer mt-2 hover:text-[var(--text-primary)] text-left"
        >
          {/* Sentiment dots cluster */}
          <div className="flex items-center gap-1">
            {sentimentCounts.positive > 0 && (
              <div className="flex -space-x-0.5">
                {Array(Math.min(sentimentCounts.positive, 5)).fill(0).map((_, i) => (
                  <div key={`pos-${i}`} className="w-1.5 h-1.5 rounded-full bg-[var(--accent-positive)] border border-[var(--bg-card)]" />
                ))}
              </div>
            )}
            {sentimentCounts.neutral > 0 && (
              <div className="flex -space-x-0.5">
                {Array(Math.min(sentimentCounts.neutral, 5)).fill(0).map((_, i) => (
                  <div key={`neu-${i}`} className="w-1.5 h-1.5 rounded-full bg-[var(--accent-neutral)] border border-[var(--bg-card)]" />
                ))}
              </div>
            )}
            {sentimentCounts.negative > 0 && (
              <div className="flex -space-x-0.5">
                {Array(Math.min(sentimentCounts.negative, 5)).fill(0).map((_, i) => (
                  <div key={`neg-${i}`} className="w-1.5 h-1.5 rounded-full bg-[var(--accent-negative)] border border-[var(--bg-card)]" />
                ))}
              </div>
            )}
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            {hiddenCount} more source{hiddenCount !== 1 ? 's' : ''}
          </span>
        </button>
      )}

      {isExpanded && hiddenCount > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="space-y-0">
            {hiddenSources.map((source) => renderSource(source))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsExpanded(false)
            }}
            className="w-full flex items-center gap-1 py-2 text-sm text-[var(--text-muted)] transition-colors cursor-pointer mt-2 hover:text-[var(--text-primary)] text-left"
          >
            <span className="mr-1">Show less</span>
            <svg
              className="w-4 h-4 text-[var(--text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default SourceList
