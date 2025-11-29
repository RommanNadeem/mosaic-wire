import { useState } from 'react'

function SourceList({ sources = [] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTimeAgo = (minutes) => {
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const getSentimentDotColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  // Handle empty or undefined sources
  if (!sources || sources.length === 0) {
    console.warn('SourceList: No sources provided', { sources })
    return (
      <div>
        <p className="text-gray-500 text-sm italic">No sources available for this topic</p>
      </div>
    )
  }

  console.log('SourceList rendering:', {
    totalSources: sources.length,
    firstSource: sources[0]
  })

  // Split sources into prominent (first 3) and remaining
  const prominentSources = sources.slice(0, 3)
  const remainingSources = sources.slice(3)
  const hasMoreSources = remainingSources.length > 0

  const SourceItem = ({ source, index }) => {
    const timeAgo = source.timeAgo ? formatTimeAgo(source.timeAgo) : null
    
    return (
      <div 
        key={index}
        className="flex items-start space-x-3 py-2 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2"
      >
        {/* Sentiment Dot */}
        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getSentimentDotColor(source.sentiment)}`} />
        
        {/* Source Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{source.source}</span>
            {/* Show article category if different from topic category */}
            {source.category && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 text-xs">{source.category}</span>
              </>
            )}
            {timeAgo && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-xs">{timeAgo}</span>
              </>
            )}
          </div>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-blue-600 font-medium text-sm transition-colors block mt-1"
          >
            {source.headline}
          </a>
          {/* Show excerpt from latest_articles_view if available */}
          {source.excerpt && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-2 italic">
              {source.excerpt}
            </p>
          )}
          {/* Show article-level AI summary if available (when excerpt not present) */}
          {source.summary && !source.excerpt && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {source.summary}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Prominent Sources (First 3) */}
      <div className="space-y-1">
        {prominentSources.map((source, index) => (
          <SourceItem key={index} source={source} index={index} />
        ))}
      </div>

      {/* Dropdown for Remaining Sources */}
      {hasMoreSources && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded 
                ? `Hide ${remainingSources.length} more source${remainingSources.length > 1 ? 's' : ''}`
                : `Show ${remainingSources.length} more source${remainingSources.length > 1 ? 's' : ''}`
              }
            </span>
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
              {remainingSources.map((source, index) => (
                <SourceItem key={index + 3} source={source} index={index + 3} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SourceList
