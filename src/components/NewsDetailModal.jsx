import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
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

function NewsDetailModal({ expandedNewsId, newsData, onClose, onShare }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  // Find the expanded item - do this before hooks to use in useEffect
  const expandedItem = expandedNewsId
    ? newsData.find((item) => String(item.id) === expandedNewsId)
    : null;

  // Get signed URL for images that need authentication
  // This hook must be called before any conditional returns
  useEffect(() => {
    const image = expandedItem?.image;
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
      setImageError(false);
    }
  }, [expandedItem?.image]);

  // Early returns after all hooks
  if (!expandedNewsId) return null;
  if (!expandedItem) return null;

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
  } = expandedItem;

  // Filter sources based on selected sentiment
  const filteredSources = selectedSentiment
    ? sources.filter((source) => {
        const sourceSentiment = source.sentiment?.toLowerCase() || "neutral";
        return sourceSentiment === selectedSentiment;
      })
    : sources;

  const handleCardClick = (e) => {
    // Prevent closing when clicking inside the modal
    e.stopPropagation();
  };

  return (
    <Dialog
      open={!!expandedNewsId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-4xl w-[calc(100%-2rem)] sm:w-full h-[calc(100vh-2rem)] sm:h-[90vh] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] p-4 sm:p-6 lg:p-10 flex flex-col overflow-y-auto bg-[var(--bg-card)] border-[var(--border-subtle)] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="sr-only">{title || "News Details"}</DialogTitle>
        <article
          onClick={handleCardClick}
          className="bg-[var(--bg-card)] transition-all flex flex-col overflow-visible relative"
          id={`news-${id}`}
        >
          {/* Top Section: Image (left) + Content (right) */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
            {/* Square Image on the left */}
            {imageUrl && !imageError ? (
              <div className="w-full h-[200px] sm:h-[250px] lg:w-[200px] lg:h-[200px] bg-[var(--bg-surface)] relative overflow-hidden z-0 flex-shrink-0 rounded-lg">
                <img
                  src={imageUrl}
                  alt={title || "News image"}
                  width="300"
                  height="300"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImageError(true);
                  }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-[200px] sm:h-[250px] lg:w-[200px] lg:h-[200px] bg-[var(--bg-surface)] flex items-center justify-center relative flex-shrink-0 rounded-lg">
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

            {/* Content Area on the right */}
            <div className="flex flex-col flex-1 min-w-0 py-0 lg:py-3 px-0 lg:px-3 relative overflow-visible">
              {/* Topic Headline */}
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5 leading-snug line-clamp-2">
                {title}
              </h2>

              {/* Metadata Row */}
              <div className="flex items-center justify-between gap-2 mb-2 text-xs flex-wrap">
                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
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
                    {typeof timeAgo === "string"
                      ? timeAgo
                      : formatTimeAgo(timeAgo)}
                  </span>
                  {recentArticlesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-positive)]/10 text-[var(--accent-positive)]">
                      {recentArticlesCount} new
                    </span>
                  )}
                </div>
                {/* Share Button - Parallel to tag and time */}
                <ShareButton
                  newsItem={expandedItem}
                  onShare={onShare}
                  className=""
                />
              </div>

              {/* Sentiment Bar Section */}
              {sentiment &&
                (() => {
                  const {
                    positive = 0,
                    neutral = 0,
                    negative = 0,
                  } = sentiment || {};
                  const total =
                    (positive || 0) + (neutral || 0) + (negative || 0);
                  const percentages =
                    total > 0
                      ? {
                          positive: Math.round(((positive || 0) / total) * 100),
                          neutral: Math.round(((neutral || 0) / total) * 100),
                          negative: Math.round(((negative || 0) / total) * 100),
                        }
                      : { positive: 0, neutral: 0, negative: 0 };

                  return (
                    <TooltipProvider delayDuration={200}>
                      <div className="mb-2 relative overflow-visible z-[60]">
                        <div className="flex h-3 sm:h-[12px] overflow-hidden bg-[var(--bg-surface)] relative">
                          {/* Negative Segment */}
                          {percentages.negative > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                                  style={{ width: `${percentages.negative}%` }}
                                >
                                  <span className="text-[10px] font-medium text-white px-1">
                                    {percentages.negative}%
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden z-[9999]"
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
                                        Stories emphasizing risk, conflict,
                                        decline, or concern.
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
                                  <span className="text-[10px] font-medium text-white px-1">
                                    {percentages.neutral}%
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden z-[9999]"
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
                                        Informational or balanced coverage
                                        without strong emotional framing.
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
                                  <span className="text-[10px] font-medium text-white px-1">
                                    {percentages.positive}%
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl px-5 pb-5 pt-3 min-w-[280px] max-w-[320px] backdrop-blur-md overflow-hidden z-[9999]"
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

              {/* Summary - Below sentiment bar */}
              {summary && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 mb-4 leading-relaxed">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Section: Articles */}
          <div className="flex flex-col min-w-0 px-0 pb-2 sm:pb-3 mt-2 sm:mt-0">
            {/* Divider above articles */}
            <div className="border-t border-[var(--border-subtle)] mb-3 sm:mb-4"></div>

            {/* Articles Section */}
            <div className="flex flex-col">
              {filteredSources && filteredSources.length > 0 ? (
                <div className="flex flex-col">
                  <SourceList sources={filteredSources} showAll={true} />
                </div>
              ) : sources && sources.length > 0 ? (
                <div className="flex flex-col">
                  <div className="text-sm text-[var(--text-muted)] py-4 text-left">
                    No articles match the selected sentiment filter.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </DialogContent>
    </Dialog>
  );
}

export default NewsDetailModal;
