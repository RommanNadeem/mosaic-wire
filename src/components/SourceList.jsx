function SourceList({ sources = [] }) {

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

  const SourceItem = ({ source, index }) => {
    const timeAgo = source.timeAgo ? formatTimeAgo(source.timeAgo) : source.authorTime || null
    
    return (
      <div 
        key={index}
        className="flex items-start gap-3 py-3"
      >
        {/* Sentiment Dot */}
        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getSentimentDotColor(source.sentiment)}`} />
        
        {/* Source Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-wrap" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span className="font-semibold text-gray-900">{source.source}</span>
            {/* Show author if available */}
            {source.author && source.author.trim() && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-700">{source.author}</span>
              </>
            )}
            {timeAgo && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">{timeAgo}</span>
              </>
            )}
          </div>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-blue-600 font-medium text-sm transition-colors block mt-1 leading-snug"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {source.headline}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {sources.map((source, index) => (
        <SourceItem key={index} source={source} index={index} />
      ))}
    </div>
  )
}

export default SourceList
