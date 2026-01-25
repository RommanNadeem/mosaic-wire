'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useImage } from '@/hooks/useImage'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { getCategoryColor } from '@/utils/category/category'
import ShareButton from '@/components/shared/ShareButton'
import BiasDistribution from '@/components/news/BiasDistribution'
import LatestStories from '@/components/news/LatestStories'
import WhatWeAnalyze from '@/components/news/WhatWeAnalyze'
import SentimentTooltip from '@/components/sentiment/SentimentTooltip'
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

export default function NewsDetailClient({
  newsItem,
  allNewsData,
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-[60px] py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content - Left Column */}
          <div className="flex-1 xl:w-[75%]">
            {/* Top Section - Back Link, Category, Date */}
            <div className="mb-6">
              <Link 
                href="/"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-positive)] mb-4 inline-block"
              >
                &lt; BACK TO NEWSROOM
              </Link>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold uppercase text-white ${getCategoryColor(category)}`}>
                    {category || 'UNCATEGORIZED'}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">
                    {date}
                  </span>
                </div>
                {/* Share Button - Right side */}
                <ShareButton newsItem={newsItem} onShare={() => {}} />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] uppercase leading-tight mb-6">
                {title}
              </h1>
            </div>

            {/* Sentiment Bar with percentage on the right */}
            {sentiment && total > 0 && (
              <div className="mb-8 text-left" ref={sentimentBarRef}>
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

            {/* Image */}
            <div className="w-full h-[200px] md:h-[300px] lg:h-[400px] mb-12 overflow-hidden relative">
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={title || 'News image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)]">
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
            </div>

            {/* Summary Section - Below Image */}
            {summary && (
              <div className="mb-12">
                <div className="flex gap-4">
                  <div className="w-1 bg-[var(--accent-positive)] flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                      {summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sources in Cluster */}
            {clusterSources.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">SOURCES IN CLUSTER</h2>
                  <span className="text-sm text-[var(--text-secondary)] uppercase tracking-wide">MULTIPLE VIEWPOINTS ANALYZED</span>
                </div>
                <div className="space-y-4">
                  {clusterSources.map((source) => {
                    // Get sentiment label
                    const sentimentLabel = source.sentiment 
                      ? source.sentiment.toUpperCase() 
                      : 'NEUTRAL'
                    
                    // Get sentiment color class
                    const getSentimentColor = (sentiment: string | null | undefined): string => {
                      if (!sentiment) return 'bg-[var(--accent-neutral)]'
                      const sentimentLower = sentiment.toLowerCase()
                      if (sentimentLower === 'positive') {
                        return 'bg-[var(--accent-positive)]'
                      } else if (sentimentLower === 'negative') {
                        return 'bg-[var(--accent-negative)]'
                      }
                      return 'bg-[var(--accent-neutral)]'
                    }
                    
                    const sentimentColorClass = getSentimentColor(source.sentiment)
                    
                    // Get source abbreviation for fallback
                    const sourceAbbr = getSourceAbbreviation(source.source || 'UN')
                    
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
                    
                    const domain = getDomainFromUrl(source.url)
                    const faviconUrl = source.favicon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null)
                    
                    return (
                      <div 
                        key={source.id} 
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 flex flex-col sm:flex-row items-start gap-4"
                      >
                        {/* Source Icon/Logo */}
                        <Avatar className="w-10 h-10 flex-shrink-0 rounded-sm">
                          {faviconUrl ? (
                            <AvatarImage
                              src={faviconUrl}
                              alt={source.source || 'Source'}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold rounded-sm">
                            {sourceAbbr}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Content Section */}
                        <div className="flex-1 min-w-0">
                          {/* Source Name and Sentiment Tag */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-bold text-[var(--text-primary)] uppercase">
                              {source.source?.toUpperCase() || 'UNKNOWN'}
                            </span>
                            <span className={`px-2 py-0.5 ${sentimentColorClass} text-white text-xs font-semibold uppercase rounded-sm`}>
                              {sentimentLabel}
                            </span>
                          </div>
                          
                          {/* Headline */}
                          <h3 className="text-sm font-bold text-[var(--text-primary)] italic mb-2 leading-relaxed">
                            {source.headline}
                          </h3>
                        </div>
                        
                        {/* Right Section - Date and Read Button */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {/* Publication Date */}
                          <div className="text-xs text-[var(--text-muted)] uppercase whitespace-nowrap">
                            {formatSourceDateTime(source)}
                          </div>
                          
                          {/* Read Button */}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-positive)] inline-flex items-center gap-1 uppercase tracking-wide"
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
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="xl:w-[25%] lg:flex-shrink-0 flex flex-col space-y-4 xl:sticky xl:top-8 xl:h-fit">
            <BiasDistribution newsData={allNewsData} />
            <WhatWeAnalyze newsData={allNewsData} />
            <LatestStories newsData={allNewsData} />
          </aside>
        </div>
      </div>
    </div>
  )
}
