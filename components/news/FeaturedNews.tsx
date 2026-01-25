'use client'

import { useState, useRef } from 'react'
import type { NewsItem } from '@/types/news'
import { useImage } from '@/hooks/useImage'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { formatTimeAgo } from '@/utils/formatting/time'
import { capitalizeFirst, getCategoryColor } from '@/utils/category/category'
import ShareButton from '@/components/shared/ShareButton'
import SourceList from '@/components/news/SourceList'
import SentimentTooltip from '@/components/sentiment/SentimentTooltip'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface FeaturedNewsProps {
  newsItem: NewsItem | null
  onTitleClick?: (id: string) => void
  onShare?: (url: string) => void
}

export default function FeaturedNews({ newsItem, onTitleClick, onShare }: FeaturedNewsProps) {
  const { imageUrl, imageError } = useImage(newsItem?.image || null)
  const { isTouchDevice } = useTouchDevice()
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)
  const sentimentBarRef = useRef<HTMLDivElement>(null)

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

  // Get unique sources for avatars
  const uniqueSources = Array.from(new Map(sources.map(s => [s.source, s])).values())
  const totalSourcesCount = uniqueSources.length

  return (
    <article
      id={`news-${id}`}
      className="group overflow-hidden mb-8 relative transition-all duration-200 rounded-sm cursor-pointer"
      onClick={() => onTitleClick?.(String(id))}
    >
      {/* Image */}
      <div className="w-full h-64 md:h-80 lg:h-[450px] overflow-hidden relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title || 'News image'}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
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
          </div>
        )}
      </div>

      <div className="pr-4 sm:pr-6 py-4">
        {/* Category, Date, and Share Button */}
        <div className="flex items-center justify-between gap-3 mb-3 text-left">
          <div className="flex items-center gap-3">
            {(() => {
              const colorClass = getCategoryColor(category)
              const displayText = category || 'UNCATEGORIZED'
              const fullClassName = `px-3 py-1 text-xs font-semibold uppercase text-white ${colorClass}`
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/news/FeaturedNews.tsx:111',message:'rendering category badge',data:{category,displayText,colorClass,fullClassName,classNameLength:fullClassName.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              // #region agent log - verify DOM after render
              if (typeof window !== 'undefined') {
                setTimeout(() => {
                  const elements = document.querySelectorAll('[class*="bg-blue-600"], [class*="bg-purple-600"], [class*="bg-slate-600"], [class*="bg-green-600"]')
                  elements.forEach((el, idx) => {
                    const computedStyle = window.getComputedStyle(el)
                    fetch('http://127.0.0.1:7244/ingest/42a0f6a5-3fa7-4a58-9e96-0413017a13f0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/news/FeaturedNews.tsx:DOM',message:'DOM element check',data:{elementIndex:idx,className:el.className,bgColor:computedStyle.backgroundColor,color:computedStyle.color,hasBgClass:el.className.includes('bg-')},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
                  })
                }, 1000)
              }
              // #endregion
              return (
                <span className={fullClassName}>
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

        {/* Headline */}
        <h2
          className="text-2xl md:text-4xl lg:text-[49px] font-bold text-[var(--text-primary)] leading-tight transition-colors mb-3 line-clamp-2 text-left group-hover:underline"
        >
          {title}
        </h2>

        {/* Sentiment Bar with percentage on the right */}
        {sentiment && total > 0 && (
          <div className="mb-4 text-left" ref={sentimentBarRef}>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative overflow-visible">
                <div className="flex h-4 overflow-hidden relative">
                  {percentages.negative > 0 && (
                    <div
                      className="bg-[var(--accent-negative)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.negative}%` }}
                      onMouseEnter={() => !isTouchDevice && setHoveredSegment('negative')}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  )}
                  {percentages.neutral > 0 && (
                    <div
                      className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.neutral}%` }}
                      onMouseEnter={() => !isTouchDevice && setHoveredSegment('neutral')}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  )}
                  {percentages.positive > 0 && (
                    <div
                      className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                      style={{ width: `${percentages.positive}%` }}
                      onMouseEnter={() => !isTouchDevice && setHoveredSegment('positive')}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  )}
                </div>
                <SentimentTooltip
                  hoveredSegment={hoveredSegment}
                  sentiment={sentiment}
                  tooltipRef={tooltipRef}
                  sentimentBarRef={sentimentBarRef}
                  tooltipStyle={tooltipStyle}
                  setTooltipStyle={setTooltipStyle}
                />
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)] uppercase whitespace-nowrap">
                {dominantSentiment} {dominantPercentage}%
              </span>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 text-left">
            {summary}
          </p>
        )}

        {/* Source Aggregation */}
        {sources && sources.length > 0 && (
          <div className="flex items-center gap-2 text-left">
            <div className="flex items-center -space-x-2">
              {uniqueSources.slice(0, 4).map((source, index) => {
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
                    key={source.id || source.source}
                    className="w-6 h-6 ring-1 ring-[var(--bg-card)]"
                    style={{ zIndex: 4 - index }}
                  >
                    {faviconUrl ? (
                      <AvatarImage
                        src={faviconUrl}
                        alt={source.source || 'Source'}
                      />
                    ) : null}
                    <AvatarFallback className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-surface)]">
                      {(source.source || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
            {uniqueSources.length > 4 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                +{uniqueSources.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
