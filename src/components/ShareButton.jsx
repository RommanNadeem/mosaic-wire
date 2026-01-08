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
    summary,
  } = newsItem;

  // Check if device is mobile or tablet (has touch screen)
  const isMobileOrTablet = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create URL with query parameter using the news ID
    const shareUrl = `${window.location.origin}${window.location.pathname}?modal=${id}`;
    const shareTitle = title || 'Check out this news on MosaicBeat';
    
    // Build share text in format: Title, Summary, Link (only for mobile/tablet)
    let shareText = shareTitle;
    if (summary) {
      shareText += `\n\n${summary}`;
    }
    shareText += `\n\n${shareUrl}`;
    
    // Only use native share on mobile/tablet devices
    if (navigator.share && isMobileOrTablet()) {
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
        // Fall through to clipboard on error
      }
    }
    
    // Desktop: Copy only the link to clipboard
    // Mobile/Tablet (if native share failed): Copy full formatted text
    const textToCopy = isMobileOrTablet() ? shareText : shareUrl;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
      
      if (onShare) {
        onShare(shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: select text
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleShare}
        className="relative p-1.5 hover:bg-[var(--bg-surface)] transition-colors"
        title={shareCopied ? "Copied!" : "Share this news"}
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
        {/* Better copied state - show text tooltip below button to avoid overflow clipping */}
        {shareCopied && (
          <span className="absolute top-full right-0 mt-1 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs px-2 py-1 shadow-lg border border-[var(--border-subtle)] whitespace-nowrap pointer-events-none z-[9999]">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}

export default ShareButton;

