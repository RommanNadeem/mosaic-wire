import { useState, useEffect } from "react";
import SourceList from "./SourceList";
import ShareButton from "./ShareButton";
import { formatTimeAgo } from "../utils/dataTransformers";
import { getSignedImageUrl } from "../utils/imageUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { capitalizeFirst, getCategoryColor } from "@/utils/categoryUtils";

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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(null);

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

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    if (!isTouchDevice || !openTooltip) return;

    const handleClickOutside = (e) => {
      // Use a small delay to allow Radix UI's internal handlers to run first
      setTimeout(() => {
        const target = e.target;
        const isTooltipContent = target.closest('[role="tooltip"]');
        const isTooltipTrigger = target.closest('[data-radix-tooltip-trigger]');
        const isSentimentBar = target.closest('.sentiment-bar-container');
        
        // Only close if clicking outside the tooltip, trigger, and sentiment bar
        if (!isTooltipContent && !isTooltipTrigger && !isSentimentBar) {
          setOpenTooltip(null);
        }
      }, 10);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTouchDevice, openTooltip]);

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
          className={`w-full bg-[var(--bg-surface)] relative h-48 overflow-hidden ${
            isExpanded ? "z-0" : ""
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
          <img
            src={imageUrl}
            alt={title || "News image"}
            width="800"
            height="600"
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
          isExpanded ? "overflow-y-auto z-10" : "overflow-visible"
        }`}
      >
        {/* Topic Headline - Clickable */}
        <h2
          onClick={() => onTitleClick && onTitleClick(id)}
          className="text-lg font-bold text-[var(--text-primary)] mb-1.5 leading-snug line-clamp-2 cursor-pointer hover:text-[var(--accent-positive)] transition-colors"
        >
          {title}
        </h2>

        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {category &&
              (() => {
                const categoryColor = getCategoryColor(category);
                return (
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded"
                    style={{
                      backgroundColor: categoryColor.bg,
                      color: categoryColor.text,
                    }}
                  >
                    {capitalizeFirst(category)}
                  </span>
                );
              })()}
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
          {/* Share Button - Parallel to tag and time */}
          <ShareButton newsItem={newsItem} onShare={onShare} className="" />
        </div>

        {/* Sentiment Bar Section - Above Summary */}
        {sentiment &&
          (() => {
            const { positive = 0, neutral = 0, negative = 0 } = sentiment || {};
            const total = (positive || 0) + (neutral || 0) + (negative || 0);
            const percentages =
              total > 0
                ? {
                    positive: Math.round(((positive || 0) / total) * 100),
                    neutral: Math.round(((neutral || 0) / total) * 100),
                    negative: Math.round(((negative || 0) / total) * 100),
                  }
                : { positive: 0, neutral: 0, negative: 0 };

            return (
              <TooltipProvider delayDuration={isTouchDevice ? 0 : 200}>
                <div
                  className={`mb-3 relative overflow-visible ${
                    isExpanded ? "z-[60]" : ""
                  }`}
                >
                  <div className="flex h-[12px] overflow-hidden bg-[var(--bg-surface)] relative sentiment-bar-container">
                    {/* Negative Segment */}
                    {percentages.negative > 0 && (
                      <Tooltip
                        open={
                          isTouchDevice ? openTooltip === "negative" : undefined
                        }
                        onOpenChange={(open) => {
                          if (isTouchDevice) {
                            setOpenTooltip(open ? "negative" : null);
                          }
                        }}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                            style={{ width: `${percentages.negative}%` }}
                            onClick={(e) => {
                              if (isTouchDevice) {
                                e.stopPropagation();
                                setOpenTooltip(
                                  openTooltip === "negative" ? null : "negative"
                                );
                              }
                            }}
                          >
                            <span className="text-[10px] font-medium text-white px-1">
                              {percentages.negative}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden"
                          style={{
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
                                        backgroundColor:
                                          "var(--accent-negative)",
                                        boxShadow:
                                          "var(--accent-negative)30 0 0 8px",
                                      }}
                                    ></div>
                                    <div
                                      className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                                      style={{
                                        backgroundColor:
                                          "var(--accent-negative)",
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
                                    style={{ color: "var(--accent-negative)" }}
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
                                  Stories emphasizing risk, conflict, decline,
                                  or concern.
                                </p>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Neutral Segment */}
                    {percentages.neutral > 0 && (
                      <Tooltip
                        open={
                          isTouchDevice ? openTooltip === "neutral" : undefined
                        }
                        onOpenChange={(open) => {
                          if (isTouchDevice) {
                            setOpenTooltip(open ? "neutral" : null);
                          }
                        }}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                            style={{ width: `${percentages.neutral}%` }}
                            onClick={(e) => {
                              if (isTouchDevice) {
                                e.stopPropagation();
                                setOpenTooltip(
                                  openTooltip === "neutral" ? null : "neutral"
                                );
                              }
                            }}
                          >
                            <span className="text-[10px] font-medium text-white px-1">
                              {percentages.neutral}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden"
                          style={{
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
                                        backgroundColor:
                                          "var(--accent-neutral)",
                                        boxShadow:
                                          "var(--accent-neutral)30 0 0 8px",
                                      }}
                                    ></div>
                                    <div
                                      className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                                      style={{
                                        backgroundColor:
                                          "var(--accent-neutral)",
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
                                    style={{ color: "var(--accent-neutral)" }}
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
                                  Informational or balanced coverage without
                                  strong emotional framing.
                                </p>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Positive Segment */}
                    {percentages.positive > 0 && (
                      <Tooltip
                        open={
                          isTouchDevice ? openTooltip === "positive" : undefined
                        }
                        onOpenChange={(open) => {
                          if (isTouchDevice) {
                            setOpenTooltip(open ? "positive" : null);
                          }
                        }}
                      >
                        <TooltipTrigger asChild>
                          <div
                            className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-110"
                            style={{ width: `${percentages.positive}%` }}
                            onClick={(e) => {
                              if (isTouchDevice) {
                                e.stopPropagation();
                                setOpenTooltip(
                                  openTooltip === "positive" ? null : "positive"
                                );
                              }
                            }}
                          >
                            <span className="text-[10px] font-medium text-white px-1">
                              {percentages.positive}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden"
                          style={{
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
                                        backgroundColor:
                                          "var(--accent-positive)",
                                        boxShadow:
                                          "var(--accent-positive)30 0 0 8px",
                                      }}
                                    ></div>
                                    <div
                                      className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-20"
                                      style={{
                                        backgroundColor:
                                          "var(--accent-positive)",
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
                                    style={{ color: "var(--accent-positive)" }}
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
                                  Stories framed with optimism, progress,
                                  opportunity, or growth.
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
