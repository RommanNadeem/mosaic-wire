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
 * Format time ago as "Xh ago" or "Xm ago"
 */
export function formatTimeAgo(minutesAgo: number | string): string {
  if (typeof minutesAgo === 'string') {
    return minutesAgo
  }

  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`
  }
  const hours = Math.floor(minutesAgo / 60)
  return `${hours}h ago`
}

