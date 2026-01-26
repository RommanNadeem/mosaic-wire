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
    const tooltipTop = barRect.top - 8

    setTooltipStyle({
      position: 'fixed',
      left: `${tooltipLeft}px`,
      top: `${tooltipTop}px`,
      transform: 'translateX(-50%) translateY(-100%)',
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
        return 'POSITIVE'
      case 'negative':
        return 'NEGATIVE'
      case 'neutral':
        return 'NEUTRAL'
      default:
        return segment.toUpperCase()
    }
  }

  const getSegmentDescription = (segment: string) => {
    switch (segment) {
      case 'positive':
        return 'Constructive or optimistic coverage'
      case 'negative':
        return 'Critical or concerning coverage'
      case 'neutral':
        return 'Factual or balanced reporting'
      default:
        return ''
    }
  }

  const getSegmentValue = (segment: string) => {
    switch (segment) {
      case 'positive':
        return percentages.positive
      case 'negative':
        return percentages.negative
      case 'neutral':
        return percentages.neutral
      default:
        return 0
    }
  }

  const percentage = getSegmentValue(hoveredSegment)
  const description = getSegmentDescription(hoveredSegment)

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="bg-black text-white px-3 py-2 rounded-sm pointer-events-none whitespace-nowrap z-[9999] shadow-xl border border-white/10"
    >
      <div className="text-[10px] font-bold tracking-wider mb-0.5">
        {getSegmentLabel(hoveredSegment)} {percentage}%
      </div>
      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-tight">
        {description}
      </div>
    </div>
  )
}

