/**
 * Transform Supabase data to match component structure
 */

/**
 * Calculate time ago in minutes from ISO timestamp
 * @param {string} timestamp - ISO timestamp string
 * @returns {number} Minutes ago
 */
export function calculateTimeAgo(timestamp) {
  if (!timestamp) return 0
  
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now - past
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  return Math.max(0, diffMinutes)
}

/**
 * Transform a topic with its articles into the news card format
 * @param {Object} topic - Topic from latest_topics_view
 * @param {Array} articles - Articles from latest_articles_view for this topic
 * @returns {Object} Transformed news item
 */
export function transformTopicToNewsItem(topic, articles = []) {
  // Calculate sentiment percentage from articles
  const sentimentCounts = articles.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
    return acc
  }, {})

  const total = articles.length || 1
  const sentimentPercentages = {
    positive: Math.round((sentimentCounts.positive || 0) / total * 100),
    negative: Math.round((sentimentCounts.negative || 0) / total * 100),
    neutral: Math.round((sentimentCounts.neutral || 0) / total * 100),
  }

  // Determine dominant sentiment
  let dominantSentiment = topic.overall_sentiment || 'neutral'
  let sentimentPercentage = 0

  // If no articles, use topic's overall_sentiment with default percentage
  if (articles.length === 0) {
    sentimentPercentage = 50 // Default percentage when no articles
  } else {
    // Use calculated percentage from articles
    const maxSentiment = Object.entries(sentimentPercentages).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )
    dominantSentiment = maxSentiment[0]
    sentimentPercentage = maxSentiment[1]
  }
  
  // Fallback to topic's overall_sentiment if calculated percentage is 0
  if (sentimentPercentage === 0 && topic.overall_sentiment) {
    dominantSentiment = topic.overall_sentiment
    sentimentPercentage = 50
  }

  // Transform articles to sources format using all fields from latest_articles_view
  // Schema fields: id, topic_name, topic_id, headline, hyperlink, excerpt, summary, 
  // sentiment, date_time, news_source, category, snapshot_timestamp, created_at
  const sources = articles.map((article) => ({
    id: article.id,
    source: article.news_source || 'Unknown Source',
    headline: article.headline || 'No headline',
    url: article.hyperlink || '#',
    sentiment: article.sentiment || 'neutral',
    excerpt: article.excerpt || null, // Article excerpt from latest_articles_view
    summary: article.summary || null, // Article-level AI summary from latest_articles_view
    timeAgo: calculateTimeAgo(article.date_time || article.created_at), // Time for each article
    dateTime: article.date_time || article.created_at, // Raw timestamp from latest_articles_view
    category: article.category || null, // Category from article (may differ from topic category)
    topicId: article.topic_id, // Reference to parent topic
    topicName: article.topic_name, // Topic name (denormalized)
  }))

  return {
    id: topic.id,
    title: topic.topic_name,
    category: topic.category || 'General',
    timeAgo: calculateTimeAgo(topic.snapshot_timestamp || topic.created_at),
    summary: topic.ai_summary || 'No summary available.',
    sentiment: {
      type: dominantSentiment,
      percentage: sentimentPercentage,
      positive: sentimentPercentages.positive,
      neutral: sentimentPercentages.neutral,
      negative: sentimentPercentages.negative,
    },
    image: null, // Can be added later if images are stored
    sources: sources,
    quote: null, // Can be added later if quotes are stored
    quoteAuthor: null,
  }
}

/**
 * Group articles by topic
 * @param {Array} articles - Array of articles from latest_articles_view
 * @returns {Object} Object with topic_id as keys and arrays of articles as values
 */
export function groupArticlesByTopic(articles) {
  if (!articles || articles.length === 0) {
    console.warn('No articles provided to groupArticlesByTopic')
    return {}
  }

  const grouped = articles.reduce((acc, article) => {
    // Try topic_id first, fallback to topic_name if topic_id is missing
    const topicId = article.topic_id
    const topicName = article.topic_name
    
    if (!topicId && !topicName) {
      console.warn('Article missing both topic_id and topic_name:', article)
      return acc
    }

    // Use topic_id as primary key, or topic_name as fallback
    const key = topicId || `name_${topicName}`
    
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(article)
    return acc
  }, {})

  console.log('Grouped articles by topic:', {
    totalArticles: articles.length,
    groups: Object.keys(grouped).map(key => ({
      key,
      count: grouped[key].length,
      sample: grouped[key][0]?.topic_name || grouped[key][0]?.topic_id
    }))
  })

  return grouped
}

/**
 * Transform multiple topics with articles into news items
 * @param {Array} topics - Array of topics from latest_topics_view
 * @param {Array} articles - Array of articles from latest_articles_view
 * @returns {Array} Array of transformed news items
 */
export function transformTopicsToNewsItems(topics, articles) {
  if (!topics || topics.length === 0) {
    console.warn('No topics provided to transformTopicsToNewsItems')
    return []
  }

  if (!articles || articles.length === 0) {
    console.warn('No articles provided to transformTopicsToNewsItems - topics will have no sources')
    // Return topics without articles
    return topics.map(topic => transformTopicToNewsItem(topic, []))
  }

  // Group articles by both topic_id and topic_name for flexible matching
  const articlesByTopicId = {}
  const articlesByTopicName = {}

  articles.forEach((article) => {
    // Group by topic_id
    if (article.topic_id) {
      if (!articlesByTopicId[article.topic_id]) {
        articlesByTopicId[article.topic_id] = []
      }
      articlesByTopicId[article.topic_id].push(article)
    }

    // Also group by topic_name as fallback
    if (article.topic_name) {
      const topicNameKey = article.topic_name.trim().toLowerCase()
      if (!articlesByTopicName[topicNameKey]) {
        articlesByTopicName[topicNameKey] = []
      }
      articlesByTopicName[topicNameKey].push(article)
    }
  })

  console.log('Grouped articles:', {
    byTopicId: Object.keys(articlesByTopicId).length,
    byTopicName: Object.keys(articlesByTopicName).length,
    totalArticles: articles.length,
    topicIdKeys: Object.keys(articlesByTopicId),
    sampleTopicNames: Object.keys(articlesByTopicName).slice(0, 3)
  })

  return topics.map((topic) => {
    let topicArticles = []

    // First try matching by topic.id
    if (topic.id && articlesByTopicId[topic.id]) {
      topicArticles = articlesByTopicId[topic.id]
    }
    // Fallback: match by topic_name (case-insensitive)
    else if (topic.topic_name && topicArticles.length === 0) {
      const topicNameKey = topic.topic_name.trim().toLowerCase()
      topicArticles = articlesByTopicName[topicNameKey] || []
    }

    const transformedItem = transformTopicToNewsItem(topic, topicArticles)
    
    // Debug: Log article data for each topic
    if (topicArticles.length > 0) {
      console.log(`✅ Topic ${topic.id} (${topic.topic_name}): ${topicArticles.length} articles`, {
        topicId: topic.id,
        topicName: topic.topic_name,
        firstArticle: topicArticles[0],
        transformedSourcesCount: transformedItem.sources.length
      })
    } else {
      console.warn(`⚠️ Topic ${topic.id} (${topic.topic_name}): No articles found`, {
        topicId: topic.id,
        topicName: topic.topic_name,
        availableTopicIds: Object.keys(articlesByTopicId),
        availableTopicNames: Object.keys(articlesByTopicName).slice(0, 5)
      })
    }
    
    return transformedItem
  })
}

/**
 * Calculate overall sentiment from all articles
 * @param {Array} articles - Array of articles from latest_articles_view
 * @returns {Object} Overall sentiment object
 */
export function calculateOverallSentimentFromArticles(articles) {
  // Handle empty articles array
  if (!articles || articles.length === 0) {
    return {
      type: 'neutral',
      percentage: 0,
      positive: 0,
      negative: 0,
      neutral: 100,
    }
  }

  const sentimentCounts = articles.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
    return acc
  }, {})

  const total = articles.length
  const positive = Math.round((sentimentCounts.positive || 0) / total * 100)
  const negative = Math.round((sentimentCounts.negative || 0) / total * 100)
  const neutral = Math.round((sentimentCounts.neutral || 0) / total * 100)

  // Determine dominant sentiment
  let dominant = 'neutral'
  let percentage = neutral
  if (positive > percentage) {
    dominant = 'positive'
    percentage = positive
  }
  if (negative > percentage) {
    dominant = 'negative'
    percentage = negative
  }

  return {
    type: dominant,
    percentage: percentage,
    positive: positive,
    negative: negative,
    neutral: neutral,
  }
}
