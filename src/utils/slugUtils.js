/**
 * Utility functions for creating and parsing URL slugs with news IDs
 */

/**
 * Convert title to URL-friendly slug and append last 6 characters of ID
 * @param {string} title - The news headline
 * @param {number|string} id - The news ID
 * @returns {string} - URL-friendly slug with short ID
 */
export function createSlug(title, id) {
  if (!title) {
    const idString = String(id);
    const shortId = idString.slice(-6); // Last 6 characters
    return `news-${shortId}`;
  }
  
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .substring(0, 60)          // Limit length to leave room for ID
    .replace(/-$/, '');        // Remove trailing hyphen
  
  const idString = String(id);
  const shortId = idString.slice(-6); // Last 6 characters of ID
  
  return `${slug}-${shortId}`;
}

/**
 * Extract short ID (last 6 chars) from slug
 * @param {string} slug - The slug string
 * @returns {string|null} - The short ID (last 6 chars) or null if not found
 */
export function extractShortIdFromSlug(slug) {
  if (!slug) return null;
  
  // Extract last part after final hyphen (should be 6 chars or less)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Return last part if it looks like an ID (alphanumeric, 6 chars or less)
  if (lastPart && lastPart.length <= 6 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

/**
 * Parse hash to get news identifier
 * Supports both old (#news-123) and new (#news/slug-shortId) formats
 * @param {string} hash - The URL hash
 * @returns {Object} - { id: number|null, shortId: string|null, slug: string|null }
 */
export function parseNewsHash(hash) {
  if (!hash) return { id: null, shortId: null, slug: null };
  
  // Old format: #news-1234567890
  if (hash.startsWith('#news-')) {
    const idString = hash.replace('#news-', '');
    const id = parseInt(idString, 10);
    return { 
      id: isNaN(id) ? null : id, 
      shortId: idString.slice(-6), // Last 6 chars for matching
      slug: null 
    };
  }
  
  // New format: #news/slug-shortId
  if (hash.startsWith('#news/')) {
    const slugWithId = hash.replace('#news/', '');
    const shortId = extractShortIdFromSlug(slugWithId);
    
    return { 
      id: null,  // Will need to match by shortId
      shortId, 
      slug: slugWithId 
    };
  }
  
  return { id: null, shortId: null, slug: null };
}

/**
 * Find news item by ID or short ID
 * @param {Array} newsData - Array of news items
 * @param {number|null} id - Full ID to match
 * @param {string|null} shortId - Short ID (last 6 chars) to match
 * @returns {Object|null} - Matching news item or null
 */
export function findNewsItem(newsData, id, shortId) {
  if (!newsData || newsData.length === 0) return null;
  
  // First try full ID match (most reliable)
  if (id !== null) {
    const match = newsData.find(item => String(item.id) === String(id));
    if (match) return match;
  }
  
  // Then try short ID match (last 6 characters)
  if (shortId) {
    const match = newsData.find(item => {
      const itemIdString = String(item.id);
      const itemShortId = itemIdString.slice(-6);
      return itemShortId === shortId;
    });
    if (match) return match;
  }
  
  return null;
}

