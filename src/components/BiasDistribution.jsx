import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function BiasDistribution({ newsData }) {
  if (!newsData || newsData.length === 0) {
    return null;
  }

  // Calculate overall sentiment from all articles
  const allArticles = newsData.flatMap((item) => item.sources || []);

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
  if (total === 0) return null;

  const percentages = {
    positive: Math.round((sentimentCounts.positive / total) * 100),
    neutral: Math.round((sentimentCounts.neutral / total) * 100),
    negative: Math.round((sentimentCounts.negative / total) * 100),
  };

  // Create sentiment object for tooltip
  const sentiment = {
    positive: sentimentCounts.positive,
    neutral: sentimentCounts.neutral,
    negative: sentimentCounts.negative,
  };

  return (
    <div>
      <div className="mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          Pakistan's Mood Today
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Based on today's news coverage across Pakistani sources
        </p>
      </div>

      {/* Horizontal Bar Chart with Tooltip */}
      <TooltipProvider delayDuration={200}>
        <div className="relative overflow-visible">
          <div className="flex h-8 overflow-hidden bg-[var(--bg-surface)] relative">
            {/* Negative Segment */}
            {percentages.negative > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{ width: `${percentages.negative}%` }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.negative}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-negative)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-negative)",
                                boxShadow: "var(--accent-negative)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-negative)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Negative
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-negative)",
                            }}
                          >
                            {percentages.negative}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Negative:
                          </span>{" "}
                          Stories emphasizing risk, conflict, decline, or
                          concern.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Neutral Segment */}
            {percentages.neutral > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{ width: `${percentages.neutral}%` }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.neutral}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-neutral)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-neutral)",
                                boxShadow: "var(--accent-neutral)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-neutral)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Neutral
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-neutral)",
                            }}
                          >
                            {percentages.neutral}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Neutral:
                          </span>{" "}
                          Informational or balanced coverage without strong
                          emotional framing.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Positive Segment */}
            {percentages.positive > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{ width: `${percentages.positive}%` }}
                  >
                    <span className="text-xs font-medium text-white px-2">
                      {percentages.positive}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] overflow-hidden z-[9999]"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    opacity: 1,
                    borderTop: "4px solid var(--accent-positive)",
                    borderTopLeftRadius: "0.75rem",
                    borderTopRightRadius: "0.75rem",
                  }}
                >
                  <div className="relative">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: "var(--accent-positive)",
                                boxShadow: "var(--accent-positive)30 0 0 8px",
                              }}
                            ></div>
                            <div
                              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                              style={{
                                backgroundColor: "var(--accent-positive)",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            Positive
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: "var(--accent-positive)",
                            }}
                          >
                            {percentages.positive}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Positive:
                          </span>{" "}
                          Stories framed with optimism, progress, opportunity,
                          or growth.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* How To Read Mosaicbeat Heading - Hidden on mobile, visible on desktop */}
      <div className="mt-4 hidden lg:block">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          How To Read Mosaicbeat
        </h3>
      </div>
    </div>
  );
}

export default BiasDistribution;
