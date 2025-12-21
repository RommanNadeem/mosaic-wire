function SentimentBar({ sentiment }) {
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
    <div>
      <div className="flex items-center space-x-3 mb-2">
        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${sentimentColor} transition-all duration-500 rounded-full`}
            style={{ width: `${sentiment.percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {sentiment.percentage}% {sentimentLabel.toLowerCase()}
        </span>
      </div>
    </div>
  )
}

export default SentimentBar



