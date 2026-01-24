/**
 * Vercel Edge Function for injecting meta tags for social media crawlers
 * This function intercepts requests from crawlers, fetches topic data from Supabase,
 * and returns HTML with correct meta tags injected.
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for Edge Function
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Check if request is from a social media crawler
 */
function isCrawler(userAgent) {
  if (!userAgent) return false
  
  const crawlerPatterns = [
    'facebookexternalhit',
    'Twitterbot',
    'TelegramBot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'SkypeUriPreview',
    'Discordbot',
    'Applebot',
    'Googlebot',
    'bingbot',
    'Slurp',
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot',
    'Sogou',
    'Exabot',
    'facebot',
    'ia_archiver'
  ]
  
  const ua = userAgent.toLowerCase()
  return crawlerPatterns.some(pattern => ua.includes(pattern.toLowerCase()))
}

/**
 * Extract short ID from slug
 */
function extractShortIdFromSlug(slug) {
  if (!slug) return null
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  if (lastPart && lastPart.length <= 6 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
    return lastPart
  }
  return null
}

/**
 * Process image URL for meta tags
 * Converts private/authenticated Supabase Storage URLs to public format
 */
function processImageUrlForMetaTags(imageUrl, origin) {
  if (!imageUrl) return null

  // Supabase Storage URL patterns
  const supabaseStoragePattern = /(https?:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/)(sign|authenticated|public)\/([^\/]+)\/(.+)$/
  const match = imageUrl.match(supabaseStoragePattern)

  if (match) {
    const [, baseUrl, accessType] = match
    // Convert private/authenticated to public format
    if (accessType === 'sign' || accessType === 'authenticated') {
      return imageUrl.replace(`/${accessType}/`, '/public/')
    }
    return imageUrl
  }

  // Check if URL is absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // Relative path, make it absolute
  return `${origin}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
}

/**
 * Find topic by short ID
 */
async function findTopicByShortId(shortId) {
  if (!supabase || !shortId) return null

  try {
    // Fetch recent topics and find by matching short ID
    const { data: topics, error } = await supabase
      .from('topic_snapshots')
      .select('*')
      .order('rank_score', { ascending: false })
      .limit(200) // Limit to recent topics for performance

    if (error) {
      console.error('Error fetching topics:', error)
      return null
    }

    if (!topics || topics.length === 0) return null

    // Find topic where topic_id ends with shortId
    const topic = topics.find(t => {
      const topicIdString = String(t.topic_id || t.id || '')
      const topicShortId = topicIdString.slice(-6)
      return topicShortId === shortId
    })

    return topic || null
  } catch (error) {
    console.error('Error in findTopicByShortId:', error)
    return null
  }
}

/**
 * Inject meta tags into HTML
 */
function injectMetaTags(html, metaData) {
  const {
    title,
    description,
    image,
    url,
    category
  } = metaData

  // Replace title tag
  html = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`
  )

  // Helper to update or add meta tag
  const updateMetaTag = (property, content, isProperty = true) => {
    if (!content) return
    
    const attr = isProperty ? 'property' : 'name'
    const regex = new RegExp(`<meta\\s+${attr}="${escapeRegex(property)}"[^>]*>`, 'i')
    const metaTag = `<meta ${attr}="${property}" content="${escapeHtml(content)}" />`
    
    if (regex.test(html)) {
      html = html.replace(regex, metaTag)
    } else {
      // Insert before closing head tag
      html = html.replace('</head>', `  ${metaTag}\n</head>`)
    }
  }

  // Update Open Graph tags
  updateMetaTag('og:title', title)
  updateMetaTag('og:description', description)
  updateMetaTag('og:image', image)
  updateMetaTag('og:image:url', image)
  updateMetaTag('og:image:type', 'image/jpeg')
  updateMetaTag('og:image:width', '1200')
  updateMetaTag('og:image:height', '630')
  updateMetaTag('og:url', url)
  updateMetaTag('og:type', 'article')
  updateMetaTag('og:site_name', 'MosaicBeat')

  // Update Twitter tags
  updateMetaTag('twitter:card', 'summary_large_image', false)
  updateMetaTag('twitter:title', title, false)
  updateMetaTag('twitter:description', description, false)
  updateMetaTag('twitter:image', image, false)
  updateMetaTag('twitter:url', url, false)

  // Update standard meta tags
  updateMetaTag('description', description, false)
  
  if (category) {
    updateMetaTag('og:article:tag', category)
    updateMetaTag('keywords', `${category}, Pakistan news, news aggregator, sentiment analysis`, false)
  }

  return html
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Escape regex special characters
 */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Fetch the base HTML file
 */
async function fetchBaseHtml(origin) {
  try {
    // Try to fetch from origin (for production) or use default HTML template
    const response = await fetch(`${origin}/index.html`)
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.error('Error fetching base HTML:', error)
  }
  
  // Fallback: return minimal HTML template
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/favicon.jpeg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MosaicBeat - A real-time digest of Pakistan's most consequential stories</title>
    <meta name="description" content="Pakistan's news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources." />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="MosaicBeat - A real-time digest of Pakistan's most consequential stories" />
    <meta property="og:description" content="Pakistan's news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources." />
    <meta property="og:image" content="" />
    <meta property="og:site_name" content="MosaicBeat" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="MosaicBeat - A real-time digest of Pakistan's most consequential stories" />
    <meta name="twitter:description" content="Pakistan's news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources." />
    <meta name="twitter:image" content="" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
}

/**
 * Edge Function handler
 */
export default async function handler(req) {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const url = new URL(req.url)
    const userAgent = req.headers.get('user-agent') || ''
    const referer = req.headers.get('referer') || ''
    
    // Extract hash from various sources:
    // 1. Query parameter (from middleware rewrite)
    // 2. Referer header (some crawlers send full URL here)
    // 3. URL hash (if present)
    let hash = url.searchParams.get('hash')
    
    if (!hash && referer) {
      try {
        const refererUrl = new URL(referer)
        hash = refererUrl.hash || refererUrl.searchParams.get('hash')
      } catch (e) {
        // Invalid referer URL, try to extract hash manually
        const hashMatch = referer.match(/#[^?&]+/)
        if (hashMatch) {
          hash = hashMatch[0]
        }
      }
    }
    
    if (!hash) {
      hash = url.hash
    }
    
    // Ensure hash starts with #
    if (hash && !hash.startsWith('#')) {
      hash = '#' + hash
    }

    // Check if this is a crawler request
    const isCrawlerRequest = isCrawler(userAgent)
    
    // If not a crawler or no hash, return normal response (let SPA handle it)
    if (!isCrawlerRequest || !hash || !hash.startsWith('#news/')) {
      // Fetch and return base HTML
      const origin = `${url.protocol}//${url.host}`
      const html = await fetchBaseHtml(origin)
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // Parse slug from hash
    const slugWithId = hash.replace('#news/', '')
    const shortId = extractShortIdFromSlug(slugWithId)

    if (!shortId) {
      // No valid shortId, return default HTML
      const origin = `${url.protocol}//${url.host}`
      const html = await fetchBaseHtml(origin)
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // Find topic by short ID
    const topic = await findTopicByShortId(shortId)

    // Get origin for absolute URLs
    const origin = `${url.protocol}//${url.host}`
    const fullUrl = `${origin}${url.pathname}${hash}`

    // Prepare meta data
    const title = topic?.headline || 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories'
    const description = topic?.summary || 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.'
    const category = topic?.tag || null
    
    // Process image URL
    const defaultImage = `${origin}/mosaicbeat-white.png`
    const rawImage = topic?.image_url
    let imageUrl = defaultImage
    
    if (rawImage) {
      const processedUrl = processImageUrlForMetaTags(rawImage, origin)
      if (processedUrl) {
        imageUrl = processedUrl
      }
    }

    // Fetch base HTML and inject meta tags
    const baseHtml = await fetchBaseHtml(origin)
    const htmlWithMetaTags = injectMetaTags(baseHtml, {
      title,
      description,
      image: imageUrl,
      url: fullUrl,
      category
    })

    return new Response(htmlWithMetaTags, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error in meta Edge Function:', error)
    
    // Return default HTML on error
    try {
      const url = new URL(req.url)
      const origin = `${url.protocol}//${url.host}`
      const html = await fetchBaseHtml(origin)
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } catch (fallbackError) {
      return new Response('Internal server error', { status: 500 })
    }
  }
}

// Export config for Vercel Edge Function
export const config = {
  runtime: 'edge',
}

