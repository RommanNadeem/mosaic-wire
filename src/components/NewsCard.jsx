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
      Law: 'bg-indigo-500',
      Energy: 'bg-yellow-500',
      Tech: 'bg-blue-500',
      Security: 'bg-red-500',
      'Foreign Policy': 'bg-gray-500',
      Diplomacy: 'bg-blue-500',
      Trade: 'bg-green-500',
      Infrastructure: 'bg-gray-600',
      Environment: 'bg-green-600',
      Disaster: 'bg-red-600',
      Education: 'bg-purple-600',
    }
    return colors[category] || 'bg-gray-500'
  }

  // Handle multiple categories (comma-separated or array)
  const categories = newsItem.category 
    ? (typeof newsItem.category === 'string' 
        ? newsItem.category.split(',').map(c => c.trim())
        : Array.isArray(newsItem.category) 
          ? newsItem.category 
          : [newsItem.category])
    : []

  const timeAgo = newsItem.timeAgo ? formatTimeAgo(newsItem.timeAgo) : null

  return (
    <article className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Image at top left */}
        {newsItem.image && (
          <div className="mb-4">
            <div className="w-full h-48 rounded-lg overflow-hidden shadow-sm">
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

        {/* Title */}
        <h3 className="mb-3 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '18px', fontWeight: '600', color: 'rgb(33, 36, 44)' }}>
          {newsItem.title}
        </h3>

        {/* Summary */}
        <p className="leading-relaxed mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', color: 'rgb(103, 111, 126)' }}>
          {newsItem.summary}
        </p>

        {/* Category and Time */}
        <div className="flex items-center gap-3 mb-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {categories.map((cat, idx) => (
            <span 
              key={idx}
              className={`${getCategoryColor(cat)} text-white px-3 py-1 rounded-full text-xs font-medium`}
            >
              {cat}
            </span>
          ))}
          {timeAgo && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeAgo}</span>
            </div>
          )}
        </div>

        {/* Signal Balance Bar */}
        <div className="mb-6">
          <SignalBalance sentiment={newsItem.sentiment} />
        </div>

        {/* Related Sources */}
        {newsItem.sources && newsItem.sources.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Related Sources
            </h4>
            <SourceList sources={newsItem.sources} />
          </div>
        )}
      </div>
    </article>
  )
}

export default NewsCard
