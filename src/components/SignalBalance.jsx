import { useTheme } from '../contexts/ThemeContext'

function SignalBalance({ sentiment, onSentimentClick, selectedSentiment }) {
  const { theme } = useTheme()
  
  if (!sentiment) return null

  const { positive, neutral, negative } = sentiment

  const barBg = theme === 'light' ? 'bg-gray-200' : 'bg-ground-dark-tertiary'
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-ground-text-secondary'

  const handleClick = (sentimentType) => {
    if (onSentimentClick) {
      // Toggle: if already selected, reset to null; otherwise set to clicked sentiment
      onSentimentClick(selectedSentiment === sentimentType ? null : sentimentType)
    }
  }

  const getLabelClasses = (sentimentType) => {
    const isSelected = selectedSentiment === sentimentType
    const baseClasses = `cursor-pointer transition-all duration-200 px-2 py-1 ${
      isSelected 
        ? 'ring-2 ring-offset-1' 
        : 'hover:opacity-80'
    }`
    
    if (isSelected) {
      switch (sentimentType) {
        case 'positive':
          return `${baseClasses} ring-sentiment-positive bg-sentiment-positive/20`
        case 'neutral':
          return `${baseClasses} ring-sentiment-neutral bg-sentiment-neutral/20`
        case 'negative':
          return `${baseClasses} ring-sentiment-negative bg-sentiment-negative/20`
        default:
          return baseClasses
      }
    }
    
    return baseClasses
  }

  return (
    <div className="mb-4">
      <div className={`flex h-2 rounded-full overflow-hidden ${barBg}`}>
        {positive > 0 && (
          <div
            className="bg-sentiment-positive cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${positive}%` }}
            title={`${positive}% Uplift - Click to filter`}
            onClick={() => handleClick('positive')}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-sentiment-neutral cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${neutral}%` }}
            title={`${neutral}% Balanced - Click to filter`}
            onClick={() => handleClick('neutral')}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-sentiment-negative cursor-pointer hover:opacity-80 transition-opacity"
            style={{ width: `${negative}%` }}
            title={`${negative}% Critical - Click to filter`}
            onClick={() => handleClick('negative')}
          />
        )}
      </div>
      <div className={`flex justify-between text-xs ${textColor} mt-2`}>
        <span 
          className={`flex items-center space-x-1 ${getLabelClasses('positive')}`}
          onClick={() => handleClick('positive')}
          title="Click to filter by Uplift sentiment"
        >
          <span className="text-sentiment-positive font-medium">Uplift {positive}%</span>
        </span>
        <span 
          className={`flex items-center space-x-1 ${getLabelClasses('neutral')}`}
          onClick={() => handleClick('neutral')}
          title="Click to filter by Balanced sentiment"
        >
          <span className="text-sentiment-neutral font-medium">Balanced {neutral}%</span>
        </span>
        <span 
          className={`flex items-center space-x-1 ${getLabelClasses('negative')}`}
          onClick={() => handleClick('negative')}
          title="Click to filter by Critical sentiment"
        >
          <span className="text-sentiment-negative font-medium">Critical {negative}%</span>
        </span>
      </div>
    </div>
  )
}

export default SignalBalance
