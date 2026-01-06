import { useState, useEffect } from "react";
import { getSignedImageUrl } from "../utils/imageUtils";
import { formatTimeAgo } from "../utils/dataTransformers";
import ShareButton from "./ShareButton";
import SentimentBar from "./SentimentBar";
import SourceList from "./SourceList";

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
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-0">
        {/* Column 1: Image, Sentiment Bar, Headline, Summary */}
        <div className="sm:w-[60%] sm:flex-shrink-0 flex flex-col min-w-0">
          {/* Image */}
          <div className="w-full aspect-[4/3] sm:aspect-auto sm:h-48 sm:min-h-[200px] bg-[var(--bg-surface)] overflow-hidden flex items-center justify-center flex-shrink-0">
            {imageUrl && !imageError ? (
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

          {/* Sentiment Bar */}
          {sentiment && (
            <div className="px-4 sm:px-6 py-3 flex-shrink-0">
              <SentimentBar
                sentiment={sentiment}
                height="h-4"
                showPercentages={true}
              />
            </div>
          )}

          {/* Headline - Below Sentiment Bar */}
          <h2
            onClick={() => {
              if (onTitleClick) {
                onTitleClick(id);
              }
            }}
            className="px-4 sm:px-6 py-3 flex-shrink-0 text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight cursor-pointer hover:text-[var(--accent-positive)] transition-colors line-clamp-3"
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

        {/* Column 2: Tag and Time, Sources */}
        <div className="sm:w-[40%] sm:flex-shrink-0 flex flex-col p-3 relative">
          {/* Tag and Time with Share Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {category && (
                <span className="px-3 py-1 text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  {category}
                </span>
              )}
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
