'use client'

import { useEffect, useRef, useState } from 'react'
import type { SentimentData } from '@/types/sentiment'

interface SentimentTooltipProps {
  hoveredSegment: string | null
  sentiment: SentimentData | null
  tooltipRef: React.RefObject<HTMLDivElement>
  sentimentBarRef: React.RefObject<HTMLDivElement>
  tooltipStyle: React.CSSProperties
  setTooltipStyle: (style: React.CSSProperties) => void
}

export default function SentimentTooltip({
  hoveredSegment,
  sentiment,
  tooltipRef,
  sentimentBarRef,
  tooltipStyle,
  setTooltipStyle,
}: SentimentTooltipProps) {
  useEffect(() => {
    if (!hoveredSegment || !sentiment || !sentimentBarRef.current) {
      return
    }

    const barRect = sentimentBarRef.current.getBoundingClientRect()
    const { positive, neutral, negative } = sentiment
    const total = positive + neutral + negative

    if (total === 0) return

    const percentages = {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    }

    // Calculate position based on which segment is hovered
    let left = 0
    if (hoveredSegment === 'negative') {
      left = percentages.negative / 2
    } else if (hoveredSegment === 'neutral') {
      left = percentages.negative + percentages.neutral / 2
    } else {
      left = percentages.negative + percentages.neutral + percentages.positive / 2
    }

    const tooltipLeft = barRect.left + (barRect.width * left) / 100
    const tooltipTop = barRect.top - 10

    setTooltipStyle({
      position: 'fixed',
      left: `${tooltipLeft}px`,
      top: `${tooltipTop}px`,
      transform: 'translateX(-50%)',
      zIndex: 9999,
    })
  }, [hoveredSegment, sentiment, sentimentBarRef, setTooltipStyle])

  if (!hoveredSegment || !sentiment) return null

  const { positive, neutral, negative } = sentiment
  const total = positive + neutral + negative

  if (total === 0) return null

  const percentages = {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  }

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'positive':
        return 'Positive'
      case 'negative':
        return 'Negative'
      case 'neutral':
        return 'Neutral'
      default:
        return segment
    }
  }

  const getSegmentValue = (segment: string) => {
    switch (segment) {
      case 'positive':
        return { count: positive, percentage: percentages.positive }
      case 'negative':
        return { count: negative, percentage: percentages.negative }
      case 'neutral':
        return { count: neutral, percentage: percentages.neutral }
      default:
        return { count: 0, percentage: 0 }
    }
  }

  const segmentValue = getSegmentValue(hoveredSegment)

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded px-3 py-2 shadow-lg pointer-events-none"
    >
      <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">
        {getSegmentLabel(hoveredSegment)}
      </div>
      <div className="text-xs text-[var(--text-secondary)]">
        {segmentValue.count} article{segmentValue.count !== 1 ? 's' : ''} ({segmentValue.percentage}%)
      </div>
    </div>
  )
}

