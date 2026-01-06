/**
 * Reusable single horizontal sentiment bar component
 * Displays a segmented bar showing negative, neutral, and positive sentiment percentages
 * Similar to BiasDistribution but for individual news items
 */
function SentimentBar({ sentiment, height = "h-2", showPercentages = true }) {
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
    <div className={`flex ${height} overflow-hidden bg-[var(--bg-surface)]`}>
      {percentages.negative > 0 && (
        <div
          className="bg-[var(--accent-negative)] flex items-center justify-center"
          style={{ width: `${percentages.negative}%` }}
          title={`${percentages.negative}% Negative`}
        >
          {showPercentages && (
            <span className="text-[10px] font-medium text-white px-1">
              {percentages.negative}%
            </span>
          )}
        </div>
      )}
      {percentages.neutral > 0 && (
        <div
          className="bg-[var(--accent-neutral)] flex items-center justify-center"
          style={{ width: `${percentages.neutral}%` }}
          title={`${percentages.neutral}% Neutral`}
        >
          {showPercentages && (
            <span className="text-[10px] font-medium text-white px-1">
              {percentages.neutral}%
            </span>
          )}
        </div>
      )}
      {percentages.positive > 0 && (
        <div
          className="bg-[var(--accent-positive)] flex items-center justify-center"
          style={{ width: `${percentages.positive}%` }}
          title={`${percentages.positive}% Positive`}
        >
          {showPercentages && (
            <span className="text-[10px] font-medium text-white px-1">
              {percentages.positive}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default SentimentBar;
