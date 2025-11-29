import SignalBalance from './SignalBalance'
import SourceList from './SourceList'

function NewsCard({ newsItem }) {
  const formatTimeAgo = (minutes) => {
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const getCategoryColor = (category) => {
    const colors = {
      Politics: 'bg-purple-500',
      Technology: 'bg-blue-500',
      Business: 'bg-green-500',
      Sports: 'bg-orange-500',
      Science: 'bg-indigo-500',
      World: 'bg-red-500',
      Economy: 'bg-teal-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  const categoryColor = getCategoryColor(newsItem.category)

  return (
    <article className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Main Content: Image on left, text on right */}
        <div className="flex gap-6 mb-6">
          {/* Left: Image */}
          {newsItem.image && (
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={newsItem.image} 
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Right: Title, Summary, Category, Time */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {newsItem.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">
              {newsItem.summary}
            </p>
            <div className="flex items-center space-x-3 flex-wrap">
              <span className={`${categoryColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                {newsItem.category}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimeAgo(newsItem.timeAgo)}
              </span>
            </div>
          </div>
        </div>

        {/* Signal Balance Bar */}
        <div className="mb-6">
          <SignalBalance sentiment={newsItem.sentiment} />
        </div>

        {/* Sources */}
        <div className="pt-6 border-t border-gray-200">
          {newsItem.sources && newsItem.sources.length > 0 ? (
            <SourceList sources={newsItem.sources} />
          ) : (
            <div>
              <p className="text-gray-500 text-sm italic">No sources available for this topic</p>
              {console.warn('NewsCard: No sources for topic', {
                topicId: newsItem.id,
                topicName: newsItem.title,
                sources: newsItem.sources
              })}
            </div>
          )}
        </div>

        {/* Quote */}
        {newsItem.quote && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <blockquote className="text-gray-700 italic text-lg leading-relaxed">
              "{newsItem.quote}"
            </blockquote>
            {newsItem.quoteAuthor && (
              <a 
                href={`#${newsItem.quoteAuthor}`}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium inline-block transition-colors"
              >
                @{newsItem.quoteAuthor}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default NewsCard
