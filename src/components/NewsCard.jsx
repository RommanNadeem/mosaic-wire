import SignalBalance from './SignalBalance'
import SourceList from './SourceList'
import { useTheme } from '../contexts/ThemeContext'
import { formatTimeAgo } from '../utils/dataTransformers'

function NewsCard({ newsItem }) {
  const { theme } = useTheme()
  
  if (!newsItem) return null

  const { id, title, category, timeAgo, summary, sentiment, image, sources, quote, quoteAuthor, recentArticlesCount } = newsItem

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-ground-dark-secondary'
  const borderColor = theme === 'light' ? 'border-gray-200 hover:border-gray-300' : 'border-ground-dark-tertiary hover:border-ground-medium-grey'
  const imageBg = theme === 'light' ? 'bg-gray-100' : 'bg-ground-dark-tertiary'
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-ground-text-primary'
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-ground-text-secondary'
  const textTertiary = theme === 'light' ? 'text-gray-500' : 'text-ground-text-tertiary'
  const categoryBg = theme === 'light' ? 'bg-gray-100' : 'bg-ground-dark-tertiary'
  const dividerColor = theme === 'light' ? 'border-gray-200' : 'border-ground-dark-tertiary'

  return (
    <article className={`${cardBg} rounded-lg border ${borderColor} overflow-hidden transition-all flex flex-col h-full`}>
      {/* Image */}
      {image && (
        <div className={`w-full h-48 ${imageBg} overflow-hidden flex-shrink-0`}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              {category && (
                <span className={`px-2 py-1 text-xs font-medium ${categoryBg} ${textSecondary} rounded`}>
                  {category}
                </span>
              )}
              <span className={`text-xs ${textTertiary}`}>
                {typeof timeAgo === 'string' ? timeAgo : formatTimeAgo(timeAgo)}
              </span>
              {recentArticlesCount > 0 && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  theme === 'light' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-green-900/30 text-green-400'
                }`}>
                  {recentArticlesCount} new
                </span>
              )}
            </div>
            <h2 className={`text-xl font-bold ${textPrimary} mb-2 leading-tight`}>{title}</h2>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <p className={`${textSecondary} mb-4 leading-relaxed`}>{summary}</p>
        )}

        {/* Signal Balance */}
        {sentiment && (
          <div className="mb-4">
            <SignalBalance sentiment={sentiment} />
          </div>
        )}

        {/* Sources - flex-1 to push expandable to bottom */}
        {sources && sources.length > 0 && (
          <div className="mb-4 flex-1 flex flex-col">
            <SourceList sources={sources} />
          </div>
        )}

        {/* Quote */}
        {quote && (
          <div className={`mt-4 pt-4 border-t ${dividerColor}`}>
            <blockquote className={`${textSecondary} italic mb-2`}>
              "{quote}"
            </blockquote>
            {quoteAuthor && (
              <cite className={`text-sm ${textTertiary}`}>— {quoteAuthor}</cite>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default NewsCard
