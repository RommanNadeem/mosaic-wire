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
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
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
  const [brokenFavicons, setBrokenFavicons] = useState(new Set());

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
    // Don't open modal if already expanded
    if (isExpanded) {
      e.stopPropagation();
      return;
    }

    // Don't open modal if clicking on interactive elements (buttons, links, etc.)
    const target = e.target;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="button"]') ||
      target.closest('[data-radix-tooltip-trigger]')
    ) {
      return;
    }

    // Open modal when clicking anywhere on the card
    if (onTitleClick) {
      onTitleClick(id);
    }

    // Prevent closing when clicking inside the highlighted card
    if (isHighlighted) {
      e.stopPropagation();
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`bg-[var(--bg-card)] border transition-all flex flex-row gap-[104px] cursor-pointer ${isExpanded ? "h-full overflow-y-auto" : "h-full overflow-visible"
        } hover:border-[var(--text-muted)] ${isHighlighted
          ? "border-[var(--accent-positive)] ring-2 ring-[var(--accent-positive)] ring-opacity-50 shadow-lg z-10 relative"
          : "border-[var(--border-subtle)]"
        } ${shouldBlur ? "blur-sm opacity-50 pointer-events-none" : ""}`}
      id={`news-${id}`}
    >
      {/* Content Area - Left side */}
      <div
        className={`flex flex-col flex-1 min-w-0 py-3 px-3 relative ${isExpanded ? "overflow-y-auto z-10" : "overflow-visible"
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
            className="lg:hidden absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-100 transition-colors"
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
        {/* Topic Headline - Clickable */}
        <h2
          onClick={() => onTitleClick && onTitleClick(id)}
          className="text-lg font-bold text-[var(--text-primary)] mb-2 leading-snug line-clamp-2 cursor-pointer hover:text-[var(--accent-positive)] transition-colors"
        >
          {title}
        </h2>

        {/* Category Tag and Time */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Category Tag */}
          {category &&
            (() => {
              const categoryColor = getCategoryColor(category);
              return (
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: categoryColor.bg || "var(--bg-surface)",
                    color: categoryColor.text || "var(--text-muted)",
                  }}
                >
                  {capitalizeFirst(category)}
                </span>
              );
            })()}
          {/* Time Ago */}
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
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
        </div>

        {/* Sentiment Bar Section */}
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

            // Determine dominant sentiment
            const dominantSentiment =
              percentages.negative > percentages.positive &&
                percentages.negative > percentages.neutral
                ? "negative"
                : percentages.positive > percentages.neutral
                  ? "positive"
                  : "neutral";
            const dominantPercentage = percentages[dominantSentiment];

            return (
              <TooltipProvider delayDuration={200}>
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 flex h-[12px] overflow-hidden bg-[var(--bg-surface)] relative rounded">
                      {/* Negative Segment */}
                      {percentages.negative > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="bg-[var(--accent-negative)] cursor-pointer transition-all duration-200 hover:brightness-110"
                              style={{ width: `${percentages.negative}%` }}
                            />
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="bg-[var(--accent-neutral)] cursor-pointer transition-all duration-200 hover:brightness-110"
                              style={{ width: `${percentages.neutral}%` }}
                            />
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="bg-[var(--accent-positive)] cursor-pointer transition-all duration-200 hover:brightness-110"
                              style={{ width: `${percentages.positive}%` }}
                            />
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
                    {/* Sentiment Percentage Text */}
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {dominantPercentage}% {dominantSentiment}
                    </span>
                  </div>
                </div>
              </TooltipProvider>
            );
          })()}

        {/* Source Count with Favicon Avatars */}
        {sources && sources.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Overlapping Favicon Avatars */}
            <div className="flex items-center" style={{ marginLeft: "-4px" }}>
              {(() => {
                // Get sources to display: prefer unique sources by name, but show at least 3 if available
                const sourcesToShow = [];
                const seenSourceNames = new Set();
                const maxAvatars = Math.min(3, sources.length);

                // First pass: get unique sources by name
                for (const source of sources) {
                  if (sourcesToShow.length >= maxAvatars) break;
                  const sourceName = source.source || "Unknown";
                  if (!seenSourceNames.has(sourceName)) {
                    seenSourceNames.add(sourceName);
                    sourcesToShow.push(source);
                  }
                }

                // Second pass: if we don't have 3 yet, fill with remaining sources (even if same name)
                if (sourcesToShow.length < maxAvatars) {
                  for (const source of sources) {
                    if (sourcesToShow.length >= maxAvatars) break;
                    if (!sourcesToShow.some(s => s.id === source.id)) {
                      sourcesToShow.push(source);
                    }
                  }
                }

                return sourcesToShow.map((source, index) => {
                  const hasFavicon =
                    source.favicon &&
                    source.favicon.trim() !== "" &&
                    !brokenFavicons.has(source.id);

                  return (
                    <Avatar
                      key={source.id}
                      className="border-2 border-[var(--bg-card)]"
                      style={{
                        width: "24px",
                        height: "24px",
                        marginLeft: index > 0 ? "-4px" : "0",
                        zIndex: 3 - index,
                      }}
                    >
                      {hasFavicon ? (
                        <AvatarImage
                          src={source.favicon}
                          alt={`${source.source} favicon`}
                          onError={() => {
                            setBrokenFavicons((prev) =>
                              new Set(prev).add(source.id)
                            );
                          }}
                        />
                      ) : null}
                      <AvatarFallback className="bg-[var(--bg-surface)]">
                        <svg
                          className="w-3 h-3 text-[var(--text-muted)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                  );
                });
              })()}
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {sources.length} source{sources.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Expanded Content - Only show when expanded */}
        {isExpanded && (
          <>
            {/* Metadata Row - Only in expanded view */}
            <div className="flex items-center justify-between gap-2 mt-4 mb-2 text-xs flex-wrap border-t border-[var(--border-subtle)] pt-3">
              <div className="flex items-center gap-2 flex-wrap">
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
              <ShareButton newsItem={newsItem} onShare={onShare} className="" />
            </div>

            {/* Summary - Full if expanded */}
            {displaySummary && (
              <p
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onTitleClick) {
                    onTitleClick(id);
                  }
                }}
                className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed cursor-pointer hover:text-[var(--text-primary)] transition-colors"
              >
                {displaySummary}
              </p>
            )}

            {/* Source List - Only in expanded view */}
            {filteredSources && filteredSources.length > 0 ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
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
          </>
        )}
      </div>

      {/* Image on the right side */}
      <div className="flex-shrink-0 py-3 pr-3">
        {imageUrl && !imageError ? (
          <div
            className="bg-[var(--bg-surface)] relative overflow-hidden rounded"
            style={{ width: "98.6px", height: "98.6px" }}
          >
            <img
              src={imageUrl}
              alt={title || "News image"}
              className="w-full h-full object-cover"
              onError={() => {
                setImageError(true);
              }}
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className="bg-[var(--bg-surface)] flex items-center justify-center rounded"
            style={{ width: "98.6px", height: "98.6px" }}
          >
            <svg
              className="w-6 h-6 text-[var(--text-muted)]"
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
      </div>
    </article>
  );
}

export default NewsCard;
