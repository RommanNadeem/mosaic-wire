'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { NewsItem } from '@/types/news'
import FeaturedNews from '@/components/news/FeaturedNews'
import BigUpdates from '@/components/news/BigUpdates'
import MoreStories from '@/components/news/MoreStories'
import BiasDistribution from '@/components/news/BiasDistribution'
import LatestStories from '@/components/news/LatestStories'
import WhatWeAnalyze from '@/components/news/WhatWeAnalyze'
import HowToRead from '@/components/shared/HowToRead'
import NewsDetailModal from '@/components/news/NewsDetailModal'

interface HomePageClientProps {
  initialNewsData: NewsItem[]
  usingSampleData: boolean
}

function HomePageContent({ initialNewsData, usingSampleData }: HomePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newsData] = useState<NewsItem[]>(initialNewsData)
  const [highlightedNewsId, setHighlightedNewsId] = useState<string | null>(null)
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const hasInitializedFromQuery = useRef(false)

  // Handle query params for modal on initial load
  useEffect(() => {
    if (newsData.length === 0) return

    const modalId = searchParams.get('modal')
    if (modalId) {
      const newsItem = newsData.find((item) => String(item.id) === String(modalId))
      if (newsItem) {
        const isMobile = window.innerWidth < 640 || ('ontouchstart' in window || navigator.maxTouchPoints > 0)
        
        if (!isMobile) {
          setExpandedNewsId(String(newsItem.id))
        } else {
          setHighlightedNewsId(String(newsItem.id))
          setExpandedNewsId(null)
          setTimeout(() => {
            const element = document.getElementById(`news-${String(newsItem.id)}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 300)
        }
        hasInitializedFromQuery.current = true
      }
    } else {
      hasInitializedFromQuery.current = true
    }
  }, [newsData, searchParams])

  // Update URL when modal opens/closes
  useEffect(() => {
    if (!hasInitializedFromQuery.current) return

    const params = new URLSearchParams(searchParams.toString())
    if (expandedNewsId) {
      params.set('modal', expandedNewsId)
    } else {
      params.delete('modal')
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [expandedNewsId, router, searchParams])

  const handleTitleClick = (newsId: string) => {
    if (highlightedNewsId === String(newsId)) {
      setHighlightedNewsId(null)
      setTimeout(() => {
        setExpandedNewsId(String(newsId))
      }, 100)
    } else {
      setExpandedNewsId(String(newsId))
    }
  }

  const handleCloseHighlight = () => {
    setHighlightedNewsId(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleMainClick = (e: React.MouseEvent) => {
    if (!highlightedNewsId) return
    const highlightedElement = document.getElementById(`news-${highlightedNewsId}`)
    if (highlightedElement && highlightedElement.contains(e.target as Node)) {
      return
    }
    if ((e.target as HTMLElement).closest('header') || (e.target as HTMLElement).closest('footer')) {
      return
    }
    handleCloseHighlight()
  }

  return (
    <>
      {usingSampleData && (
        <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-[var(--text-secondary)]">
              ⚠️ Using sample data. Configure Supabase to use real data.
            </p>
          </div>
        </div>
      )}
      <main
        className="max-w-[90rem] mx-auto px-[40px] py-8
        flex flex-col lg:flex-row lg:items-start
        gap-6 lg:gap-8 w-full"
        onClick={handleMainClick}
      >
        {/* Left side - Main Content */}
        <div className="order-2 lg:order-1 flex-1 lg:w-[75%] flex flex-col gap-6 lg:gap-8">
          {/* Featured News - Highest Priority Topic */}
          {newsData.length > 0 && (
            <FeaturedNews
              newsItem={newsData[0]}
              onTitleClick={handleTitleClick}
              onShare={() => {}}
            />
          )}

          {/* Big Updates - Next 5 Highest Priority Topics */}
          {newsData.length > 1 && (
            <BigUpdates
              newsItems={newsData.slice(1, 6)}
              onTitleClick={handleTitleClick}
              onShare={() => {}}
            />
          )}

          {/* More Stories - Remaining Topics */}
          {newsData.length > 6 && (
            <MoreStories
              newsItems={newsData.slice(6)}
              highlightedNewsId={highlightedNewsId}
              expandedNewsId={expandedNewsId}
              onTitleClick={handleTitleClick}
              onCloseHighlight={handleCloseHighlight}
              onShare={() => {}}
            />
          )}
        </div>

        {/* Right side - Sidebar */}
        <aside
          className={`order-1 lg:order-2 lg:w-[25%] lg:flex-shrink-0 flex flex-col space-y-4 transition-all lg:sticky lg:top-8 lg:h-fit ${
            highlightedNewsId || expandedNewsId ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          <BiasDistribution newsData={newsData} />
          <WhatWeAnalyze newsData={newsData} />
          <HowToRead
            newsData={newsData}
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
          <LatestStories newsData={newsData} />
        </aside>

        {/* Expanded News Modal */}
        <NewsDetailModal
          expandedNewsId={expandedNewsId}
          newsData={newsData}
          onClose={() => setExpandedNewsId(null)}
          onShare={() => {}}
        />
      </main>
    </>
  )
}

export default function HomePageClient({ initialNewsData, usingSampleData }: HomePageClientProps) {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HomePageContent initialNewsData={initialNewsData} usingSampleData={usingSampleData} />
    </Suspense>
  )
}

