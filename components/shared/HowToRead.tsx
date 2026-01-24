'use client'

import { useState } from 'react'
import type { NewsItem } from '@/types/news'

interface HowToReadProps {
  newsData: NewsItem[]
  isExpanded?: boolean
  onToggle?: () => void
}

export default function HowToRead({ newsData, isExpanded, onToggle }: HowToReadProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          How to Read
        </h2>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 text-xs text-[var(--text-secondary)]">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Sentiment Colors
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-positive)]"></div>
                <span>Positive sentiment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-neutral)]"></div>
                <span>Neutral sentiment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-negative)]"></div>
                <span>Negative sentiment</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Reading the Bars
            </h3>
            <p>
              The sentiment bars show the distribution of positive, neutral, and negative
              articles across all sources. Click on a segment to filter sources by that
              sentiment.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Sources
            </h3>
            <p>
              Each source is color-coded by sentiment. Click on any headline to read the
              full article from that source.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
