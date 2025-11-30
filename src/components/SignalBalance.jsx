function SignalBalance({ sentiment }) {
  const { positive = 0, neutral = 0, negative = 0 } = sentiment

  // Calculate total to ensure percentages are correct
  const total = positive + neutral + negative || 100
  const positiveWidth = total > 0 ? (positive / total) * 100 : 0
  const neutralWidth = total > 0 ? (neutral / total) * 100 : 0
  const negativeWidth = total > 0 ? (negative / total) * 100 : 0

  return (
    <div>
      {/* Heading and Percentages Row */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Signal Balance
        </h5>
        
        {/* Percentages with dots */}
        <div className="flex items-center gap-3 text-xs text-gray-700" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {positive > 0 && (
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{positive}%</span>
            </span>
          )}
          {neutral > 0 && (
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>{neutral}%</span>
            </span>
          )}
          {negative > 0 && (
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>{negative}%</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Bar - segments in order: positive (green), neutral (yellow), negative (red) */}
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

export default SignalBalance

