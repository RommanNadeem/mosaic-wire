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
 * Extract short_id from a UUID (last 2 blocks with hyphen)
 * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * Returns: xxxx-xxxxxxxxxxxx (17 chars, e.g. "b2ae-c2687c18c955")
 * This matches the database _topic_short_id() function format
 */
export function extractShortIdFromUUID(uuid: string): string {
  const parts = String(uuid).split('-')
  if (parts.length >= 2) {
    // Last 2 UUID blocks with hyphen: "b2ae-c2687c18c955"
    return `${parts[parts.length - 2]}-${parts[parts.length - 1]}`
  }
  // Fallback for non-UUID IDs
  return uuid.slice(-17)
}

/**
 * Convert title to URL-friendly slug and append short_id
 * Example: "headline-text--b2ae-c2687c18c955" (double hyphen separator)
 * The double hyphen separates the title slug from the short_id which contains a hyphen
 */
export function createSlug(title: string, id: string | number): string {
  const shortId = extractShortIdFromUUID(String(id))

  if (!title) {
    return `news--${shortId}`
  }
  
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 50)          // Limit length to leave room for short_id
    .replace(/-$/, '')         // Remove trailing hyphen
  
  // Use double hyphen as separator so we can identify where short_id starts
  return `${slug}--${shortId}`
}

/**
 * Extract short_id from slug (after double hyphen separator)
 * Format: "xxxx-xxxxxxxxxxxx" (17 chars, e.g. "b2ae-c2687c18c955")
 */
export function extractShortIdFromSlug(slug: string): string | null {
  if (!slug) return null
  
  // Find double hyphen separator
  const separatorIndex = slug.lastIndexOf('--')
  if (separatorIndex === -1) return null
  
  const shortId = slug.substring(separatorIndex + 2)
  
  // Validate: should be 17 chars (4 + hyphen + 12) matching UUID last 2 blocks
  if (shortId && shortId.length === 17 && /^[a-f0-9]{4}-[a-f0-9]{12}$/i.test(shortId)) {
    return shortId
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

