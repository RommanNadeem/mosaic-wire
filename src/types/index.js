/**
 * TypeScript-style interfaces for Supabase views
 * These match the schema from latest_topics_view and latest_articles_view
 */

/**
 * @typedef {Object} LatestTopic
 * @property {number} id - Primary key
 * @property {string} topic_name - Topic name (e.g., "Pakistan Elections")
 * @property {string|null} category - Category name (e.g., "Politics", "Economy", null)
 * @property {string} date - ISO date: "2024-01-15"
 * @property {string|null} ai_summary - AI-generated summary
 * @property {"positive"|"negative"|"neutral"} overall_sentiment - Overall sentiment
 * @property {number} article_count - Number of articles for this topic
 * @property {string} snapshot_timestamp - ISO timestamp: "2024-01-15T10:30:00Z"
 * @property {string} created_at - ISO timestamp: "2024-01-15T10:30:00Z"
 */

/**
 * @typedef {Object} LatestArticle
 * @property {number} id - Primary key
 * @property {string} topic_name - Topic name (e.g., "Pakistan Elections")
 * @property {number} topic_id - Foreign key to topics
 * @property {string} headline - Article headline
 * @property {string} hyperlink - Full URL to article
 * @property {string|null} excerpt - Article excerpt
 * @property {string|null} summary - AI-generated summary
 * @property {"positive"|"negative"|"neutral"} sentiment - Article sentiment
 * @property {string} date_time - ISO timestamp: "2024-01-15T14:30:00Z"
 * @property {string|null} news_source - News source name (e.g., "Dawn", "Reuters", null)
 * @property {string|null} category - Category name (e.g., "Politics", "Economy", null)
 * @property {string} snapshot_timestamp - ISO timestamp: "2024-01-15T10:30:00Z"
 * @property {string} created_at - ISO timestamp: "2024-01-15T10:30:00Z"
 */

export {}


