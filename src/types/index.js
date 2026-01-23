/**
 * TypeScript-style interfaces for Supabase snapshot tables
 * These match the new schema from topic_snapshots and article_snapshots tables
 */

/**
 * @typedef {Object} SignalBalance
 * @property {number} positive - Count of positive articles
 * @property {number} neutral - Count of neutral articles
 * @property {number} negative - Count of negative articles
 */

/**
 * @typedef {Object} TopArticle
 * @property {string} id - Article UUID
 * @property {string} title - Article title
 * @property {string} url - Article URL
 * @property {string} source - Source name (e.g., "Dawn")
 * @property {"positive"|"negative"|"neutral"} sentiment - Article sentiment
 * @property {string} published_at - ISO timestamp: "2025-01-15T10:00:00Z"
 * @property {string} [favicon] - Optional favicon URL from news_sources.logo_url or external_sources.source_favicon
 */

/**
 * @typedef {Object} TopicSnapshot
 * @property {string} topic_id - Topic UUID
 * @property {string} headline - Topic headline (e.g., "Pakistan Economic Crisis Deepens")
 * @property {string} summary - 2-3 sentence summary of the topic
 * @property {string} tag - Category tag (e.g., "economy")
 * @property {string} image_url - URL to topic image
 * @property {number} article_count - Number of articles for this topic
 * @property {number} source_count - Number of unique sources
 * @property {number} recent_articles_count - Number of recent articles
 * @property {SignalBalance} signal_balance - Precomputed signal balance counts
 * @property {number} overall_sentiment - Overall sentiment score (-1 to 1)
 * @property {TopArticle[]} top_articles - Precomputed top articles (up to 10)
 * @property {number} rank_score - Ranking score for sorting
 * @property {string} time_ago - Formatted time string (e.g., "2 hours ago")
 * @property {string} topic_time_ago - Formatted time string for topic creation (e.g., "2 hours ago")
 * @property {string} updated_at - ISO timestamp: "2025-01-15T12:00:00Z"
 */

/**
 * @typedef {Object} ArticleSnapshot
 * @property {string} article_id - Article UUID
 * @property {string} title - Article title
 * @property {string} url - Article URL
 * @property {string} source_name - Source name (e.g., "Dawn")
 * @property {string} published_at - ISO timestamp: "2025-01-15T10:00:00Z"
 * @property {"positive"|"negative"|"neutral"} sentiment_label - Article sentiment label
 * @property {number} sentiment_score - Sentiment score (-1 to 1)
 * @property {string[]} topic_ids - Array of topic UUIDs this article belongs to
 * @property {string} snippet - First 200 chars of content
 * @property {string} updated_at - ISO timestamp: "2025-01-15T12:00:00Z"
 */

export {}



