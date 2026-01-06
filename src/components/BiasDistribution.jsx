function BiasDistribution({ newsData }) {
  if (!newsData || newsData.length === 0) {
    return null;
  }

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap(item => item.sources || []);
  
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  allArticles.forEach(article => {
    const sentiment = article.sentiment?.toLowerCase() || 'neutral';
    if (sentimentCounts.hasOwnProperty(sentiment)) {
      sentimentCounts[sentiment]++;
    } else {
      sentimentCounts.neutral++;
    }
  });

  const total = allArticles.length;
  if (total === 0) return null;

  const percentages = {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100)
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">
        Bias Distribution Based on today's news coverage across Pakistani sources.
      </h3>
      
      {/* Horizontal Bar Chart */}
      <div className="flex h-8 rounded-full overflow-hidden bg-[var(--bg-surface)]">
        {percentages.negative > 0 && (
          <div
            className="bg-[var(--accent-negative)] flex items-center justify-center"
            style={{ width: `${percentages.negative}%` }}
            title={`${percentages.negative}% Negative`}
          >
            <span className="text-xs font-medium text-white px-2">
              {percentages.negative}%
            </span>
          </div>
        )}
        {percentages.neutral > 0 && (
          <div
            className="bg-[var(--accent-neutral)] flex items-center justify-center"
            style={{ width: `${percentages.neutral}%` }}
            title={`${percentages.neutral}% Neutral`}
          >
            <span className="text-xs font-medium text-white px-2">
              {percentages.neutral}%
            </span>
          </div>
        )}
        {percentages.positive > 0 && (
          <div
            className="bg-[var(--accent-positive)] flex items-center justify-center"
            style={{ width: `${percentages.positive}%` }}
            title={`${percentages.positive}% Positive`}
          >
            <span className="text-xs font-medium text-white px-2">
              {percentages.positive}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BiasDistribution;

