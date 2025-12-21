import { useTheme } from '../contexts/ThemeContext'

function SignalBalance({ sentiment }) {
  const { theme } = useTheme()
  
  if (!sentiment) return null

  const { positive, neutral, negative } = sentiment

  const barBg = theme === 'light' ? 'bg-gray-200' : 'bg-ground-dark-tertiary'
  const textColor = theme === 'light' ? 'text-gray-700' : 'text-ground-text-secondary'

  return (
    <div className="mb-4">
      <div className={`flex h-2 rounded-full overflow-hidden ${barBg}`}>
        {positive > 0 && (
          <div
            className="bg-sentiment-positive"
            style={{ width: `${positive}%` }}
            title={`${positive}% Uplift`}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-sentiment-neutral"
            style={{ width: `${neutral}%` }}
            title={`${neutral}% Balanced`}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-sentiment-negative"
            style={{ width: `${negative}%` }}
            title={`${negative}% Critical`}
          />
        )}
      </div>
      <div className={`flex justify-between text-xs ${textColor} mt-2`}>
        <span className="flex items-center space-x-1">
          <span className="text-sentiment-positive font-medium">Uplift {positive}%</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-sentiment-neutral font-medium">Balanced {neutral}%</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-sentiment-negative font-medium">Critical {negative}%</span>
        </span>
      </div>
    </div>
  )
}

export default SignalBalance
