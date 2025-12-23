import { useState, useEffect } from "react";
import SignalBalance from "./SignalBalance";
import SourceList from "./SourceList";
import { useTheme } from "../contexts/ThemeContext";
import { formatTimeAgo } from "../utils/dataTransformers";
import { getSignedImageUrl } from "../utils/imageUtils";

function NewsCard({ newsItem }) {
  const { theme } = useTheme();
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
    quote,
    quoteAuthor,
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
            console.warn(
              "Image URL could not be processed (likely needs backend signing):",
              image
            );
            setImageError(true);
            setImageUrl(null); // Don't try to load unsigned URLs
          }
        })
        .catch((error) => {
          console.error("Error getting signed image URL:", error);
          setImageError(true);
          setImageUrl(null); // Don't try to load on error
        });
    } else {
      setImageUrl(null);
    }
  }, [image]);

  const cardBg = theme === "light" ? "bg-white" : "bg-ground-dark-secondary";
  const borderColor =
    theme === "light"
      ? "border-gray-200 hover:border-gray-300"
      : "border-ground-dark-tertiary hover:border-ground-medium-grey";
  const imageBg = theme === "light" ? "bg-gray-100" : "bg-ground-dark-tertiary";
  const textPrimary =
    theme === "light" ? "text-gray-900" : "text-ground-text-primary";
  const textSecondary =
    theme === "light" ? "text-gray-700" : "text-ground-text-secondary";
  const textTertiary =
    theme === "light" ? "text-gray-500" : "text-ground-text-tertiary";
  const categoryBg =
    theme === "light" ? "bg-gray-100" : "bg-ground-dark-tertiary";
  const dividerColor =
    theme === "light" ? "border-gray-200" : "border-ground-dark-tertiary";

  function getTimeAgo(isoTimestamp) {
    // Handle null, undefined, or invalid timestamps
    if (!isoTimestamp) {
      return "Unknown";
    }

    const now = new Date();
    const updatedAt = new Date(isoTimestamp);

    // Check if the date is valid
    if (isNaN(updatedAt.getTime())) {
      return "Unknown";
    }

    const diffMs = now - updatedAt;

    // Handle future dates (shouldn't happen, but just in case)
    if (diffMs < 0) {
      return "Just now";
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    const weeks = Math.floor(diffDays / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }

  return (
    <article
      className={`${cardBg} rounded-lg border ${borderColor} overflow-hidden transition-all flex flex-col h-full`}
    >
      {/* Image */}
      {imageUrl && !imageError && (
        <div className={`w-full h-48 ${imageBg} overflow-hidden flex-shrink-0`}>
          <img
            src={imageUrl}
            alt={title || "News image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              setImageError(true);
              e.target.style.display = "none";
              // Hide the container if image fails
              if (e.target.parentElement) {
                e.target.parentElement.style.display = "none";
              }
            }}
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
              {category && (
                <span
                  className={`px-2 py-1 text-xs font-medium ${categoryBg} ${textSecondary} rounded`}
                >
                  {category}
                </span>
              )}
              <span className={`text-xs ${textTertiary}`}>
                {/* {typeof timeAgo === "string" ? timeAgo : formatTimeAgo(timeAgo)} */}
                {getTimeAgo(updatedAt)}
              </span>
              {recentArticlesCount > 0 && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    theme === "light"
                      ? "bg-green-100 text-green-800"
                      : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {recentArticlesCount} new
                </span>
              )}
            </div>
            <h2
              className={`text-xl font-bold ${textPrimary} mb-2 leading-tight`}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <p className={`${textSecondary} mb-4 leading-relaxed`}>{summary}</p>
        )}

        {/* Signal Balance */}
        {sentiment && (
          <div className="mb-4">
            <SignalBalance
              sentiment={sentiment}
              onSentimentClick={setSelectedSentiment}
              selectedSentiment={selectedSentiment}
            />
            {selectedSentiment && (
              <div
                className={`mt-2 text-xs ${textTertiary} flex items-center justify-between`}
              >
                <span>
                  Filtered by:{" "}
                  <span className="font-medium capitalize">
                    {selectedSentiment}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedSentiment(null)}
                  className={`text-xs underline hover:no-underline ${textSecondary} ${
                    theme === "light"
                      ? "hover:text-gray-900"
                      : "hover:text-ground-text-primary"
                  }`}
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sources - flex-1 to push expandable to bottom */}
        {filteredSources && filteredSources.length > 0 ? (
          <div className="mb-4 flex-1 flex flex-col">
            <SourceList sources={filteredSources} />
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="mb-4 flex-1 flex flex-col">
            <div className={`text-sm ${textTertiary} py-4 text-center`}>
              No articles match the selected sentiment filter.
            </div>
          </div>
        ) : null}

        {/* Quote */}
        {quote && (
          <div className={`mt-4 pt-4 border-t ${dividerColor}`}>
            <blockquote className={`${textSecondary} italic mb-2`}>
              "{quote}"
            </blockquote>
            {quoteAuthor && (
              <cite className={`text-sm ${textTertiary}`}>— {quoteAuthor}</cite>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default NewsCard;
