'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createSlug } from '@/utils/routing/navigation'
import { getArchiveTopics } from '@/lib/supabase/queries'
import { formatTimeAgo, calculateTimeAgo } from '@/utils/formatting/time'
import { getCategoryTextColor } from '@/utils/category/category'

const PAGE_SIZE = 30

export interface ArchiveTopicRow {
  id?: string
  display_label?: string | null
  category_tag?: string | null
  first_seen_at?: string | null
  last_updated_at?: string | null
}

function normalizeArchiveTopic(row: any): { id: string; title: string; category: string | null; createdAt: string | null } {
  const id = String(row?.id ?? '')
  const title = row?.display_label ?? 'Untitled'
  const category = row?.category_tag ?? null
  const createdAt = row?.last_updated_at ?? row?.first_seen_at ?? null
  return { id, title, category, createdAt }
}

const ALL_TAB = 'All'

export default function ArchiveClient({
  initialTopics,
  categoryTags = [],
  pageSize = PAGE_SIZE,
}: {
  initialTopics: ArchiveTopicRow[]
  categoryTags?: string[]
  pageSize?: number
}) {
  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAB)
  const [tagSearch, setTagSearch] = useState('')
  const [topics, setTopics] = useState<ArchiveTopicRow[]>(initialTopics)
  const [offset, setOffset] = useState(initialTopics.length)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTopics.length >= pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filterForTag = selectedTag === ALL_TAB ? null : selectedTag

  const tagSearchLower = tagSearch.trim().toLowerCase()
  const visibleTags = tagSearchLower
    ? categoryTags.filter((tag) => tag.toLowerCase().includes(tagSearchLower))
    : categoryTags

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const next = await getArchiveTopics(pageSize, offset, filterForTag)
      if (next.length < pageSize) setHasMore(false)
      setTopics((prev) => [...prev, ...next])
      setOffset((prev) => prev + next.length)
    } catch (e) {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, offset, pageSize, filterForTag])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) loadMore()
      },
      { rootMargin: '200px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  useEffect(() => {
    if (selectedTag === ALL_TAB) {
      setTopics(initialTopics)
      setOffset(initialTopics.length)
      setHasMore(initialTopics.length >= pageSize)
      return
    }
    setTopics([])
    setOffset(0)
    setHasMore(true)
    setLoading(true)
    getArchiveTopics(pageSize, 0, selectedTag)
      .then((data) => {
        setTopics(data)
        setOffset(data.length)
        setHasMore(data.length >= pageSize)
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false))
  }, [selectedTag, initialTopics, pageSize])

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-8 lg:px-[60px] py-8 min-w-0">
      <header className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tight mb-2">
          Archive
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6">
          Browse all archived topics. Most recent first.
        </p>
      </header>

      {categoryTags.length > 0 && (
        <div className="mb-6">
          <label htmlFor="archive-tag-search" className="sr-only">
            Search tags
          </label>
          <input
            id="archive-tag-search"
            type="search"
            placeholder="Search tags…"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-2 text-sm border border-[var(--border-subtle)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] focus:border-transparent mb-3"
            aria-label="Search tags"
          />
          <nav className="flex flex-wrap gap-2" aria-label="Archive by category">
            <button
              type="button"
              onClick={() => setSelectedTag(ALL_TAB)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTag === ALL_TAB
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              All
            </button>
            {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTag === tag
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              {tag}
            </button>
          ))}
          </nav>
          {tagSearch.trim() && visibleTags.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] mt-2">No tags match &quot;{tagSearch.trim()}&quot;</p>
          )}
        </div>
      )}

      <ul className="space-y-2 list-none p-0 m-0">
        {topics.map((row) => {
          const { id, title, category, createdAt } = normalizeArchiveTopic(row)
          const slug = createSlug(title, id)
          const timeAgo = createdAt
            ? formatTimeAgo(calculateTimeAgo(createdAt))
            : ''
          return (
            <li key={id}>
              <Link
                href={`/news/${slug}`}
                className="flex flex-wrap items-center gap-2 sm:gap-3 py-3 px-0 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--text-muted)] transition-colors rounded-sm -mx-1 px-1"
              >
                <span className={`text-[10px] sm:text-xs font-semibold uppercase shrink-0 ${getCategoryTextColor(category)}`}>
                  {(category || 'News').toUpperCase()}
                </span>
                {timeAgo && (
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {timeAgo}
                  </span>
                )}
                <span className="text-sm sm:text-base font-medium text-[var(--text-primary)] line-clamp-2 flex-1 min-w-0 group-hover:underline">
                  {title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div ref={sentinelRef} className="h-4 flex items-center justify-center py-8" aria-hidden>
        {loading && (
          <span className="text-sm text-[var(--text-muted)]">Loading more…</span>
        )}
      </div>

      {!hasMore && topics.length > 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-4">
          You’ve reached the end of the archive.
        </p>
      )}

      {loading && topics.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-12">Loading…</p>
      )}

      {!loading && topics.length === 0 && (
        <p className="text-center text-[var(--text-secondary)] py-12">
          No archived topics yet.
        </p>
      )}
    </div>
  )
}
