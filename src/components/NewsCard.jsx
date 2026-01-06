import { useState, useEffect, useRef } from "react";
import SentimentBar from "./SentimentBar";
import SourceList from "./SourceList";
import ShareButton from "./ShareButton";
import { formatTimeAgo } from "../utils/dataTransformers";
import { getSignedImageUrl } from "../utils/imageUtils";

function NewsCard({
  newsItem,
  isHighlighted,
  highlightedNewsId,
  onShare,
  onTitleClick,
  isExpanded,
  onClose,
  onCloseHighlight,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);
  const sentimentBarRef = useRef(null);

  if (!newsItem) return null;

  const {
    id,
    title,
    category,
    timeAgo,
    summary,
    sentiment,
    image,
    sources,
    recentArticlesCount,
    updatedAt,
  } = newsItem;

  // Filter sources based on selected sentiment
  const filteredSources = selectedSentiment
    ? sources.filter((source) => {
        const sourceSentiment = source.sentiment?.toLowerCase() || "neutral";
        return sourceSentiment === selectedSentiment;
      })
    : sources;

  // Get signed URL for images that need authentication
  useEffect(() => {
    if (image) {
      getSignedImageUrl(image)
        .then((url) => {
          if (url) {
            setImageUrl(url);
            setImageError(false);
          } else {
            setImageError(true);
            setImageUrl(null);
          }
        })
        .catch((error) => {
          console.error("Error getting signed image URL:", error);
          setImageError(true);
          setImageUrl(null);
        });
    } else {
      setImageUrl(null);
    }
  }, [image]);

  // Truncate summary to 3 lines (approximately 225 characters) - only if not expanded
  const truncatedSummary = summary
    ? summary.length > 225 && !isExpanded
      ? summary.substring(0, 225) + "..."
      : summary
    : null;

  const displaySummary = isExpanded ? summary : truncatedSummary;

  // Check if there's a highlighted news and this is not it (but don't blur if expanded)
  const shouldBlur =
    highlightedNewsId && highlightedNewsId !== String(id) && !isExpanded;

  const handleCardClick = (e) => {
    // Prevent closing when clicking inside the highlighted card
    if (isHighlighted) {
      e.stopPropagation();
    }
    // Prevent closing when clicking inside expanded modal
    if (isExpanded) {
      e.stopPropagation();
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`bg-[var(--bg-card)] border transition-all flex flex-col ${
        isExpanded ? "h-full overflow-y-auto" : "h-full overflow-visible"
      } hover:border-[var(--text-muted)] ${
        isHighlighted
          ? "border-[var(--accent-positive)] ring-2 ring-[var(--accent-positive)] ring-opacity-50 shadow-lg z-10 relative"
          : "border-[var(--border-subtle)]"
      } ${shouldBlur ? "blur-sm opacity-50 pointer-events-none" : ""}`}
      id={`news-${id}`}
    >
      {/* Image at the top */}
      {imageUrl && !imageError ? (
        <div
          className={`w-full bg-[var(--bg-surface)] relative h-48 overflow-hidden`}
        >
          {/* Mobile Close Button - Shown when expanded or highlighted on mobile */}
          {(isExpanded || isHighlighted) && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isExpanded && onClose) {
                  onClose();
                } else if (isHighlighted && onCloseHighlight) {
                  onCloseHighlight();
                }
              }}
              className="lg:hidden absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <img
            src={imageUrl}
            alt={title || "News image"}
            className="w-full h-full object-cover"
            style={
              isExpanded
                ? { maxHeight: "none" }
                : { objectPosition: "center top" }
            }
            onError={() => {
              setImageError(true);
            }}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={`w-full bg-[var(--bg-surface)] flex items-center justify-center relative ${
            isExpanded ? "h-auto min-h-[200px]" : "h-48"
          }`}
        >
          {/* Mobile Close Button - Shown when expanded or highlighted on mobile */}
          {(isExpanded || isHighlighted) && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isExpanded && onClose) {
                  onClose();
                } else if (isHighlighted && onCloseHighlight) {
                  onCloseHighlight();
                }
              }}
              className="lg:hidden absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className="w-8 h-8 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Content Area - Reduced spacing */}
      <div
        className={`flex flex-col flex-1 min-w-0 py-3 px-3 relative ${
          isExpanded ? "overflow-y-auto" : "overflow-visible"
        }`}
      >
        {/* Share Button */}
        <ShareButton
          newsItem={newsItem}
          onShare={onShare}
          className="absolute top-3 right-3 z-10"
        />

        {/* Topic Headline - Clickable */}
        <h2
          onClick={() => onTitleClick && onTitleClick(id)}
          className="text-lg font-bold text-[var(--text-primary)] mb-1.5 leading-snug line-clamp-2 pr-8 cursor-pointer hover:text-[var(--accent-positive)] transition-colors"
        >
          {title}
        </h2>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
          {category && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)]">
              {category}
            </span>
          )}
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {typeof timeAgo === "string" ? timeAgo : formatTimeAgo(timeAgo)}
          </span>
          {recentArticlesCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-positive)]/10 text-[var(--accent-positive)]">
              {recentArticlesCount} new
            </span>
          )}
        </div>

        {/* Sentiment Bar Section - Above Summary */}
        {sentiment &&
          (() => {
            const { positive, neutral, negative } = sentiment;
            const total = positive + neutral + negative;
            const percentages =
              total > 0
                ? {
                    positive: Math.round((positive / total) * 100),
                    neutral: Math.round((neutral / total) * 100),
                    negative: Math.round((negative / total) * 100),
                  }
                : { positive: 0, neutral: 0, negative: 0 };

            const getTooltipContent = (segment) => {
              if (!segment) return null;
              const segmentData = {
                negative: {
                  label: "Negative",
                  percentage: percentages.negative,
                  color: "var(--accent-negative)",
                  count: negative,
                  description:
                    "Stories emphasizing risk, conflict, decline, or concern.",
                },
                neutral: {
                  label: "Neutral",
                  percentage: percentages.neutral,
                  color: "var(--accent-neutral)",
                  count: neutral,
                  description:
                    "Informational or balanced coverage without strong emotional framing.",
                },
                positive: {
                  label: "Positive",
                  percentage: percentages.positive,
                  color: "var(--accent-positive)",
                  count: positive,
                  description:
                    "Stories framed with optimism, progress, opportunity, or growth.",
                },
              };
              return segmentData[segment];
            };

            const tooltipData = getTooltipContent(hoveredSegment);

            // Calculate and adjust tooltip position to stay within viewport
            useEffect(() => {
              if (
                !hoveredSegment ||
                !tooltipRef.current ||
                !sentimentBarRef.current ||
                !sentiment
              ) {
                setTooltipStyle({});
                return;
              }

              const { positive, neutral, negative } = sentiment;
              const total = positive + neutral + negative;
              const percentages =
                total > 0
                  ? {
                      positive: Math.round((positive / total) * 100),
                      neutral: Math.round((neutral / total) * 100),
                      negative: Math.round((negative / total) * 100),
                    }
                  : { positive: 0, neutral: 0, negative: 0 };

              const updatePosition = () => {
                const container = sentimentBarRef.current;
                const tooltip = tooltipRef.current;
                if (!container || !tooltip) return;

                const containerRect = container.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const padding = 16; // Minimum distance from viewport edges

                // Calculate initial position based on segment
                let leftPercent = 0;
                if (hoveredSegment === "negative") {
                  leftPercent = percentages.negative / 2;
                } else if (hoveredSegment === "neutral") {
                  leftPercent = percentages.negative + percentages.neutral / 2;
                } else if (hoveredSegment === "positive") {
                  leftPercent =
                    percentages.negative +
                    percentages.neutral +
                    percentages.positive / 2;
                }

                // Convert percentage to pixel position
                const containerWidth = containerRect.width;
                const tooltipWidth = tooltipRect.width || 320; // Approximate width
                const leftPosition = (containerWidth * leftPercent) / 100;
                const tooltipLeft =
                  containerRect.left + leftPosition - tooltipWidth / 2;

                // Adjust if tooltip would overflow left
                let adjustedLeft = leftPercent;
                if (tooltipLeft < padding) {
                  const overflow = padding - tooltipLeft;
                  adjustedLeft =
                    leftPercent + (overflow / containerWidth) * 100;
                }

                // Adjust if tooltip would overflow right
                const tooltipRight =
                  containerRect.left +
                  (containerWidth * adjustedLeft) / 100 +
                  tooltipWidth / 2;
                if (tooltipRight > viewportWidth - padding) {
                  const overflow = tooltipRight - (viewportWidth - padding);
                  adjustedLeft =
                    adjustedLeft - (overflow / containerWidth) * 100;
                }

                // Check if there's enough space above, otherwise show below
                const spaceAbove = containerRect.top;
                const spaceBelow = viewportHeight - containerRect.bottom;
                const tooltipHeight = tooltipRect.height || 200; // Approximate height
                const showAbove =
                  spaceAbove > tooltipHeight + padding ||
                  spaceAbove > spaceBelow;

                // Calculate arrow position to point to segment center
                // Arrow should be positioned relative to tooltip to point at segment center
                const tooltipCenterX =
                  containerRect.left + (containerWidth * adjustedLeft) / 100;
                const segmentCenterX =
                  containerRect.left + (containerWidth * leftPercent) / 100;
                const arrowOffset = segmentCenterX - tooltipCenterX;
                const arrowPositionPercent = (arrowOffset / tooltipWidth) * 100;

                setTooltipStyle({
                  left: `${adjustedLeft}%`,
                  transform: "translateX(-50%)",
                  bottom: showAbove ? "100%" : "auto",
                  top: showAbove ? "auto" : "100%",
                  marginBottom: showAbove ? "0.5rem" : "0",
                  marginTop: showAbove ? "0" : "0.5rem",
                  arrowOffset: `${arrowPositionPercent}%`,
                });
              };

              // Small delay to ensure tooltip is rendered
              setTimeout(updatePosition, 10);
              window.addEventListener("resize", updatePosition);
              window.addEventListener("scroll", updatePosition, true);

              return () => {
                window.removeEventListener("resize", updatePosition);
                window.removeEventListener("scroll", updatePosition, true);
              };
            }, [hoveredSegment, sentiment]);

            return (
              <div
                ref={sentimentBarRef}
                className="mb-3 relative overflow-visible"
              >
                {/* Custom Sentiment Bar with Hover Areas */}
                <div className="flex h-[12px] overflow-hidden bg-[var(--bg-surface)] relative">
                  {/* Negative Segment */}
                  {percentages.negative > 0 && (
                    <div
                      className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.negative}%` }}
                      onMouseEnter={() => setHoveredSegment("negative")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <span className="text-[10px] font-medium text-white px-1">
                        {percentages.negative}%
                      </span>
                    </div>
                  )}

                  {/* Neutral Segment */}
                  {percentages.neutral > 0 && (
                    <div
                      className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.neutral}%` }}
                      onMouseEnter={() => setHoveredSegment("neutral")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <span className="text-[10px] font-medium text-white px-1">
                        {percentages.neutral}%
                      </span>
                    </div>
                  )}

                  {/* Positive Segment */}
                  {percentages.positive > 0 && (
                    <div
                      className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.positive}%` }}
                      onMouseEnter={() => setHoveredSegment("positive")}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <span className="text-[10px] font-medium text-white px-1">
                        {percentages.positive}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Design Tooltip - Shows only when hovering */}
                {tooltipData && (
                  <div
                    ref={tooltipRef}
                    className="absolute opacity-0 invisible transition-all duration-300 ease-out z-[100] pointer-events-none"
                    style={{
                      ...tooltipStyle,
                      opacity: hoveredSegment ? 1 : 0,
                      visibility: hoveredSegment ? "visible" : "hidden",
                      transform: hoveredSegment
                        ? tooltipStyle.transform ||
                          "translateX(-50%) translateY(0)"
                        : "translateX(-50%) translateY(8px)",
                    }}
                  >
                    <div className="relative">
                      {/* Main Tooltip Container */}
                      <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-5 min-w-[280px] max-w-[320px] backdrop-blur-md">
                        {/* Decorative top accent - matches hovered segment */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                          style={{ backgroundColor: tooltipData.color }}
                        ></div>

                        {/* Tooltip Header */}
                        <div className="flex items-center gap-2 mb-4 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: tooltipData.color }}
                          ></div>
                          <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                            {tooltipData.label} Sentiment
                          </span>
                        </div>

                        {/* Tooltip Content */}
                        <div className="space-y-3">
                          {/* Percentage Display */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div
                                  className="w-3 h-3 rounded-full shadow-lg"
                                  style={{
                                    backgroundColor: tooltipData.color,
                                    boxShadow: `${tooltipData.color}30 0 0 8px`,
                                  }}
                                ></div>
                                <div
                                  className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                                  style={{ backgroundColor: tooltipData.color }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-[var(--text-secondary)]">
                                {tooltipData.label}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span
                                className="text-2xl font-bold"
                                style={{ color: tooltipData.color }}
                              >
                                {tooltipData.percentage}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                %
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="pt-2 border-t border-[var(--border-subtle)]">
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {tooltipData.label}:
                              </span>{" "}
                              {tooltipData.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Custom Arrow - points to segment center */}
                      <div
                        className={`absolute -mt-px`}
                        style={{
                          left: tooltipStyle.arrowOffset
                            ? `calc(50% + ${tooltipStyle.arrowOffset})`
                            : "50%",
                          transform: "translateX(-50%)",
                          ...(tooltipStyle.bottom !== undefined
                            ? { top: "100%" }
                            : { bottom: "100%" }),
                        }}
                      >
                        <svg
                          width="20"
                          height="10"
                          viewBox="0 0 20 10"
                          fill="none"
                          className="drop-shadow-lg"
                          style={{
                            transform:
                              tooltipStyle.bottom !== undefined
                                ? "rotate(0deg)"
                                : "rotate(180deg)",
                          }}
                        >
                          <path
                            d="M10 10L0 0L20 0L10 10Z"
                            fill="var(--bg-card)"
                            stroke="var(--border-subtle)"
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* Summary - Full if expanded, truncated otherwise - Clickable */}
        {displaySummary && (
          <p
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onTitleClick) {
                onTitleClick(id);
              }
            }}
            className={`text-sm text-[var(--text-secondary)] mb-2 leading-relaxed ${
              isExpanded ? "" : "line-clamp-3"
            } cursor-pointer hover:text-[var(--text-primary)] transition-colors`}
          >
            {displaySummary}
          </p>
        )}

        {/* Source List */}
        {filteredSources && filteredSources.length > 0 ? (
          <div
            className={`flex-1 flex flex-col ${
              isExpanded ? "min-h-0 overflow-y-auto" : "min-h-0"
            }`}
          >
            <SourceList
              sources={filteredSources}
              onMoreSourcesClick={() => onTitleClick && onTitleClick(id)}
              showAll={isExpanded}
            />
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="text-sm text-[var(--text-muted)] py-4 text-left">
              No articles match the selected sentiment filter.
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default NewsCard;
