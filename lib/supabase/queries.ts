import { supabase, isSupabaseConfigured } from './client'
import { createServerClient } from './server'

/**
 * Fetch topics from topic_snapshots table (client-side)
 * Uses trending_score for ordering (precomputed snapshots)
 */
export async function getLatestTopics(limit: number | null = null) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    let query = supabase
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
    
    if (limit !== null && limit !== undefined) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getLatestTopics:', error)
    return []
  }
}

/**
 * Fetch topics from topic_snapshots table (server-side)
 * Uses trending_score for ordering (precomputed snapshots)
 */
export async function getLatestTopicsServer(limit: number | null = null) {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    let query = supabaseClient
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
    
    if (limit !== null && limit !== undefined) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getLatestTopicsServer:', error)
    return []
  }
}

/**
 * Get a single topic by slug (extracts short ID from slug)
 * Used for server-side routing and meta tag generation
 */
export async function getTopicBySlug(slug: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !slug) {
    return null
  }

  try {
    // Extract short ID from slug (last part after last hyphen)
    const parts = slug.split('-')
    const shortId = parts[parts.length - 1]
    
    if (!shortId || shortId.length > 6) {
      return null
    }

    return await getTopicByShortIdServer(shortId)
  } catch (error) {
    console.error('Error in getTopicBySlug:', error)
    return null
  }
}

/**
 * Get a single topic by short ID (last 6 characters of topic_id)
 * Used for server-side meta tag generation
 */
export async function getTopicByShortIdServer(shortId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !shortId) {
    return null
  }

  try {
    const { data: topics, error } = await supabaseClient
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Error fetching topics:', error)
      return null
    }

    if (!topics || topics.length === 0) return null

    const topic = topics.find(t => {
      const topicIdString = String(t.topic_id || t.id || '')
      const topicShortId = topicIdString.slice(-6)
      return topicShortId === shortId
    })

    return topic || null
  } catch (error) {
    console.error('Error in getTopicByShortIdServer:', error)
    return null
  }
}

/**
 * Fetch articles for a specific topic from article_snapshots table (server-side)
 */
export async function getArticlesForTopicServer(topicId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    const { data, error } = await supabaseClient
      .from('article_snapshots')
      .select('*')
      .contains('topic_ids', [topicId])
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles for topic:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArticlesForTopicServer:', error)
    return []
  }
}

/**
 * Fetch articles for a specific topic from article_snapshots table (client-side)
 */
export async function getArticlesForTopic(topicId: string) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('article_snapshots')
      .select('*')
      .contains('topic_ids', [topicId])
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles for topic:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArticlesForTopic:', error)
    return []
  }
}

/**
 * Get topics by category/tag
 */
export async function getTopicsByCategory(category: string) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('topic_snapshots')
      .select('*')
      .eq('tag', category)
      .order('trending_score', { ascending: false })

    if (error) {
      console.error('Error fetching topics by category:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getTopicsByCategory:', error)
    return []
  }
}

