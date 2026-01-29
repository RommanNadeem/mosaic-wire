'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { NewsItem } from '@/types/news'
import { createSlug } from '@/utils/routing/navigation'
import FeaturedNews from '@/components/news/FeaturedNews'

const BigUpdates = dynamic(() => import('@/components/news/BigUpdates'), {
  loading: () => <div className="min-h-[200px] animate-pulse rounded-lg bg-[var(--bg-surface)]" />,
  ssr: true,
})

const MoreStories = dynamic(() => import('@/components/news/MoreStories'), {
  loading: () => <div className="min-h-[120px] animate-pulse rounded-lg bg-[var(--bg-surface)]" />,
  ssr: true,
})

const PakistanMood = dynamic(() => import('@/components/news/PakistanMood'), {
  loading: () => <div className="min-h-[180px] animate-pulse rounded bg-[var(--bg-surface)]" />,
  ssr: true,
})

const LatestStories = dynamic(() => import('@/components/news/LatestStories'), {
  loading: () => <div className="min-h-[200px] animate-pulse rounded bg-[var(--bg-surface)]" />,
  ssr: true,
})

const HowToRead = dynamic(() => import('@/components/shared/HowToRead'), {
  loading: () => <div className="min-h-[80px] animate-pulse rounded bg-[var(--bg-surface)]" />,
  ssr: true,
})

interface HomePageClientProps {
  initialNewsData: NewsItem[]
  usingSampleData: boolean
}

function HomePageContent({ initialNewsData, usingSampleData }: HomePageClientProps) {
  const router = useRouter()
  const [newsData] = useState<NewsItem[]>(initialNewsData)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  const handleTitleClick = (newsId: string) => {
    const newsItem = newsData.find((item) => String(item.id) === String(newsId))
    if (newsItem && newsItem.title) {
      const slug = createSlug(newsItem.title, newsId)
      router.push(`/news/${slug}`)
    }
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
        className="max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-[60px] py-8
        flex flex-col xl:flex-row lg:items-start
        gap-6 lg:gap-8 w-full min-w-0"
      >
        {/* Left side - Main Content */}
        <div className="order-2 xl:order-1 flex-1 xl:w-[75%] min-w-0 flex flex-col gap-6 lg:gap-8">
          {/* Featured News - Highest Trending Score Topic */}
          {newsData.length > 0 && (
            <FeaturedNews
              newsItem={newsData[0]}
              onTitleClick={handleTitleClick}
              onShare={() => {}}
            />
          )}

          {/* Big Updates - Next 5 Highest Trending Score Topics */}
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
              onTitleClick={handleTitleClick}
              onShare={() => {}}
            />
          )}
        </div>

        {/* Right side - Sidebar */}
        <aside
          className="order-1 xl:order-2 xl:w-[25%] lg:flex-shrink-0 min-w-0 flex flex-col space-y-4 transition-all xl:sticky xl:bottom-8 xl:self-end"
        >
          <div className="hidden md:block">
            <PakistanMood newsData={newsData} />
          </div>
          <HowToRead
            newsData={newsData}
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
          <div className="hidden md:block">
            <LatestStories newsData={newsData} />
          </div>
        </aside>
      </main>
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4" aria-live="polite">
      <p className="text-[var(--text-secondary)] text-lg sm:text-xl font-medium mb-8 text-center">
        Reading between the headlines...
      </p>
      <div className="w-full max-w-sm space-y-3">
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div className="moodline-loading-bar h-full rounded bg-[var(--accent-negative)]" style={{ animationDelay: '0s' }} />
        </div>
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div className="moodline-loading-bar h-full rounded bg-[var(--accent-neutral)]" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="h-2 w-full rounded overflow-hidden bg-[var(--bg-surface)]">
          <div className="moodline-loading-bar h-full rounded bg-[var(--accent-positive)]" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

export default function HomePageClient({ initialNewsData, usingSampleData }: HomePageClientProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent initialNewsData={initialNewsData} usingSampleData={usingSampleData} />
    </Suspense>
  )
}

