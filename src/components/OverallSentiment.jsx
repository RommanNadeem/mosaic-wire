function OverallSentiment({ sentiment }) {
  const getSentimentColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-sentiment-positive'
      case 'negative':
        return 'bg-sentiment-negative'
      default:
        return 'bg-sentiment-neutral'
    }
  }

  const getSentimentLabel = (type) => {
    switch (type) {
      case 'positive':
        return 'Positive'
      case 'negative':
        return 'Negative'
      default:
        return 'Neutral'
    }
  }

  const sentimentColor = getSentimentColor(sentiment.type)
  const sentimentLabel = getSentimentLabel(sentiment.type)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Sentiment</h2>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${sentimentColor} transition-all duration-500 rounded-full shadow-sm`}
            style={{ width: `${sentiment.percentage}%` }}
          />
        </div>
        <div className="flex items-center space-x-2 min-w-[140px]">
          <span className="text-lg font-semibold text-gray-900">{sentimentLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-sentiment-positive"></div>
          <span className="text-gray-600">Positive: {sentiment.positive}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-sentiment-neutral"></div>
          <span className="text-gray-600">Neutral: {sentiment.neutral}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-sentiment-negative"></div>
          <span className="text-gray-600">Negative: {sentiment.negative}%</span>
        </div>
      </div>
    </div>
  )
}

export default OverallSentiment
