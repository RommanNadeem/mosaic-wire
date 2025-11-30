import { supabase } from './supabase'

/**
 * Fetch all latest topics from latest_topics_view
 * @returns {Promise<Array>} Array of topic objects
 */
export async function getLatestTopics() {
  const { data, error } = await supabase
    .from('latest_topics_view')
    .select('*')

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch all latest articles from latest_articles_view
 * @returns {Promise<Array>} Array of article objects
 */
export async function getAllLatestArticles() {
  const { data, error } = await supabase
    .from('latest_articles_view')
    .select('*')

  if (error) {
    console.error('Error fetching articles:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch articles for a specific topic
 * @param {number} topicId - Topic ID to filter by
 * @returns {Promise<Array>} Array of article objects for the topic
 */
export async function getArticlesForTopic(topicId) {
  const { data, error } = await supabase
    .from('latest_articles_view')
    .select('*')
    .eq('topic_id', topicId)

  if (error) {
    console.error('Error fetching articles for topic:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch topics filtered by category
 * @param {string} category - Category name to filter by
 * @returns {Promise<Array>} Array of topic objects
 */
export async function getTopicsByCategory(category) {
  const { data, error } = await supabase
    .from('latest_topics_view')
    .select('*')
    .eq('category', category)

  if (error) {
    console.error('Error fetching topics by category:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch articles filtered by sentiment
 * @param {"positive"|"negative"|"neutral"} sentiment - Sentiment to filter by
 * @returns {Promise<Array>} Array of article objects
 */
export async function getArticlesBySentiment(sentiment) {
  const { data, error } = await supabase
    .from('latest_articles_view')
    .select('*')
    .eq('sentiment', sentiment)

  if (error) {
    console.error('Error fetching articles by sentiment:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch the latest snapshot from topics_snapshots table
 * Orders by created_at descending and returns the most recent entry
 * The snapshot data is stored in the 'data' JSONB column
 * @returns {Promise<Object>} Latest snapshot object with topics array and metadata
 */
export async function getLatestTopicsSnapshot() {
  const { data, error } = await supabase
    .from('topics_snapshots')
    .select('id, snapshot_date, data, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching latest topics snapshot:', error)
    throw error
  }

  if (!data) {
    return null
  }

  // The snapshot JSON data is stored in the 'data' JSONB column
  // Return the JSONB data along with row metadata for reference
  if (data.data && typeof data.data === 'object') {
    return {
      ...data.data,
      _row_created_at: data.created_at,
      _row_snapshot_date: data.snapshot_date,
      _row_id: data.id
    }
  }
  
  // Fallback: return the data column if it exists, or the whole row
  return data.data || data
}

