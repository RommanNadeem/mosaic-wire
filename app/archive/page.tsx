import { getArchiveTopicsServer, getArchiveCategoryTagsServer } from '@/lib/supabase/queries'
import ArchiveClient from './ArchiveClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Archive - MosaicBeat',
  description: 'Browse all archived news topics. Real-time analysis of how Pakistan\'s news is told.',
}

const ARCHIVE_PAGE_SIZE = 30

export default async function ArchivePage() {
  const [initialTopics, categoryTags] = await Promise.all([
    getArchiveTopicsServer(ARCHIVE_PAGE_SIZE, 0),
    getArchiveCategoryTagsServer(),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <ArchiveClient
        initialTopics={initialTopics}
        categoryTags={categoryTags}
        pageSize={ARCHIVE_PAGE_SIZE}
      />
    </div>
  )
}
