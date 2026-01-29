'use client'

import type { NewsItem } from '@/types/news'
import { useImage } from '@/hooks/useImage'
import ShareButton from '@/components/shared/ShareButton'
import SourceList from '@/components/news/SourceList'
import SentimentBar from '@/components/sentiment/SentimentBar'
import { formatTimeAgo } from '@/utils/formatting/time'
import { capitalizeFirst, getCategoryColor } from '@/utils/category/category'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface NewsDetailModalProps {
  expandedNewsId: string | null
  newsData: NewsItem[]
  onClose: () => void
  onShare?: (url: string) => void
}

export default function NewsDetailModal({
  expandedNewsId,
  newsData,
  onClose,
  onShare,
}: NewsDetailModalProps) {
  const newsItem = expandedNewsId
    ? newsData.find((item) => String(item.id) === String(expandedNewsId))
    : null

  const { imageUrl, imageError } = useImage(newsItem?.image || null)

  if (!newsItem) return null

  return (
    <Dialog open={!!expandedNewsId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{newsItem.title}</DialogTitle>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-xs font-semibold uppercase text-white ${getCategoryColor(newsItem.category)}`}>
                  {newsItem.category ? capitalizeFirst(newsItem.category) : 'UNCATEGORIZED'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {typeof newsItem.timeAgo === 'string'
                    ? newsItem.timeAgo
                    : formatTimeAgo(newsItem.timeAgo)}
                </span>
              </div>
            </div>
            <ShareButton newsItem={newsItem} onShare={onShare} />
          </div>
        </DialogHeader>

        {/* Image */}
        {imageUrl && !imageError && (
          <div className="w-full h-64 sm:h-96 bg-[var(--bg-surface)] overflow-hidden rounded-lg mb-4">
            <img
              src={imageUrl}
              alt={newsItem.title || 'News image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Sentiment Bar */}
        {newsItem.sentiment && (
          <div className="mb-4 w-1/2">
            <SentimentBar sentiment={newsItem.sentiment} height="h-4" />
          </div>
        )}

        {/* Summary */}
        {newsItem.summary && (
          <DialogDescription className="text-base text-[var(--text-secondary)] mb-6">
            {newsItem.summary}
          </DialogDescription>
        )}

        {/* Sources */}
        {newsItem.sources && newsItem.sources.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Sources ({newsItem.sources.length})
            </h3>
            <SourceList sources={newsItem.sources} showAll={true} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
