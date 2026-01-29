'use client'

import { useShare } from '@/hooks/useShare'
import type { NewsItem } from '@/types/news'

interface ShareButtonProps {
  newsItem: NewsItem | null
  onShare?: (url: string) => void
  className?: string
  iconSize?: string
}

export default function ShareButton({ 
  newsItem, 
  onShare, 
  className = '',
  iconSize = 'w-4 h-4'
}: ShareButtonProps) {
  const { shareCopied, handleShare } = useShare(onShare)

  if (!newsItem) return null

  return (
    <div className={className}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleShare({
            id: newsItem.id,
            title: newsItem.title,
            summary: newsItem.summary,
          })
        }}
        className="relative p-1.5 hover:bg-[var(--bg-surface)] transition-colors focus:outline-none focus:ring-0"
        title={shareCopied ? 'Copied!' : 'Share this news'}
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
        {shareCopied && (
          <span className="absolute top-full right-0 mt-1 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs px-2 py-1 shadow-lg border border-[var(--border-subtle)] whitespace-nowrap pointer-events-none z-[9999]">
            Copied!
          </span>
        )}
      </button>
    </div>
  )
}

