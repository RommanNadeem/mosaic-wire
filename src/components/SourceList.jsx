import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { formatTimeAgo } from '../utils/dataTransformers'

function SourceList({ sources }) {
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-ground-text-primary'
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-ground-text-secondary'
  const textTertiary = theme === 'light' ? 'text-gray-500' : 'text-ground-text-tertiary'
  const dividerColor = theme === 'light' ? 'border-gray-200' : 'border-ground-dark-tertiary'

  if (!sources || sources.length === 0) {
    return (
      <div className={`text-sm ${textTertiary} py-4`}>
        No sources available
      </div>
    )
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-sentiment-positive'
      case 'negative':
        return 'bg-sentiment-negative'
      default:
        return 'bg-sentiment-neutral'
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
    <div key={source.id} className="flex items-start space-x-2 py-1.5">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getSentimentColor(source.sentiment)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-0.5">
          <span className={`text-sm font-medium ${textPrimary}`}>{source.source}</span>
          <span className={`text-xs ${textTertiary}`}>
            {typeof source.timeAgo === 'string' ? source.timeAgo : formatTimeAgo(source.timeAgo)}
          </span>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm ${textSecondary} hover:underline transition-colors ${
            theme === 'light' ? 'hover:text-gray-900' : 'hover:text-ground-text-primary'
          }`}
        >
          {source.headline}
        </a>
      </div>
    </div>
  )

  return (
    <div className="space-y-2 flex flex-col flex-1">
      <div className="flex-1">
        {visibleSources.map(renderSource)}
      </div>

      {hiddenCount > 0 && !isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setIsExpanded(true)
          }}
          className={`w-full flex items-center space-x-2 py-2 text-sm ${textTertiary} transition-colors cursor-pointer mt-auto ${
            theme === 'light' ? 'hover:text-gray-900' : 'hover:text-ground-text-primary'
          }`}
        >
          {/* Sentiment dots cluster */}
          <div className="flex items-center space-x-1">
            {sentimentCounts.positive > 0 && (
              <div className="flex -space-x-1">
                {Array(Math.min(sentimentCounts.positive, 5)).fill(0).map((_, i) => (
                  <div key={`pos-${i}`} className={`w-2 h-2 rounded-full bg-sentiment-positive border ${theme === 'light' ? 'border-gray-100' : 'border-white'}`} />
                ))}
              </div>
            )}
            {sentimentCounts.neutral > 0 && (
              <div className="flex -space-x-1">
                {Array(Math.min(sentimentCounts.neutral, 5)).fill(0).map((_, i) => (
                  <div key={`neu-${i}`} className={`w-2 h-2 rounded-full bg-sentiment-neutral border ${theme === 'light' ? 'border-gray-100' : 'border-white'}`} />
                ))}
              </div>
            )}
            {sentimentCounts.negative > 0 && (
              <div className="flex -space-x-1">
                {Array(Math.min(sentimentCounts.negative, 5)).fill(0).map((_, i) => (
                  <div key={`neg-${i}`} className={`w-2 h-2 rounded-full bg-sentiment-negative border ${theme === 'light' ? 'border-gray-100' : 'border-white'}`} />
                ))}
              </div>
            )}
          </div>
          <span className={`text-sm ${textSecondary}`}>
            {hiddenCount} more source{hiddenCount !== 1 ? 's' : ''}
          </span>
        </button>
      )}

      {isExpanded && hiddenCount > 0 && (
        <div className={`mt-2 pt-2 border-t ${dividerColor}`}>
          <div className="space-y-2">
            {hiddenSources.map((source) => renderSource(source))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsExpanded(false)
            }}
            className={`w-full flex items-center justify-center py-2 text-sm ${textTertiary} transition-colors cursor-pointer mt-2 ${
              theme === 'light' ? 'hover:text-gray-900' : 'hover:text-ground-text-primary'
            }`}
          >
            <span className="mr-1">Show less</span>
            <svg
              className={`w-4 h-4 ${textTertiary}`}
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
