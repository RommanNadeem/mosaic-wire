import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Fetch topics from topic_snapshots table
 * Uses rank_score for ordering (precomputed snapshots)
 * @param {number|null} limit - Maximum number of topics to return (null or undefined = fetch all)
 * @returns {Promise<Array>} Array of topic objects
 */
export async function getLatestTopics(limit = null) {
  if (!isSupabaseConfigured) {
    return []
  }
  try {
    let query = supabase
      .from('topic_snapshots')
      .select('*')
      .order('rank_score', { ascending: false })
    
    // Only apply limit if provided
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
 * Fetch articles for a specific topic from article_snapshots table
 * Uses topic_ids array to find articles
 * @param {string} topicId - Topic UUID
 * @returns {Promise<Array>} Array of article objects
 */
export async function getArticlesForTopic(topicId) {
  if (!isSupabaseConfigured) {
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
 * @param {string} category - Category tag
 * @returns {Promise<Array>} Array of topic objects
 */
export async function getTopicsByCategory(category) {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('topic_snapshots')
      .select('*')
      .eq('tag', category)
      .order('rank_score', { ascending: false })

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

/**
 * Get a single topic by short ID (last 6 characters of topic_id)
 * Used for server-side meta tag generation
 * @param {string} shortId - Last 6 characters of topic_id
 * @returns {Promise<Object|null>} Topic object or null if not found
 */
export async function getTopicByShortId(shortId) {
  if (!isSupabaseConfigured || !shortId) {
    return null
  }

  try {
    // Fetch recent topics and find by matching short ID
    // We limit to recent topics for performance
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
    console.error('Error in getTopicByShortId:', error)
    return null
  }
}

