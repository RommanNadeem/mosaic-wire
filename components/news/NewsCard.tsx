'use client'

import type { NewsItem } from '@/types/news'
import { useImage } from '@/hooks/useImage'
import { formatTimeAgo } from '@/utils/formatting/time'
import { capitalizeFirst, getCategoryColor } from '@/utils/category/category'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ShareButton from '@/components/shared/ShareButton'

interface NewsCardProps {
  newsItem: NewsItem
  onTitleClick?: (id: string) => void
  onShare?: (url: string) => void
  layout?: 'vertical' | 'horizontal'
}

export default function NewsCard({
  newsItem,
  onTitleClick,
  onShare,
  layout = 'vertical',
}: NewsCardProps) {
  const { imageUrl, imageError } = useImage(newsItem?.image || null)

  if (!newsItem) return null

  const { id, title, category, timeAgo, summary, sentiment, sources } = newsItem

  // Calculate sentiment percentages
  const { positive, neutral, negative } = sentiment || { positive: 0, neutral: 0, negative: 0 }
  // Sentiment might already be percentages or counts
  const total = positive + neutral + negative
  const percentages = total > 0 && total <= 100
    ? {
        // Already percentages
        positive: Math.round(positive),
        neutral: Math.round(neutral),
        negative: Math.round(negative),
      }
    : total > 0
    ? {
        // Counts, convert to percentages
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      }
    : { positive: 0, neutral: 0, negative: 0 }

  // Find dominant sentiment
  let dominantSentiment = 'NEUTRAL'
  let dominantPercentage = percentages.neutral
  if (percentages.positive > percentages.neutral && percentages.positive > percentages.negative) {
    dominantSentiment = 'POSITIVE'
    dominantPercentage = percentages.positive
  } else if (percentages.negative > percentages.positive && percentages.negative > percentages.neutral) {
    dominantSentiment = 'NEGATIVE'
    dominantPercentage = percentages.negative
  }

  if (layout === 'horizontal') {
    // Get unique sources for avatars
    const uniqueSources = Array.from(new Map(sources.map(s => [s.source, s])).values())
    const displayedSources = uniqueSources.slice(0, 4)
    const remainingSourcesCount = uniqueSources.length - displayedSources.length

    return (
      <article
        id={`news-${id}`}
        className={`group overflow-hidden transition-all cursor-pointer rounded-sm`}
        onClick={() => onTitleClick?.(String(id))}
      >
        <div className="flex flex-row">
          {/* Content Section - Left */}
          <div className="flex-1 flex flex-col pr-5 pt-5 pb-5 min-w-0">
            {/* Category, Date, and Share Button */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const colorClass = getCategoryColor(category)
                  const displayText = category || 'UNCATEGORIZED'
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/news/NewsCard.tsx:85',message:'rendering category badge (horizontal)',data:{category,displayText,colorClass,layout:'horizontal'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                  // #endregion
                  return (
                    <span className={`px-3 py-1 text-xs font-semibold uppercase text-white ${colorClass}`}>
                      {displayText}
                    </span>
                  )
                })()}
                <span className="text-xs text-[var(--text-muted)]">
                  {typeof timeAgo === 'string' ? timeAgo : formatTimeAgo(timeAgo)}
                </span>
              </div>
              {/* Share Button - Right side */}
              <ShareButton newsItem={newsItem} onShare={onShare} />
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold text-[var(--text-primary)] transition-colors mb-3 line-clamp-2 leading-tight group-hover:underline"
            >
              {title}
            </h3>

            {/* Sentiment Bar */}
            {sentiment && total > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">
                    {dominantSentiment} {dominantPercentage}%
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden">
                  {percentages.negative > 0 && (
                    <div
                      className="bg-[var(--accent-negative)]"
                      style={{ width: `${percentages.negative}%` }}
                    />
                  )}
                  {percentages.neutral > 0 && (
                    <div
                      className="bg-[var(--accent-neutral)]"
                      style={{ width: `${percentages.neutral}%` }}
                    />
                  )}
                  {percentages.positive > 0 && (
                    <div
                      className="bg-[var(--accent-positive)]"
                      style={{ width: `${percentages.positive}%` }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && (
              <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 flex-1 leading-relaxed">
                {summary}
              </p>
            )}

            {/* Source Avatars and Count */}
            {sources && sources.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-auto">
                <div className="flex items-center -space-x-2">
                  {displayedSources.map((source, index) => {
                    const domain = source.url ? (() => {
                      try {
                        const urlObj = new URL(source.url)
                        return urlObj.hostname.replace('www.', '')
                      } catch (e) {
                        const match = source.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
                        return match ? match[1] : null
                      }
                    })() : null
                    const faviconUrl = source.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)
                    const fallback = source.source ? source.source.charAt(0).toUpperCase() : '?'
                    
                    return (
                      <Avatar
                        key={source.id || source.source}
                        className="h-6 w-6 ring-1 ring-[var(--bg-card)]"
                      >
                        <AvatarImage src={faviconUrl || undefined} alt={source.source || 'Source'} />
                        <AvatarFallback className="text-[var(--text-secondary)] text-xs font-medium">
                          {fallback}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                </div>
                {remainingSourcesCount > 0 && (
                  <span className="font-medium text-[var(--text-secondary)]">
                    +{remainingSourcesCount} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Image Section - Right */}
          <div className="w-48 flex-shrink-0 h-48 overflow-hidden relative">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={title || 'News image'}
                className="w-full h-full object-cover object-right-center"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-50">
                <svg
                  className="w-12 h-12 text-[var(--text-muted)]"
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
        </div>
      </article>
    )
  }

  // Vertical layout (default for More Stories)
  return (
    <article
      id={`news-${id}`}
      className={`group overflow-hidden transition-all cursor-pointer rounded-sm`}
      onClick={() => onTitleClick?.(String(id))}
    >
      {/* Image */}
      <div className="w-full h-48 overflow-hidden relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title || 'News image'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-50">
            <svg
              className="w-12 h-12 text-white opacity-50"
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

      <div className="pr-4 pt-4 pb-4">
        {/* Category, Date, and Share Button */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            {(() => {
              const colorClass = getCategoryColor(category)
              const displayText = category || 'UNCATEGORIZED'
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/news/NewsCard.tsx:250',message:'rendering category badge (vertical)',data:{category,displayText,colorClass,layout:'vertical'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              return (
                <span className={`px-3 py-1 text-xs font-semibold uppercase text-white ${colorClass}`}>
                  {displayText}
                </span>
              )
            })()}
            <span className="text-xs text-[var(--text-muted)]">
              {typeof timeAgo === 'string' ? timeAgo : formatTimeAgo(timeAgo)}
            </span>
          </div>
          {/* Share Button - Right side */}
          <ShareButton newsItem={newsItem} onShare={onShare} />
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-[var(--text-primary)] transition-colors mb-3 line-clamp-2 leading-tight group-hover:underline"
        >
          {title}
        </h3>

        {/* Sentiment Bar */}
        {sentiment && total > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[var(--text-primary)] uppercase">
                {dominantSentiment} {dominantPercentage}%
              </span>
            </div>
            <div className="flex h-3 overflow-hidden bg-[var(--bg-surface)]">
              {percentages.negative > 0 && (
                <div
                  className="bg-[var(--accent-negative)]"
                  style={{ width: `${percentages.negative}%` }}
                />
              )}
              {percentages.neutral > 0 && (
                <div
                  className="bg-[var(--accent-neutral)]"
                  style={{ width: `${percentages.neutral}%` }}
                />
              )}
              {percentages.positive > 0 && (
                <div
                  className="bg-[var(--accent-positive)]"
                  style={{ width: `${percentages.positive}%` }}
                />
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
            {summary}
          </p>
        )}

        {/* Source Count */}
        {sources && sources.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <div className="flex items-center -space-x-2">
              {sources.slice(0, 4).map((source, index) => {
                const domain = source.url ? (() => {
                  try {
                    const urlObj = new URL(source.url)
                    return urlObj.hostname.replace('www.', '')
                  } catch (e) {
                    const match = source.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
                    return match ? match[1] : null
                  }
                })() : null
                const faviconUrl = source.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)
                
                return (
                  <Avatar
                    key={source.id}
                    className="w-6 h-6 border-2 border-[var(--bg-card)]"
                    style={{ zIndex: 4 - index }}
                  >
                    {faviconUrl ? (
                      <AvatarImage
                        src={faviconUrl}
                        alt={source.source || 'Source'}
                      />
                    ) : null}
                    <AvatarFallback className="text-[9px] text-[var(--text-muted)]">
                      {(source.source || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
            {sources.length > 4 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                +{sources.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
