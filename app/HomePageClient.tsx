'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import type { NewsItem } from '@/types/news'
import { createSlug } from '@/utils/routing/navigation'
import FeaturedNews from '@/components/news/FeaturedNews'
import BigUpdates from '@/components/news/BigUpdates'
import MoreStories from '@/components/news/MoreStories'
import PakistanMood from '@/components/news/PakistanMood'
import LatestStories from '@/components/news/LatestStories'
import HowToRead from '@/components/shared/HowToRead'

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
        gap-6 lg:gap-8 w-full"
      >
        {/* Left side - Main Content */}
        <div className="order-2 xl:order-1 flex-1 xl:w-[75%] flex flex-col gap-6 lg:gap-8">
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
          className="order-1 xl:order-2 xl:w-[25%] lg:flex-shrink-0 flex flex-col space-y-4 transition-all xl:sticky xl:bottom-8 xl:self-end"
        >
          <PakistanMood newsData={newsData} />
          <HowToRead
            newsData={newsData}
            isExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          />
          <LatestStories newsData={newsData} />
        </aside>
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

