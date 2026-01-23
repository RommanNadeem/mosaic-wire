import { useState, useEffect } from "react";
import { getSignedImageUrl } from "../utils/imageUtils";
import { formatTimeAgo } from "../utils/dataTransformers";
import ShareButton from "./ShareButton";
import SourceList from "./SourceList";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { capitalizeFirst, getCategoryColor } from "../utils/categoryUtils";

function FeaturedNews({ newsItem, onTitleClick, onShare }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

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
  } = newsItem;

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

  return (
    <article
      id={`news-${id}`}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-visible h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-0 flex-1">
        {/* Column 1: Image, Tag and Time, Sentiment Bar, Headline, Summary */}
        <div className="sm:w-[70%] sm:flex-shrink-0 flex flex-col min-w-0">
          {/* Image */}
          <div className="w-full aspect-[4/3] sm:aspect-auto sm:h-64 sm:min-h-[280px] bg-[var(--bg-surface)] overflow-hidden flex items-center justify-center flex-shrink-0">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={title || "News image"}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
                width="800"
                height="600"
                onError={() => {
                  setImageError(true);
                }}
                loading="lazy"
              />
            ) : (
              <svg
                className="w-16 h-16 text-[var(--text-muted)]"
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
            )}
          </div>

          {/* Tag and Time with Share Button - Moved above sentiment bar */}
          <div className="px-4 sm:px-6 pt-4 pb-1 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {category &&
                (() => {
                  const categoryColor = getCategoryColor(category);
                  return (
                    <span
                      className="px-3 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: categoryColor.bg,
                        color: categoryColor.text,
                      }}
                    >
                      {capitalizeFirst(category)}
                    </span>
                  );
                })()}
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
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
            </div>
            {/* Share Button */}
            <ShareButton newsItem={newsItem} onShare={onShare} className="" />
          </div>

          {/* Sentiment Bar with Tooltip */}
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

              return (
                <div className="px-4 sm:px-6 py-2 flex-shrink-0 pt-0">
                  <TooltipProvider delayDuration={200}>
                    <div className="relative overflow-visible">
                      <div className="flex h-4 overflow-hidden bg-[var(--bg-surface)] relative">
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
                </div>
              );
            })()}

          {/* Headline - Below Sentiment Bar */}
          <h2
            onClick={() => {
              if (onTitleClick) {
                onTitleClick(id);
              }
            }}
            className="px-2 sm:px-6 py-0 flex-shrink-0 text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight cursor-pointer hover:text-[var(--accent-positive)] transition-colors line-clamp-3"
          >
            {title}
          </h2>

          {/* Summary - Moved to Column 1 - Clickable */}
          {summary && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onTitleClick) {
                  onTitleClick(id);
                }
              }}
              className="px-4 sm:px-6 py-3 flex-shrink-0 cursor-pointer"
            >
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal hover:text-[var(--text-primary)] transition-colors">
                {summary}
              </p>
            </div>
          )}
        </div>

        {/* Column 2: Sources */}
        <div className="sm:w-[30%] sm:flex-shrink-0 flex flex-col p-3 relative">
          {/* Sources List - Using SourceList component to show descriptions */}
          {sources && sources.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <SourceList
                sources={sources}
                onMoreSourcesClick={() => onTitleClick && onTitleClick(id)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default FeaturedNews;
