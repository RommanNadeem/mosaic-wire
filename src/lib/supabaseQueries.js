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

