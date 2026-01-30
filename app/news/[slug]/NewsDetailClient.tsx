'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useImage } from '@/hooks/useImage'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { getCategoryTextColor } from '@/utils/category/category'
import ShareButton from '@/components/shared/ShareButton'
import SentimentTooltip from '@/components/sentiment/SentimentTooltip'
import { createSlug } from '@/utils/routing/navigation'
import { formatPublishedUpdated, formatTimeAgo, calculateTimeAgo } from '@/utils/formatting/time'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getYoutubeVideoId, getYoutubeEmbedUrl } from '@/utils/video/youtube'
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
  const [coverageFilter, setCoverageFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const sentimentBarRef = useRef<HTMLDivElement>(null)
  const twitterSectionRef = useRef<HTMLElement>(null)

  // On mobile: close sentiment tooltip when tapping outside the bar
  useEffect(() => {
    if (!isTouchDevice) return
    const handlePointerDown = (e: PointerEvent) => {
      if (sentimentBarRef.current?.contains(e.target as Node)) return
      setHoveredSegment(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isTouchDevice])

  const { id, title, category, summary, sentiment, sources } = newsItem

  // Tweet sources count for Twitter widget load effect
  const tweetStatusCount = (sources || []).filter((s) =>
    /(?:twitter\.com|x\.com)\/\w+\/status\//i.test((s.url || ''))
  ).length

  // Trigger Twitter to parse tweets: immediately, after short delay, and when section is in view
  const triggerTwitterLoad = () => {
    if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
      (window as any).twttr.widgets.load()
    }
  }
  useEffect(() => {
    if (tweetStatusCount === 0) return
    triggerTwitterLoad()
    const id1 = setTimeout(triggerTwitterLoad, 150)
    const id2 = setTimeout(triggerTwitterLoad, 600)
    const el = twitterSectionRef.current
    if (!el) return () => { clearTimeout(id1); clearTimeout(id2) }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) triggerTwitterLoad()
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    io.observe(el)
    return () => {
      clearTimeout(id1)
      clearTimeout(id2)
      io.disconnect()
    }
  }, [tweetStatusCount])

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

  const isTwitterSource = (source: Source): boolean => {
    const name = (source.source || '').toLowerCase()
    const url = (source.url || '').toLowerCase()
    return (
      name.includes('twitter') ||
      name === 'x' ||
      url.includes('twitter.com') ||
      url.includes('x.com')
    )
  }

  const isYoutubeSource = (source: Source): boolean => {
    return getYoutubeVideoId(source.url) != null
  }

  const nonTwitterSources = clusterSources.filter((s) => !isTwitterSource(s))
  const nonTwitterNonYoutubeSources = clusterSources.filter(
    (s) => !isTwitterSource(s) && !isYoutubeSource(s)
  )
  const twitterSources = clusterSources.filter((s) => isTwitterSource(s))
  const youtubeSources = clusterSources.filter((s) => isYoutubeSource(s))

  // Group sources by domain/source name (non-Twitter, non-YouTube for coverage list)
  const groupedSources = nonTwitterNonYoutubeSources.reduce((acc, source) => {
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
        const d = new Date(source.dateTime)
        const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const day = d.getDate()
        const hours = d.getHours()
        const minutes = d.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')
        return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`
      } catch {
        return source.timeAgo || '—'
      }
    }
    return source.timeAgo || '—'
  }

  // Get source abbreviation (first letters)
  const getSourceAbbreviation = (sourceName: string) => {
    const words = sourceName.split(' ')
    if (words.length >= 2) {
      return words.map(w => w.charAt(0).toUpperCase()).join('')
    }
    return sourceName.substring(0, 2).toUpperCase()
  }

  const getDomainFromUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]+)/)
      return match ? match[1] : null
    }
  }

  // Sentiment color for pills and borders
  const getSentimentColor = (sentiment: string | null | undefined): string => {
    if (!sentiment) return 'bg-[var(--accent-neutral)]'
    const s = sentiment.toLowerCase()
    if (s === 'positive') return 'bg-[var(--accent-positive)]'
    if (s === 'negative') return 'bg-[var(--accent-negative)]'
    return 'bg-[var(--accent-neutral)]'
  }
  const getSentimentBorderColor = (sentiment: string | null | undefined): string => {
    if (!sentiment) return 'border-l-[var(--accent-neutral)]'
    const s = sentiment.toLowerCase()
    if (s === 'positive') return 'border-l-[var(--accent-positive)]'
    if (s === 'negative') return 'border-l-[var(--accent-negative)]'
    return 'border-l-[var(--accent-neutral)]'
  }

  // Per-group sentiment counts and dominant for sort
  const getGroupSentimentCounts = (sources: Source[]) => {
    const counts = { positive: 0, neutral: 0, negative: 0 }
    sources.forEach((s) => {
      const v = (s.sentiment || '').toLowerCase()
      if (v === 'positive') counts.positive++
      else if (v === 'negative') counts.negative++
      else counts.neutral++
    })
    return counts
  }
  // Filter coverage by sentiment; sort groups by newest first
  const filteredGroupedEntries: [string, Source[]][] = (() => {
    const entries: [string, Source[]][] = Object.entries(groupedSources).map(([name, groupSources]) => {
      const filtered =
        coverageFilter === 'all'
          ? groupSources
          : groupSources.filter((s) => (s.sentiment || '').toLowerCase() === coverageFilter)
      return [name, filtered]
    }).filter((entry): entry is [string, Source[]] => entry[1].length > 0)

    return [...entries].sort((a, b) => {
      const getLatest = (sources: Source[]) =>
        Math.max(...sources.map((s) => (s.dateTime ? new Date(s.dateTime).getTime() : 0)))
      return getLatest(b[1]) - getLatest(a[1])
    })
  })()

  const totalOutlets = Object.keys(groupedSources).length
  const totalArticles = nonTwitterNonYoutubeSources.length

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
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span itemProp="articleSection" className={`text-xs font-semibold uppercase ${getCategoryTextColor(category)}`}>
                    {(category || 'UNCATEGORIZED').toUpperCase()}
                  </span>
                  <time itemProp="datePublished" dateTime={publishedDate} className="text-sm text-[var(--text-muted)] mt-3 sm:mt-0">
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
                          onMouseLeave={() => !isTouchDevice && setHoveredSegment(null)}
                          onClick={() => isTouchDevice && setHoveredSegment((prev) => (prev === 'negative' ? null : 'negative'))}
                          role={isTouchDevice ? 'button' : undefined}
                          aria-label={isTouchDevice ? 'Negative sentiment — tap for details' : undefined}
                        />
                      )}
                      {percentages.neutral > 0 && (
                        <div
                          className="bg-[var(--accent-neutral)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                          style={{ width: `${percentages.neutral}%` }}
                          onMouseEnter={() => !isTouchDevice && setHoveredSegment('neutral')}
                          onMouseLeave={() => !isTouchDevice && setHoveredSegment(null)}
                          onClick={() => isTouchDevice && setHoveredSegment((prev) => (prev === 'neutral' ? null : 'neutral'))}
                          role={isTouchDevice ? 'button' : undefined}
                          aria-label={isTouchDevice ? 'Neutral sentiment — tap for details' : undefined}
                        />
                      )}
                      {percentages.positive > 0 && (
                        <div
                          className="bg-[var(--accent-positive)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:brightness-110"
                          style={{ width: `${percentages.positive}%` }}
                          onMouseEnter={() => !isTouchDevice && setHoveredSegment('positive')}
                          onMouseLeave={() => !isTouchDevice && setHoveredSegment(null)}
                          onClick={() => isTouchDevice && setHoveredSegment((prev) => (prev === 'positive' ? null : 'positive'))}
                          role={isTouchDevice ? 'button' : undefined}
                          aria-label={isTouchDevice ? 'Positive sentiment — tap for details' : undefined}
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
                  <div className="w-1 bg-[var(--summary-bar)] flex-shrink-0" aria-hidden="true"></div>
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

                   {/* Sources in Cluster (non-Twitter, non-YouTube) */}
                   {nonTwitterNonYoutubeSources.length > 0 && (
                     <section aria-label="Coverage across sources">
                       {/* Section header: title, subheading, stats, AI label, takeaway */}
                       <div className="mb-6">
                         <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
                           COVERAGE ACROSS SOURCES
                         </h2>
                         <p className="text-sm text-[var(--text-muted)] mt-1">
                           How different outlets covered this story.
                         </p>
                         <div className="flex flex-wrap items-center gap-3 mt-3">
                           <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                             {totalOutlets} {totalOutlets === 1 ? 'outlet' : 'outlets'} · {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                           </span>
                         </div>
                       </div>

                       {/* Filter chips */}
                       <div className="flex flex-wrap items-center gap-1.5 mb-6">
                         <span className="text-[9px] font-semibold uppercase text-[var(--text-muted)] tracking-wider mr-0.5">Filter:</span>
                         {(['all', 'positive', 'neutral', 'negative'] as const).map((value) => (
                           <button
                             key={value}
                             type="button"
                             onClick={() => setCoverageFilter(value)}
                             className={`min-h-[28px] px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-positive)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-primary)] ${
                               coverageFilter === value
                                 ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                 : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                             }`}
                             aria-pressed={coverageFilter === value}
                             aria-label={`Filter by ${value === 'all' ? 'all sentiments' : value}`}
                           >
                             {value === 'all' ? 'All' : value}
                           </button>
                         ))}
                       </div>

                       {filteredGroupedEntries.length === 0 ? (
                         <p className="text-sm text-[var(--text-muted)] italic py-4">
                           {coverageFilter === 'all'
                             ? 'No coverage sources.'
                             : `No articles with ${coverageFilter} sentiment.`}
                         </p>
                       ) : (
                       <div className="space-y-8">
                         {filteredGroupedEntries.map(([sourceName, groupSources]) => {
                           const sourceAbbr = getSourceAbbreviation(sourceName)
                           const domain = getDomainFromUrl(groupSources[0]?.url)
                           const faviconUrl = groupSources[0]?.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)
                           const sentimentCounts = getGroupSentimentCounts(groupSources)
                           const latestInGroup = groupSources.length > 0
                             ? groupSources.reduce((latest, s) => {
                                 const t = s.dateTime ? new Date(s.dateTime).getTime() : 0
                                 return t > (latest.dateTime ? new Date(latest.dateTime).getTime() : 0) ? s : latest
                               })
                             : null
                           const latestTimeAgo = latestInGroup?.dateTime
                             ? formatTimeAgo(calculateTimeAgo(latestInGroup.dateTime))
                             : null

                           const sortedArticles = [...groupSources].sort((a, b) => {
                             const ta = a.dateTime ? new Date(a.dateTime).getTime() : 0
                             const tb = b.dateTime ? new Date(b.dateTime).getTime() : 0
                             return tb - ta
                           })

                           return (
                             <div key={sourceName} className="space-y-4">
                               {/* Source Header with per-source sentiment summary */}
                               <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-[var(--border-subtle)]">
                                 <Avatar className="w-6 h-6 rounded-sm flex-shrink-0">
                                   {faviconUrl ? (
                                     <AvatarImage src={faviconUrl} alt={sourceName} className="object-cover" />
                                   ) : null}
                                   <AvatarFallback className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[8px] font-bold rounded-sm">
                                     {sourceAbbr}
                                   </AvatarFallback>
                                 </Avatar>
                                 <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                   {sourceName}
                                 </h3>
                                 {latestTimeAgo && (
                                   <span className="text-xs text-[var(--text-muted)] ml-auto">
                                     Updated {latestTimeAgo}
                                   </span>
                                 )}
                                 {/* Mini sentiment bar - hidden on mobile to avoid thin green line; shown sm+ */}
                                 {(() => {
                                   const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative
                                   if (total === 0) return null
                                   return (
                                     <div className="hidden sm:flex w-full sm:w-auto sm:ml-0 h-1.5 rounded overflow-hidden flex-shrink-0" style={{ maxWidth: 80 }} role="img" aria-label={`${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative`}>
                                       {sentimentCounts.positive > 0 && (
                                         <div className="h-full bg-[var(--accent-positive)]" style={{ width: `${(sentimentCounts.positive / total) * 100}%` }} title={`${sentimentCounts.positive} positive`} />
                                       )}
                                       {sentimentCounts.neutral > 0 && (
                                         <div className="h-full bg-[var(--accent-neutral)]" style={{ width: `${(sentimentCounts.neutral / total) * 100}%` }} title={`${sentimentCounts.neutral} neutral`} />
                                       )}
                                       {sentimentCounts.negative > 0 && (
                                         <div className="h-full bg-[var(--accent-negative)]" style={{ width: `${(sentimentCounts.negative / total) * 100}%` }} title={`${sentimentCounts.negative} negative`} />
                                       )}
                                     </div>
                                   )
                                 })()}
                               </div>

                               {/* Source Articles: narrow card for all */}
                               <div className="grid grid-cols-1 gap-3">
                                 {sortedArticles.map((source) => (
                                   <a
                                     key={source.id}
                                     href={source.url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex flex-wrap items-center gap-2 py-3 px-3 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] hover:border-[var(--text-muted)] transition-colors border-l-4 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-positive)] focus-visible:ring-offset-2"
                                     style={{ borderLeftColor: source.sentiment === 'positive' ? 'var(--accent-positive)' : source.sentiment === 'negative' ? 'var(--accent-negative)' : 'var(--accent-neutral)' }}
                                     onClick={(e) => e.stopPropagation()}
                                     aria-label={`${source.sentiment || 'neutral'} sentiment`}
                                   >
                                     <span className="text-sm font-medium text-[var(--text-primary)] italic line-clamp-1 flex-1 min-w-0">
                                       {source.headline}
                                     </span>
                                     <span className="text-[10px] text-[var(--text-muted)] uppercase whitespace-nowrap">
                                       {formatSourceDateTime(source)}
                                     </span>
                                     <span className="text-[10px] text-[var(--accent-positive)] font-semibold uppercase tracking-wide flex-shrink-0">
                                       Read →
                                     </span>
                                   </a>
                                 ))}
                               </div>
                             </div>
                           )
                         })}
                       </div>
                       )}
                     </section>
                   )}

                   {/* From YouTube - one row: [YouTube icon] YouTube + all videos in one row */}
                   {(() => {
                     if (youtubeSources.length === 0) return null
                     const seenVideoIds = new Set<string>()
                     const youtubeVideos = youtubeSources.filter((source) => {
                       const id = getYoutubeVideoId(source.url)
                       if (!id || seenVideoIds.has(id)) return false
                       seenVideoIds.add(id)
                       return true
                     })
                     const embedUrl = (url: string) => getYoutubeEmbedUrl(url) || url
                     const youtubeFavicon = 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32'
                     return (
                       <section className="mt-12" aria-label="From YouTube">
                         <div className="space-y-4">
                           <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-[var(--border-subtle)]">
                             <Avatar className="w-6 h-6 rounded-sm flex-shrink-0">
                               <AvatarImage src={youtubeFavicon} alt="YouTube" className="object-cover" />
                               <AvatarFallback className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[8px] font-bold rounded-sm">YT</AvatarFallback>
                             </Avatar>
                             <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">YouTube</h3>
                           </div>
                           {/* Constrain width so ~2 full videos + half of third show (scroll affordance) */}
                           <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide max-w-[840px]">
                             {youtubeVideos.map((source) => (
                               <div key={source.id} className="flex-shrink-0 w-[min(100%,320px)] min-w-[280px] max-w-[360px] rounded overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] snap-start">
                                 <div className="aspect-video w-full bg-[var(--bg-surface)]">
                                   <iframe src={embedUrl(source.url)} title={source.headline || 'YouTube video'} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                                 </div>
                                 {(source.headline || source.source) && (
                                   <div className="p-3">
                                     {source.headline && <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{source.headline}</p>}
                                     <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-positive)] mt-2 inline-flex items-center gap-1 uppercase tracking-wide">
                                       Watch on YouTube →
                                     </a>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       </section>
                     )
                   })()}

                   {/* From Twitter - same source UI as coverage */}
                   {(() => {
                     const tweetSources = twitterSources.filter((s) =>
                       /(?:twitter\.com|x\.com)\/\w+\/status\//i.test(s.url || '')
                     )
                     if (tweetSources.length === 0) return null
                     const groupedTwitter = tweetSources.reduce((acc, source) => {
                       const key = source.source || 'Twitter'
                       if (!acc[key]) acc[key] = []
                       acc[key].push(source)
                       return acc
                     }, {} as Record<string, Source[]>)
                     const twitterGroupEntries = Object.entries(groupedTwitter).sort((a, b) => {
                       const getLatest = (s: Source[]) => Math.max(...s.map((x) => (x.dateTime ? new Date(x.dateTime).getTime() : 0)))
                       return getLatest(b[1]) - getLatest(a[1])
                     })
                     return (
                       <section ref={twitterSectionRef} className="mt-12" aria-label="From Twitter">
                         <div className="space-y-8">
                           {twitterGroupEntries.map(([sourceName, groupSources]) => {
                             const sourceAbbr = getSourceAbbreviation(sourceName)
                             const domain = getDomainFromUrl(groupSources[0]?.url)
                             const faviconUrl = groupSources[0]?.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)
                             const sentimentCounts = getGroupSentimentCounts(groupSources)
                             const latestInGroup = groupSources.length > 0
                               ? groupSources.reduce((latest, s) => (s.dateTime && new Date(s.dateTime).getTime() > (latest.dateTime ? new Date(latest.dateTime).getTime() : 0) ? s : latest))
                               : null
                             const latestTimeAgo = latestInGroup?.dateTime ? formatTimeAgo(calculateTimeAgo(latestInGroup.dateTime)) : null
                             return (
                               <div key={sourceName} className="space-y-4">
                                 <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-[var(--border-subtle)]">
                                   <Avatar className="w-6 h-6 rounded-sm flex-shrink-0">
                                     {faviconUrl ? <AvatarImage src={faviconUrl} alt={sourceName} className="object-cover" /> : null}
                                     <AvatarFallback className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[8px] font-bold rounded-sm">{sourceAbbr}</AvatarFallback>
                                   </Avatar>
                                   <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{sourceName}</h3>
                                   {latestTimeAgo && <span className="text-xs text-[var(--text-muted)] ml-auto">Updated {latestTimeAgo}</span>}
                                   {(() => {
                                     const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative
                                     if (total === 0) return null
                                     return (
                                       <div className="hidden sm:flex w-full sm:w-auto h-1.5 rounded overflow-hidden flex-shrink-0" style={{ maxWidth: 80 }} role="img" aria-label={`${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, ${sentimentCounts.negative} negative`}>
                                         {sentimentCounts.positive > 0 && <div className="h-full bg-[var(--accent-positive)]" style={{ width: `${(sentimentCounts.positive / total) * 100}%` }} />}
                                         {sentimentCounts.neutral > 0 && <div className="h-full bg-[var(--accent-neutral)]" style={{ width: `${(sentimentCounts.neutral / total) * 100}%` }} />}
                                         {sentimentCounts.negative > 0 && <div className="h-full bg-[var(--accent-negative)]" style={{ width: `${(sentimentCounts.negative / total) * 100}%` }} />}
                                       </div>
                                     )
                                   })()}
                                 </div>
                                 {/* Constrain width so ~2 full tweets + half of third show (scroll affordance) */}
                                 <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory scrollbar-hide max-w-[1000px]">
                                   {groupSources.map((source) => (
                                     <div
                                       key={source.id}
                                       className="relative flex-shrink-0 w-[calc((100%-2rem)/3)] min-w-[360px] max-w-[400px] min-h-[480px] overflow-hidden snap-start pt-3 pr-3 pb-3 pl-3"
                                     >
                                       {/* Scaled tweet: 550px nominal → 330px visible at 0.6; container fits with padding so no clipping */}
                                       <div className="absolute overflow-visible" style={{ left: 12, top: 12, width: 550, transform: 'scale(0.6)', transformOrigin: '0 0' }}>
                                         <blockquote className="twitter-tweet" data-dnt="true" data-theme="dark">
                                           <a href={source.url!} />
                                         </blockquote>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )
                           })}
                         </div>
                       </section>
                     )
                   })()}
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
