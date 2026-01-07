import { useState, useRef } from "react";
import SentimentTooltip from "./SentimentTooltip";

function BiasDistribution({ newsData }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);
  const sentimentBarRef = useRef(null);

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
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          Bias Distribution
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Based on today's news coverage across Pakistani sources
        </p>
      </div>

      {/* Horizontal Bar Chart with Tooltip */}
      <div ref={sentimentBarRef} className="relative overflow-visible">
        <div className="flex h-8 overflow-hidden bg-[var(--bg-surface)] relative">
          {percentages.negative > 0 && (
            <div
              className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
              style={{ width: `${percentages.negative}%` }}
              onMouseEnter={() => setHoveredSegment("negative")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span className="text-xs font-medium text-white px-2">
                {percentages.negative}%
              </span>
            </div>
          )}
          {percentages.neutral > 0 && (
            <div
              className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
              style={{ width: `${percentages.neutral}%` }}
              onMouseEnter={() => setHoveredSegment("neutral")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span className="text-xs font-medium text-white px-2">
                {percentages.neutral}%
              </span>
            </div>
          )}
          {percentages.positive > 0 && (
            <div
              className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
              style={{ width: `${percentages.positive}%` }}
              onMouseEnter={() => setHoveredSegment("positive")}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span className="text-xs font-medium text-white px-2">
                {percentages.positive}%
              </span>
            </div>
          )}
        </div>

        {/* Sentiment Tooltip */}
        <SentimentTooltip
          hoveredSegment={hoveredSegment}
          sentiment={sentiment}
          tooltipRef={tooltipRef}
          sentimentBarRef={sentimentBarRef}
          tooltipStyle={tooltipStyle}
          setTooltipStyle={setTooltipStyle}
        />
      </div>
    </div>
  );
}

export default BiasDistribution;
