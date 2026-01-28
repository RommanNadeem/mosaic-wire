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
 * Falls back to topics table if not found in topic_snapshots
 */
export async function getTopicByShortIdServer(shortId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !shortId) {
    return null
  }

  try {
    // First, try to find in topic_snapshots (current/active topics)
    const { data: snapshotTopics, error: snapshotError } = await supabaseClient
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(200)

    if (!snapshotError && snapshotTopics && snapshotTopics.length > 0) {
      const topic = snapshotTopics.find(t => {
        const topicIdString = String(t.topic_id || t.id || '')
        const topicShortId = topicIdString.slice(-6)
        return topicShortId === shortId
      })

      if (topic) {
        return topic
      }
    }

    // If not found in snapshots, fallback to topics table
    // This handles cases where a topic was shared but is no longer in snapshots
    const { data: allTopics, error: topicsError } = await supabaseClient
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000) // Limit to recent topics for performance

    if (topicsError) {
      console.error('Error fetching topics from topics table:', topicsError)
      // Don't return null here, as we might have found it in snapshots
      // Only return null if we've exhausted both options
      return null
    }

    if (!allTopics || allTopics.length === 0) {
      return null
    }

    // Find topic where id ends with shortId
    const topicFromTable = allTopics.find(t => {
      const topicIdString = String(t.id || t.topic_id || '')
      const topicShortId = topicIdString.slice(-6)
      return topicShortId === shortId
    })

    if (topicFromTable) {
      // Transform the topic from topics table to match topic_snapshots format
      // The transformer function should handle both formats, but we ensure compatibility
      return {
        ...topicFromTable,
        topic_id: topicFromTable.id || topicFromTable.topic_id,
        // Map common fields that might differ
        headline: topicFromTable.headline || topicFromTable.topic_name || null,
        summary: topicFromTable.summary || topicFromTable.ai_summary || null,
        tag: topicFromTable.tag || topicFromTable.category || null,
        image_url: topicFromTable.image_url || topicFromTable.image || null,
        // Set defaults for fields that might not exist in topics table
        article_count: topicFromTable.article_count || 0,
        source_count: topicFromTable.source_count || 0,
        recent_articles_count: topicFromTable.recent_articles_count || 0,
        updated_at: topicFromTable.updated_at || topicFromTable.created_at || new Date().toISOString(),
        topic_created_at: topicFromTable.created_at || topicFromTable.topic_created_at || null,
      }
    }

    return null
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

