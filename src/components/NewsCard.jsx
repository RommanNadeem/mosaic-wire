import { useState, useEffect } from "react";
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
      className={`bg-[var(--bg-card)] border overflow-hidden transition-all flex flex-col ${
        isExpanded ? "h-full" : "h-full"
      } hover:border-[var(--text-muted)] ${
        isHighlighted
          ? "border-[var(--accent-positive)] ring-2 ring-[var(--accent-positive)] ring-opacity-50 shadow-lg z-10 relative"
          : "border-[var(--border-subtle)]"
      } ${shouldBlur ? "blur-sm opacity-50 pointer-events-none" : ""}`}
      id={`news-${id}`}
    >
      {/* Image at the top */}
      {imageUrl && !imageError ? (
        <div className="w-full h-48 bg-[var(--bg-surface)] overflow-hidden relative">
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
            style={{ objectPosition: "center top" }}
            onError={() => {
              setImageError(true);
            }}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-[var(--bg-surface)] flex items-center justify-center relative">
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
          isExpanded ? "overflow-hidden" : ""
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
        {sentiment && (
          <div className="mb-3">
            <SentimentBar
              sentiment={sentiment}
              height="h-[12px]"
              showPercentages={true}
            />
          </div>
        )}

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
