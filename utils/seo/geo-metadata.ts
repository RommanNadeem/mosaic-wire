/**
 * Geographic SEO (GEO) metadata utilities
 * Optimizes content for location-based search with Pakistan focus
 */

export interface GeoMetadata {
  region: string
  placename: string
  position: {
    latitude: number
    longitude: number
  }
  countryCode: string
}

/**
 * Default Pakistan geographic metadata
 */
export const PAKISTAN_GEO: GeoMetadata = {
  region: 'PK', // ISO 3166-1 alpha-2 country code
  placename: 'Pakistan',
  position: {
    latitude: 30.3753, // Center of Pakistan
    longitude: 69.3451,
  },
  countryCode: 'PK',
}

/**
 * Generate geographic meta tags for HTML head
 */
export function generateGeoMetaTags(geo: GeoMetadata = PAKISTAN_GEO) {
  return {
    'geo.region': geo.region,
    'geo.placename': geo.placename,
    'geo.position': `${geo.position.latitude};${geo.position.longitude}`,
    'ICBM': `${geo.position.latitude}, ${geo.position.longitude}`,
  }
}

/**
 * Generate geographic Open Graph tags
 */
export function generateGeoOGTags(geo: GeoMetadata = PAKISTAN_GEO) {
  return {
    'og:locale': 'en_PK', // English (Pakistan)
    'og:locale:alternate': 'ur_PK', // Urdu (Pakistan) - if supporting Urdu
  }
}

/**
 * Generate content-location header value
 */
export function generateContentLocation(geo: GeoMetadata = PAKISTAN_GEO): string {
  return `${geo.placename} (${geo.region})`
}

/**
 * Get geographic context for news articles
 * Can be extended to extract location from article content
 */
export function getArticleGeoContext(article?: { category?: string | null; title?: string }): GeoMetadata {
  // Default to Pakistan, but could be enhanced to extract specific cities/regions
  // from article content or category
  return PAKISTAN_GEO
}

