/**
 * Generate Next.js URL for a news item
 */
export function generateNewsUrl(title: string, id: string | number): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'
    const slug = createSlug(title, id)
    return `${baseUrl}/news/${slug}`
  }
  
  // Client-side: use current origin
  const slug = createSlug(title, id)
  return `${window.location.origin}/news/${slug}`
}

/**
 * Convert title to URL-friendly slug and append last 6 characters of ID
 */
export function createSlug(title: string, id: string | number): string {
  const idString = String(id)
  const shortId = idString.slice(-6) // Last 6 characters

  if (!title) {
    return `news-${shortId}`
  }
  
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 60)          // Limit length to leave room for ID
    .replace(/-$/, '')         // Remove trailing hyphen
  
  return `${slug}-${shortId}`
}

/**
 * Extract short ID (last 6 chars) from slug
 */
export function extractShortIdFromSlug(slug: string): string | null {
  if (!slug) return null
  
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  
  if (lastPart && lastPart.length <= 6 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
    return lastPart
  }
  
  return null
}

/**
 * Parse slug to get news identifier
 */
export function parseSlug(slug: string): { id: string | null; shortId: string | null } {
  if (!slug) return { id: null, shortId: null }
  
  const shortId = extractShortIdFromSlug(slug)
  
  return {
    id: null, // Will need to match by shortId
    shortId,
  }
}

