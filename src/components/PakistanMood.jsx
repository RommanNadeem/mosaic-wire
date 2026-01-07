function PakistanMood({ newsData }) {
  if (!newsData || newsData.length === 0) {
    return null
  }

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap(item => item.sources || [])
  
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  }

  allArticles.forEach(article => {
    const sentiment = article.sentiment?.toLowerCase() || 'neutral'
    if (sentimentCounts.hasOwnProperty(sentiment)) {
      sentimentCounts[sentiment]++
    } else {
      sentimentCounts.neutral++
    }
  })

  const total = allArticles.length
  if (total === 0) return null

  const percentages = {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100)
  }

  const moodRows = [
    { label: 'Positive', emoji: '🙂', percentage: percentages.positive, color: 'var(--accent-positive)' },
    { label: 'Neutral', emoji: '😐', percentage: percentages.neutral, color: 'var(--accent-neutral)' },
    { label: 'Negative', emoji: '🙁', percentage: percentages.negative, color: 'var(--accent-negative)' },
  ]

  return (
    <div className="mb-8 sm:mb-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">Pakistan's Mood Today</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Based on today's news coverage across Pakistani sources
          </p>
        </div>
        {/* Summary in top right */}
        <div className="text-xs sm:text-sm text-[var(--text-muted)] sm:text-right">
          <div className="flex flex-wrap sm:whitespace-nowrap gap-1 sm:gap-0">
            <span className="text-[var(--accent-positive)] font-medium">{percentages.positive}% Positive</span>
            <span className="mx-1.5 hidden sm:inline">·</span>
            <span className="text-[var(--accent-neutral)] font-medium">{percentages.neutral}% Neutral</span>
            <span className="mx-1.5 hidden sm:inline">·</span>
            <span className="text-[var(--accent-negative)] font-medium">{percentages.negative}% Negative</span>
          </div>
        </div>
      </div>
      
      {/* Sentiment Breakdown */}
      <div className="space-y-3 sm:space-y-4">
        {moodRows.map((row) => (
          <div key={row.label} className="flex items-center gap-2 sm:gap-3">
            {/* Emoji */}
            <span className="text-base sm:text-lg flex-shrink-0">{row.emoji}</span>
            
            {/* Label */}
            <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] w-14 sm:w-16 flex-shrink-0">
              {row.label}
            </span>
            
            {/* Progress bar */}
            <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden min-w-0">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{ 
                  width: `${row.percentage}%`,
                  backgroundColor: row.color
                }}
              />
            </div>
            
            {/* Percentage label */}
            <span 
              className="text-xs sm:text-sm font-medium w-10 sm:w-12 text-right flex-shrink-0"
              style={{ color: row.color }}
            >
              {row.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PakistanMood
