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
    <div className="space-y-0 flex-1 flex flex-col">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden w-full py-1 flex items-center justify-between transition-colors"
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
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } lg:block space-y-4 flex-1`}
      >
        {/* What is Mosaic? */}
        <div className="pt-3 pb-4 sm:pb-6">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">
            What is Mosaic
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            MosaicBeat analyzes how news is being told, not just what happened.
            We compare coverage across sources to surface the signal behind the
            noise.
          </p>

          {/* What We Analyze Today Heading */}
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">
            What We Analyze Today
          </h4>

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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
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
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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

          {/* How the Mood Is Calculated */}
          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">
              How the Mood Is Calculated
            </h3>
            <ol className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed list-decimal list-inside">
              <li>Similar headlines are grouped into topics</li>
              <li>Tone and language are analyzed across sources</li>
              <li>The dominant framing is aggregated into a daily mood</li>
            </ol>
            <p className="text-sm text-[var(--text-muted)] italic mt-3">
              This is probabilistic analysis, not opinion.
            </p>
          </div>

          {/* Why This Exists */}
          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3">
              Why This Exists
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              News shapes perception. MosaicBeat exists to make that process
              visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToRead;
