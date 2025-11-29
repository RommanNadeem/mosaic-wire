function SignalBalance({ sentiment }) {
  const { positive = 0, neutral = 0, negative = 0 } = sentiment

  // Calculate total to ensure percentages are correct
  const total = positive + neutral + negative || 100
  const positiveWidth = total > 0 ? (positive / total) * 100 : 0
  const neutralWidth = total > 0 ? (neutral / total) * 100 : 0
  const negativeWidth = total > 0 ? (negative / total) * 100 : 0

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Signal Balance</h4>
      <div className="flex items-center h-6 bg-gray-200 rounded overflow-hidden">
        {positive > 0 && (
          <div
            className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
            style={{ width: `${positiveWidth}%` }}
          >
            {positiveWidth > 12 && <span>{positive}%</span>}
          </div>
        )}
        {neutral > 0 && (
          <div
            className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
            style={{ width: `${neutralWidth}%` }}
          >
            {neutralWidth > 12 && <span>{neutral}%</span>}
          </div>
        )}
        {negative > 0 && (
          <div
            className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
            style={{ width: `${negativeWidth}%` }}
          >
            {negativeWidth > 12 && <span>{negative}%</span>}
          </div>
        )}
      </div>
      {/* Always show percentages below */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <span className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>{positive}%</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>{neutral}%</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>{negative}%</span>
        </span>
      </div>
    </div>
  )
}

export default SignalBalance

