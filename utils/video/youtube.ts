/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/v/ID
 */
export function getYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    // youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return shortMatch[1]

    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtube.com' || host === 'youtu.be') {
      // ?v=VIDEO_ID
      const v = parsed.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v
      // /embed/VIDEO_ID or /v/VIDEO_ID
      const pathMatch = parsed.pathname.match(/\/(?:embed|v)\/([a-zA-Z0-9_-]{11})/)
      if (pathMatch) return pathMatch[1]
    }
  } catch {
    // Invalid URL
  }
  return null
}

/**
 * Return YouTube embed URL for iframe src, or null if not a valid YouTube URL.
 */
export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = getYoutubeVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
}
