function HowToRead({ newsData, isExpanded, onToggle }) {
  // Calculate metrics from newsData
  const allArticles = newsData.flatMap((item) => item.sources || []);
  const storiesAnalyzed = allArticles.length;
  const topicsClustered = newsData.length;

  // Get unique sources
  const uniqueSources = new Set();
  allArticles.forEach((article) => {
    if (article.source) {
      uniqueSources.add(article.source);
    }
  });
  const sourcesCompared = uniqueSources.size;

  // Calculate dominant mood
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  allArticles.forEach((article) => {
    const sentiment = article.sentiment?.toLowerCase() || "neutral";
    if (sentimentCounts.hasOwnProperty(sentiment)) {
      sentimentCounts[sentiment]++;
    } else {
      sentimentCounts.neutral++;
    }
  });

  const total = allArticles.length;
  const percentages = {
    positive:
      total > 0 ? Math.round((sentimentCounts.positive / total) * 100) : 0,
    neutral:
      total > 0 ? Math.round((sentimentCounts.neutral / total) * 100) : 0,
    negative:
      total > 0 ? Math.round((sentimentCounts.negative / total) * 100) : 0,
  };

  // Determine dominant mood
  let dominantMood = "Neutral";
  if (
    percentages.positive > percentages.neutral &&
    percentages.positive > percentages.negative
  ) {
    dominantMood = "Positive";
  } else if (
    percentages.negative > percentages.neutral &&
    percentages.negative > percentages.positive
  ) {
    dominantMood = "Negative";
  }

  return (
    <div className="space-y-4">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden w-full py-4 flex items-center justify-between transition-colors"
      >
        <span className="text-base font-bold text-[var(--text-primary)]">
          How to Read MosaicBeat
        </span>
        <svg
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - Hidden on mobile unless expanded */}
      <div className={`${isExpanded ? "block" : "hidden"} lg:block space-y-4`}>
        {/* What is Mosaic? */}
        <div className="py-4 sm:py-6">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">
            What is Mosaic?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            MosaicBeat analyzes how news is being told, not just what happened.
            We compare coverage across sources to surface the signal behind the
            noise.
          </p>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                Stories Analyzed:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {storiesAnalyzed}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                Topics Clustered:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {topicsClustered}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                Sources Compared:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {sourcesCompared}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                Dominant Tone:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {dominantMood}
                </span>
              </span>
            </div>
          </div>

          {/* Paragraph below stats */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-4">
            MosaicBeat analyzes how news is being told, not just what happened.
            We compare coverage across sources to surface the signal behind the
            noise.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HowToRead;
