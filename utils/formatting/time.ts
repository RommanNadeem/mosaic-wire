/**
 * Calculate time ago in minutes/hours from ISO timestamp
 */
export function calculateTimeAgo(dateTime: string | Date | null): number {
  if (!dateTime) return 0

  const now = new Date()
  const then = new Date(dateTime)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  return diffMins
}

/**
 * Format time ago as "Xm ago", "Xh ago", or "X days ago" (after 24 hours)
 */
export function formatTimeAgo(minutesAgo: number | string): string {
  if (typeof minutesAgo === 'string') {
    return minutesAgo
  }

  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`
  }
  const hours = Math.floor(minutesAgo / 60)
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return days === 1 ? '1 day ago' : `${days} days ago`
  }
  return `${hours}h ago`
}

/**
 * Format "Published X ago • Updated Y ago" for topic display.
 * Uses topic_created_at for Published and updated_at for Updated.
 */
export function formatPublishedUpdated(
  publishedAt: string | null | undefined,
  updatedAt: string | null | undefined
): string {
  const publishedMins = publishedAt ? calculateTimeAgo(publishedAt) : 0
  const updatedMins = updatedAt ? calculateTimeAgo(updatedAt) : 0
  const publishedStr = publishedAt ? `Published ${formatTimeAgo(publishedMins)}` : ''
  const updatedStr = updatedAt ? `Updated ${formatTimeAgo(updatedMins)}` : ''
  if (publishedStr && updatedStr) return `${publishedStr} • ${updatedStr}`
  if (publishedStr) return publishedStr
  if (updatedStr) return updatedStr
  return ''
}

