import { useState, useEffect } from "react";
import Moodline from "./Moodline";
import SourceList from "./SourceList";
import { formatTimeAgo } from "../utils/dataTransformers";
import { getSignedImageUrl } from "../utils/imageUtils";

function NewsCard({ newsItem, isHighlighted, highlightedNewsId, onShare, onTitleClick, isExpanded, onClose, onCloseHighlight }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

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

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}${window.location.pathname}#news-${id}`;
    const shareTitle = title || 'Check out this news on MosaicBeat';
    const shareText = summary ? `${title}\n\n${summary.substring(0, 200)}...` : title;
    
    // Check if Web Share API is available (typically on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        
        if (onShare) {
          onShare(shareUrl);
        }
        return; // Successfully shared via native share
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    
    // Fallback to clipboard copy (desktop or if share API not available)
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      
      if (onShare) {
        onShare(shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: select text
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Check if there's a highlighted news and this is not it (but don't blur if expanded)
  const shouldBlur = highlightedNewsId && highlightedNewsId !== String(id) && !isExpanded;
  
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
      className={`bg-[var(--bg-card)] rounded-lg border overflow-hidden transition-all flex flex-row h-full hover:border-[var(--text-muted)] ${
        isHighlighted 
          ? 'border-[var(--accent-positive)] ring-2 ring-[var(--accent-positive)] ring-opacity-50 shadow-lg z-10 relative' 
          : 'border-[var(--border-subtle)]'
      } ${shouldBlur ? 'blur-sm opacity-50 pointer-events-none' : ''}`}
      id={`news-${id}`}
    >
      {/* Rounded Square Thumbnail */}
      {imageUrl && !imageError ? (
        <div className="w-28 h-28 bg-[var(--bg-surface)] overflow-hidden flex-shrink-0 self-start m-3 rounded relative">
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
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
        <div className="w-28 h-28 bg-[var(--bg-surface)] flex-shrink-0 self-start m-3 rounded flex items-center justify-center relative">
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
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Content Area - Reduced spacing */}
      <div className="flex flex-col flex-1 min-w-0 py-3 pr-3 relative">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[var(--bg-surface)] transition-colors z-10"
          title={shareCopied ? "Link copied!" : "Share this news"}
          aria-label="Share this news"
        >
          {shareCopied ? (
            <svg className="w-4 h-4 text-[var(--accent-positive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
        </button>
        
        {/* Topic Headline - Clickable */}
        <h2 
          onClick={() => onTitleClick && onTitleClick(id)}
          className="text-lg font-bold text-[var(--text-primary)] mb-1.5 leading-snug line-clamp-2 pr-8 cursor-pointer hover:text-[var(--accent-positive)] transition-colors"
        >
          {title}
        </h2>

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
            className={`text-sm text-[var(--text-secondary)] mb-2 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'} cursor-pointer hover:text-[var(--text-primary)] transition-colors`}
          >
            {displaySummary}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
          {category && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-full">
              {category}
            </span>
          )}
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {typeof timeAgo === "string" ? timeAgo : formatTimeAgo(timeAgo)}
          </span>
          {recentArticlesCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-positive)]/10 text-[var(--accent-positive)] rounded-full">
              {recentArticlesCount} new
            </span>
          )}
        </div>

        {/* THE MOODLINE Section - aligned with image left edge */}
        {sentiment && (
          <div className="mb-2 -ml-[124px] pl-3">
            <Moodline
              sentiment={sentiment}
              onSentimentClick={setSelectedSentiment}
              selectedSentiment={selectedSentiment}
            />
            {selectedSentiment && (
              <div className="mt-1.5 text-xs text-[var(--text-muted)] flex items-center justify-between">
                <span>
                  Filtered by:{" "}
                  <span className="font-medium capitalize">
                    {selectedSentiment}
                  </span>
                </span>
                <button
                  onClick={() => setSelectedSentiment(null)}
                  className="text-xs underline hover:no-underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Clear filter
                </button>
              </div>
            )}
            {/* Divider below Moodline */}
            <div className="mt-2 border-t border-[var(--border-subtle)]"></div>
          </div>
        )}

        {/* Source List - Flex-1 to push to bottom, aligned with image left edge */}
        {filteredSources && filteredSources.length > 0 ? (
          <div className="flex-1 flex flex-col min-h-0 -ml-[124px] pl-3">
            <SourceList sources={filteredSources} />
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="flex-1 flex flex-col -ml-[124px] pl-3">
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
