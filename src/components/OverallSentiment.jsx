function OverallSentiment({ sentiment }) {
  const { positive = 0, neutral = 0, negative = 0 } = sentiment

  // Calculate total to ensure percentages are correct
  const total = positive + neutral + negative || 100
  const positiveWidth = total > 0 ? (positive / total) * 100 : 0
  const neutralWidth = total > 0 ? (neutral / total) * 100 : 0
  const negativeWidth = total > 0 ? (negative / total) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Today's Signal Balance
        </h2>
        <div className="flex items-center gap-4 text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <span className="flex items-center gap-1.5 text-gray-700">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Uplift {positive}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-700">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Balanced {neutral}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-700">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Critical {negative}%</span>
          </span>
        </div>
      </div>
      {/* Bar */}
      <div className="w-full h-4 rounded overflow-hidden flex">
        {positive > 0 && (
          <div
            className="bg-green-500 h-full transition-all duration-300 flex-shrink-0"
            style={{ width: `${positiveWidth}%`, minWidth: positiveWidth > 0 ? '2px' : '0' }}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-yellow-500 h-full transition-all duration-300 flex-shrink-0"
            style={{ width: `${neutralWidth}%`, minWidth: neutralWidth > 0 ? '2px' : '0' }}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-red-500 h-full transition-all duration-300 flex-shrink-0"
            style={{ width: `${negativeWidth}%`, minWidth: negativeWidth > 0 ? '2px' : '0' }}
          />
        )}
      </div>
    </div>
  )
}

export default OverallSentiment
