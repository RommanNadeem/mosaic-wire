function SentimentBars({ sentiment }) {
  if (!sentiment) return null;

  const { positive, neutral, negative } = sentiment;

  // Calculate percentages
  const total = positive + neutral + negative;
  if (total === 0) return null;

  const percentages = {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  };

  return (
    <div className="space-y-1">
      {/* Three horizontal bars - Red, Grey, Green */}
      {percentages.negative > 0 && (
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-[var(--accent-negative)] rounded-full flex items-center justify-end pr-1">
            <span className="text-[10px] font-medium text-white">
              {percentages.negative}%
            </span>
          </div>
        </div>
      )}
      {percentages.neutral > 0 && (
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-[var(--accent-neutral)] rounded-full flex items-center justify-end pr-1">
            <span className="text-[10px] font-medium text-white">
              {percentages.neutral}%
            </span>
          </div>
        </div>
      )}
      {percentages.positive > 0 && (
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-[var(--accent-positive)] rounded-full flex items-center justify-end pr-1">
            <span className="text-[10px] font-medium text-white">
              {percentages.positive}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SentimentBars;

