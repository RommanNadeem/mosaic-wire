import { useState } from 'react';

function ShareButton({ 
  newsItem, 
  onShare, 
  className = "",
  iconSize = "w-4 h-4"
}) {
  const [shareCopied, setShareCopied] = useState(false);

  if (!newsItem) return null;

  const {
    id,
    title,
    category,
    summary,
  } = newsItem;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}${window.location.pathname}#news-${id}`;
    const shareTitle = title || 'Check out this news on MosaicBeat';
    
    // Build share text with category and summary
    let shareText = shareTitle;
    if (category) {
      shareText += `\n\nCategory: ${category}`;
    }
    if (summary) {
      // Include first few lines of summary (approximately 3-4 lines, ~250 characters)
      const summaryPreview = summary.length > 250 
        ? summary.substring(0, 250) + '...' 
        : summary;
      shareText += `\n\n${summaryPreview}`;
    }
    
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

  return (
    <button
      onClick={handleShare}
      className={`p-1.5 rounded-full hover:bg-[var(--bg-surface)] transition-colors ${className}`}
      title={shareCopied ? "Link copied!" : "Share this news"}
      aria-label="Share this news"
    >
      {shareCopied ? (
        <svg className={`${iconSize} text-[var(--accent-positive)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={`${iconSize} text-[var(--text-muted)] hover:text-[var(--text-primary)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  );
}

export default ShareButton;

