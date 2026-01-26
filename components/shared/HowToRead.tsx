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
    <div className="p-4 border border-[var(--border-subtle)]">
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
               <div className="mt-4 space-y-4 text-xs text-[var(--text-secondary)]">
                 <div>
                   <h3 className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-tight">
                     Sentiment Spectrum
                   </h3>
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-positive)]"></div>
                       <span><strong className="text-[var(--text-primary)]">POSITIVE:</strong> Constructive or optimistic coverage</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-neutral)]"></div>
                       <span><strong className="text-[var(--text-primary)]">NEUTRAL:</strong> Factual or balanced reporting</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-negative)]"></div>
                       <span><strong className="text-[var(--text-primary)]">NEGATIVE:</strong> Critical or concerning coverage</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="font-bold text-[var(--text-primary)] mb-1 uppercase tracking-tight">
                     The Sentiment Bar
                   </h3>
                   <p className="leading-relaxed">
                     Visualizes the breakdown of viewpoints across all analyzed sources. Hover over any segment to see the exact percentage of coverage for that sentiment.
                   </p>
                 </div>

                 <div>
                   <h3 className="font-bold text-[var(--text-primary)] mb-1 uppercase tracking-tight">
                     Source Verification
                   </h3>
                   <p className="leading-relaxed">
                     Every story is aggregated from multiple verified outlets. Click any source icon or headline to read the original full-length article.
                   </p>
                 </div>
               </div>
             )}
    </div>
  )
}
