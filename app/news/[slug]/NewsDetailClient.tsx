'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useImage } from '@/hooks/useImage'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { getCategoryTextColor } from '@/utils/category/category'
import ShareButton from '@/components/shared/ShareButton'
import SentimentTooltip from '@/components/sentiment/SentimentTooltip'
import { createSlug } from '@/utils/routing/navigation'
import { formatPublishedUpdated } from '@/utils/formatting/time'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { NewsItem, Source } from '@/types/news'

interface NewsDetailClientProps {
  newsItem: NewsItem
  allNewsData: NewsItem[]
  articles: any[]
  date: string
  verdict: string
  primarySourcesCount: number
  keywordDensity: string
  aggregationLatency: string
}

const TRENDING_SIDEBAR_COUNT = 5

function TrendingSidebarCard({ item }: { item: NewsItem }) {
  const { imageUrl, imageError } = useImage(item?.image || null)
  const slug = createSlug(item.title, item.id)
  return (
    <Link
      href={`/news/${slug}`}
      className="flex gap-3 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors group"
    >
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-[var(--bg-surface)]">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className={`text-[10px] font-semibold uppercase ${getCategoryTextColor(item.category)}`}>
          {(item.category || 'News').toUpperCase()}
        </span>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 line-clamp-2 leading-snug group-hover:underline">
          {item.title}
        </h3>
      </div>
    </Link>
  )
}

export default function NewsDetailClient({
  newsItem,
  allNewsData = [],
  articles,
  date,
  verdict,
  primarySourcesCount,
  keywordDensity,
  aggregationLatency,
}: NewsDetailClientProps) {
  const { imageUrl, imageError } = useImage(newsItem?.image || null)
  const { isTouchDevice } = useTouchDevice()
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [detailedAnalysisExpanded, setDetailedAnalysisExpanded] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const sentimentBarRef = useRef<HTMLDivElement>(null)

  const { id, title, category, summary, sentiment, sources } = newsItem

  // Calculate sentiment percentages
  const { positive, neutral, negative } = sentiment || { positive: 0, neutral: 0, negative: 0 }
  const total = positive + neutral + negative
  const percentages = total > 0 && total <= 100
    ? {
        positive: Math.round(positive),
        neutral: Math.round(neutral),
        negative: Math.round(negative),
      }
    : total > 0
    ? {
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

  // Get all sources for the "Sources in Cluster" section
  const clusterSources = sources || []

  // Group sources by domain/source name
  const groupedSources = clusterSources.reduce((acc, source) => {
    const key = source.source || 'Unknown'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(source)
    return acc
  }, {} as Record<string, Source[]>)

  // Sort groups by the most recent article in each group
  const sortedGroupedSources = Object.entries(groupedSources).sort((a, b) => {
    const getLatestTime = (sources: Source[]) => {
      return Math.max(...sources.map(s => s.dateTime ? new Date(s.dateTime).getTime() : 0))
    }
    return getLatestTime(b[1]) - getLatestTime(a[1])
  })

  // Format date/time for sources
  const formatSourceDateTime = (source: Source) => {
    if (source.dateTime) {
      try {
        const date = new Date(source.dateTime)
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')
        return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`
      } catch (e) {
        return date
      }
    }
    return date
  }

  // Get source abbreviation (first letters)
  const getSourceAbbreviation = (sourceName: string) => {
    const words = sourceName.split(' ')
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('')
    }
    return sourceName.substring(0, 2).toUpperCase()
  }

  const publishedDate = newsItem.publishedAt ? new Date(newsItem.publishedAt).toISOString() : (newsItem.updatedAt ? new Date(newsItem.updatedAt).toISOString() : new Date().toISOString())
  const modifiedDate = newsItem.updatedAt ? new Date(newsItem.updatedAt).toISOString() : publishedDate
  const publishedUpdatedLabel = formatPublishedUpdated(newsItem.publishedAt, newsItem.updatedAt) || date

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      <article itemScope itemType="https://schema.org/NewsArticle" className="max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-[60px] py-8 min-w-0">
        <div className="flex flex-col xl:flex-row gap-8 xl:items-start min-w-0">
          {/* Main Content - Left Column (article grid: back link, meta, share, heading, content) */}
          <div className="flex-1 xl:w-[75%] min-w-0">
            <header className="mb-6">
              <nav aria-label="Breadcrumb">
                <Link 
                  href="/"
                  className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors group/back"
                >
                  <svg 
                    className="w-3 h-3 transition-transform group-hover/back:-translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  BACK TO STORIES
                </Link>
              </nav>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span itemProp="articleSection" className={`text-xs font-semibold uppercase ${getCategoryTextColor(category)}`}>
                    {(category || 'UNCATEGORIZED').toUpperCase()}
                  </span>
                  <time itemProp="datePublished" dateTime={publishedDate} className="text-sm text-[var(--text-muted)]">
                    {publishedUpdatedLabel}
                  </time>
                  {modifiedDate !== publishedDate && (
                    <time itemProp="dateModified" dateTime={modifiedDate} className="sr-only">
                      {modifiedDate}
                    </time>
                  )}
                </div>
                <ShareButton newsItem={newsItem} onShare={() => {}} />
              </div>
            </header>
            <h1 itemProp="headline" className="text-2xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] uppercase leading-tight mb-6">
              {title}
            </h1>

            {/* Sentiment Bar with percentage on the right */}
            {sentiment && total > 0 && (
              <div className="mb-8 text-left" ref={sentimentBarRef}>
                <div className="flex items-center gap-3">
                  <div className="w-1/2 relative overflow-visible">
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

            {/* Image */}
            <figure className="w-full h-[200px] md:h-[300px] lg:h-[400px] mb-12 overflow-hidden relative">
              {imageUrl && !imageError ? (
                <img
                  itemProp="image"
                  src={imageUrl}
                  alt={title || 'News image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)]" aria-hidden="true">
                  <svg
                    className="w-16 h-16 text-[var(--text-muted)] opacity-50"
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
            </figure>

            {/* Summary Section - Below Image */}
            {summary && (
              <section className="mb-12" itemProp="description">
                <div className="flex gap-4">
                  <div className="w-1 bg-[var(--accent-positive)] flex-shrink-0" aria-hidden="true"></div>
                  <div className="flex-1">
                    <p itemProp="abstract" className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
                      {summary}
                    </p>
                  </div>
                </div>
                {newsItem.detailedSummary && (() => {
                  const paragraphs = newsItem.detailedSummary.split('\n').map(p => p.trim()).filter(Boolean)
                  const firstParagraph = paragraphs[0] ?? ''
                  const hasMore = paragraphs.length > 1
                  const isExpanded = detailedAnalysisExpanded || !hasMore
                  return (
                    <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                      <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Detailed Analysis</h2>
                      <div itemProp="articleBody" className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-4">
                        <p>{firstParagraph}</p>
                        {isExpanded && paragraphs.slice(1).map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => setDetailedAnalysisExpanded(!detailedAnalysisExpanded)}
                            className="text-sm font-medium text-[var(--accent-positive)] hover:underline focus:outline-none focus:underline"
                          >
                            {detailedAnalysisExpanded ? 'Less' : 'More…'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </section>
            )}

                   {/* Sources in Cluster */}
                   {clusterSources.length > 0 && (
                     <section aria-label="Coverage across sources">
                       <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">COVERAGE ACROSS SOURCES</h2>
                       </div>
                       <div className="space-y-8">
                         {sortedGroupedSources.map(([sourceName, groupSources]) => {
                           // Get source abbreviation for fallback
                           const sourceAbbr = getSourceAbbreviation(sourceName)
                           
                           // Get domain from URL for favicon
                           const getDomainFromUrl = (url: string | null | undefined): string | null => {
                             if (!url) return null
                             try {
                               const urlObj = new URL(url)
                               return urlObj.hostname.replace('www.', '')
                             } catch (e) {
                               const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
                               return match ? match[1] : null
                             }
                           }
                           
                           const domain = getDomainFromUrl(groupSources[0]?.url)
                           const faviconUrl = groupSources[0]?.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)

                           return (
                             <div key={sourceName} className="space-y-4">
                               {/* Source Header */}
                               <div className="flex items-center gap-3 pb-2 border-b border-[var(--border-subtle)]">
                                 <Avatar className="w-6 h-6 rounded-sm">
                                   {faviconUrl ? (
                                     <AvatarImage
                                       src={faviconUrl}
                                       alt={sourceName}
                                       className="object-cover"
                                     />
                                   ) : null}
                                   <AvatarFallback className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[8px] font-bold rounded-sm">
                                     {sourceAbbr}
                                   </AvatarFallback>
                                 </Avatar>
                                 <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                   {sourceName}
                                 </h3>
                                 <span className="text-xs text-[var(--text-muted)] ml-auto">
                                   {groupSources.length} {groupSources.length === 1 ? 'ARTICLE' : 'ARTICLES'}
                                 </span>
                               </div>

                               {/* Source Articles */}
                               <div className="grid grid-cols-1 gap-4">
                                 {groupSources.map((source) => {
                                   const sentimentLabel = source.sentiment 
                                     ? source.sentiment.toUpperCase() 
                                     : 'NEUTRAL'
                                   
                                   const getSentimentColor = (sentiment: string | null | undefined): string => {
                                     if (!sentiment) return 'bg-[var(--accent-neutral)]'
                                     const sentimentLower = sentiment.toLowerCase()
                                     if (sentimentLower === 'positive') return 'bg-[var(--accent-positive)]'
                                     if (sentimentLower === 'negative') return 'bg-[var(--accent-negative)]'
                                     return 'bg-[var(--accent-neutral)]'
                                   }
                                   
                                   const sentimentColorClass = getSentimentColor(source.sentiment)
                                   
                                   return (
                                     <div 
                                       key={source.id} 
                                       className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 flex flex-col sm:flex-row items-start gap-4"
                                     >
                                       {/* Content Section */}
                                       <div className="flex-1 min-w-0">
                                         {/* Sentiment Tag */}
                                         <div className="mb-2">
                                           <span className={`px-2 py-0.5 ${sentimentColorClass} text-white text-[10px] font-semibold uppercase rounded-sm`}>
                                             {sentimentLabel}
                                           </span>
                                         </div>
                                         
                                         {/* Headline */}
                                         <h4 className="text-sm font-bold text-[var(--text-primary)] italic mb-2 leading-relaxed">
                                           {source.headline}
                                         </h4>
                                       </div>
                                       
                                       {/* Right Section - Date and Read Button */}
                                       <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                         <div className="text-[10px] text-[var(--text-muted)] uppercase whitespace-nowrap">
                                           {formatSourceDateTime(source)}
                                         </div>
                                         <a
                                           href={source.url}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-positive)] inline-flex items-center gap-1 uppercase tracking-wide"
                                           onClick={(e) => e.stopPropagation()}
                                         >
                                           READ
                                           <svg className="w-3 h-3 text-[var(--accent-positive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                           </svg>
                                         </a>
                                       </div>
                                     </div>
                                   )
                                 })}
                               </div>
                             </div>
                           )
                         })}
                       </div>
                     </section>
                   )}
          </div>

          {/* Right Sidebar - Next trending stories */}
          <aside className="xl:w-[25%] lg:flex-shrink-0 flex flex-col space-y-4 xl:sticky xl:top-8 xl:self-start" aria-label="More stories">
            {allNewsData.length > 1 && (() => {
              const otherStories = allNewsData.filter((item) => String(item.id) !== String(newsItem.id)).slice(0, TRENDING_SIDEBAR_COUNT)
              if (otherStories.length === 0) return null
              return (
                <>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2">
                    More Stories
                  </h2>
                  <div className="space-y-3">
                    {otherStories.map((item) => (
                      <TrendingSidebarCard key={item.id} item={item} />
                    ))}
                  </div>
                </>
              )
            })()}
          </aside>
        </div>
      </article>
    </div>
  )
}
