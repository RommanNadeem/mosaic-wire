import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for serverless function
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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
    // Fetch all topics and find by matching short ID
    const { data: topics, error } = await supabase
      .from('topic_snapshots')
      .select('*')
      .order('rank_score', { ascending: false })
      .limit(100) // Limit to recent topics

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

export default async function handler(req, res) {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract hash from query parameter or referer
    const hash = req.query.hash || (req.headers.referer ? new URL(req.headers.referer).hash : null)
    
    if (!hash || !hash.startsWith('#news/')) {
      return res.status(400).json({ error: 'Invalid hash format' })
    }

    // Parse slug from hash
    const slugWithId = hash.replace('#news/', '')
    const shortId = extractShortIdFromSlug(slugWithId)

    if (!shortId) {
      return res.status(400).json({ error: 'Could not extract ID from slug' })
    }

    // Find topic by short ID
    const topic = await findTopicByShortId(shortId)

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    // Transform topic to news item format (simplified)
    const title = topic.headline || 'MosaicBeat - A real-time digest of Pakistan\'s most consequential stories'
    const description = topic.summary || 'Pakistan\'s news, unmasked. Get AI-powered sentiment analysis of the latest news from multiple sources.'
    const category = topic.tag || null
    const origin = req.headers.host ? `https://${req.headers.host}` : 'https://mosaicbeat.com'
    const fullUrl = `${origin}${req.url}${hash}`

    // Process image URL
    const defaultImage = `${origin}/mosaicbeat-white.png`
    const rawImage = topic.image_url
    let imageUrl = defaultImage

    if (rawImage) {
      const processedUrl = processImageUrlForMetaTags(rawImage, origin)
      if (processedUrl) {
        imageUrl = processedUrl
      }
    }

    // Return meta tag data as JSON
    return res.status(200).json({
      title,
      description,
      image: imageUrl,
      url: fullUrl,
      category,
      type: 'article'
    })
  } catch (error) {
    console.error('Error in meta tags API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

