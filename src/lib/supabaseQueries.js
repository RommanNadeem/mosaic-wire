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
