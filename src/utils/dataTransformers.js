/**
 * Calculate time ago in minutes/hours from ISO timestamp
 * @param {string} dateTime - ISO timestamp string
 * @returns {number} Minutes ago
 */
export function calculateTimeAgo(dateTime) {
  if (!dateTime) return 0;

  const now = new Date();
  const then = new Date(dateTime);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  return diffMins;
}

/**
 * Format time ago as "Xh ago" or "Xm ago"
 * @param {number} minutesAgo - Minutes ago
 * @returns {string} Formatted string
 */
export function formatTimeAgo(minutesAgo) {
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }
  const hours = Math.floor(minutesAgo / 60);
  return `${hours}h ago`;
}

/**
 * Group articles by frontend_topic_id (integer foreign key to topic_snapshots.id)
 * @param {Array} articles - Array of article objects
 * @returns {Object} Object with frontend_topic_id as keys and arrays of articles as values
 */
export function groupArticlesByTopic(articles) {
  if (!articles || !Array.isArray(articles)) {
    return {};
  }

  return articles.reduce((acc, article) => {
    // Use frontend_topic_id (integer) which references topic_snapshots.id
    const topicId = article.frontend_topic_id;
    if (!acc[topicId]) {
      acc[topicId] = [];
    }
    acc[topicId].push(article);
    return acc;
  }, {});
}

/**
 * Calculate sentiment percentages from articles
 * @param {Array} articles - Array of article objects with sentiment field
 * @returns {Object} Sentiment object with type, percentage, and counts
 */
export function calculateSentiment(articles) {
  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return {
      type: "neutral",
      percentage: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
  }

  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  articles.forEach((article) => {
    const sentiment = article.sentiment?.toLowerCase() || "neutral";
    if (counts.hasOwnProperty(sentiment)) {
      counts[sentiment]++;
    } else {
      counts.neutral++;
    }
  });

  const total = articles.length;
  const percentages = {
    positive: Math.round((counts.positive / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };

  // Determine dominant sentiment
  let dominantType = "neutral";
  let maxCount = counts.neutral;
  if (counts.positive > maxCount) {
    dominantType = "positive";
    maxCount = counts.positive;
  }
  if (counts.negative > maxCount) {
    dominantType = "negative";
    maxCount = counts.negative;
  }

  return {
    type: dominantType,
    percentage: percentages[dominantType],
    positive: percentages.positive,
    neutral: percentages.neutral,
    negative: percentages.negative,
  };
}

/**
 * Transform article from new Supabase format to component format
 * Handles both top_articles format (simplified) and full article_snapshots format
 * @param {Object} article - Article from top_articles array or article_snapshots table
 * @returns {Object} Transformed article object
 */
export function transformArticle(article) {
  if (!article) {
    return null;
  }

  // Handle both formats:
  // top_articles format: { id, title, url, source, sentiment, published_at, favicon }
  // article_snapshots format: { article_id, title, url, source_name, sentiment_label, published_at, snippet, topic_ids }

  let timeAgo;
  if (article.time_ago) {
    // Already formatted string like "2 hours ago"
    timeAgo = article.time_ago;
  } else {
    // Calculate from timestamp
    const timestamp =
      article.published_at || article.date_time || article.created_at;
    if (timestamp) {
      const minutesAgo = calculateTimeAgo(timestamp);
      timeAgo = formatTimeAgo(minutesAgo);
    } else {
      timeAgo = "Unknown";
    }
  }

  return {
    id: article.article_id || article.id,
    source: article.source_name || article.source || "Unknown",
    headline: article.title || article.headline,
    url: article.url || article.hyperlink,
    sentiment:
      (article.sentiment_label || article.sentiment)?.toLowerCase() ||
      "neutral",
    timeAgo: timeAgo,
    excerpt: article.snippet || article.excerpt,
    summary: article.summary,
    dateTime: article.published_at || article.date_time,
    category: article.category || article.tag,
    topicId: article.topic_ids?.[0] || article.topic_id,
    topicName: article.topic_name,
    author: article.author || article.author_name || null, // Add author support
    favicon: article.favicon || null, // Extract favicon from article data
  };
}

/**
 * Transform topic from new Supabase format to news item format
 * @param {Object} topic - Topic from topic_snapshots table
 * @param {Array} articles - Optional additional articles (top_articles are precomputed)
 * @returns {Object} Transformed news item object
 */
export function transformTopicToNewsItem(topic, articles = []) {
  if (!topic) {
    return null;
  }

  // Use precomputed top_articles if available, otherwise use provided articles
  const articlesToUse = topic.top_articles || articles;

  // Filter out null articles and transform
  const transformedArticles = (articlesToUse || [])
    .map(transformArticle)
    .filter((article) => article !== null);

  // Use precomputed signal_balance if available, otherwise calculate from articles
  let sentiment;
  if (topic.signal_balance) {
    const { positive, neutral, negative } = topic.signal_balance;
    const total = positive + neutral + negative;
    if (total > 0) {
      sentiment = {
        type:
          positive > negative && positive > neutral
            ? "positive"
            : negative > positive && negative > neutral
            ? "negative"
            : "neutral",
        percentage: Math.round(
          (Math.max(positive, neutral, negative) / total) * 100
        ),
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      };
    } else {
      sentiment = calculateSentiment(transformedArticles);
    }
  } else {
    sentiment = calculateSentiment(transformedArticles);
  }

  // Use precomputed time_ago if available, prefer topic_time_ago for topic creation time
  const timeAgo =
    topic.topic_time_ago ||
    topic.time_ago ||
    calculateTimeAgo(topic.updated_at || topic.created_at);

  return {
    id: topic.topic_id || topic.id,
    title: topic.headline || topic.topic_name,
    category: topic.tag || topic.category,
    timeAgo: typeof timeAgo === "string" ? timeAgo : formatTimeAgo(timeAgo),
    summary: topic.summary || topic.ai_summary || "",
    sentiment: sentiment,
    image: topic.image_url || null, // Use image_url from backend, or null if not available
    sources: transformedArticles,
    quote: null,
    quoteAuthor: null,
    articleCount: topic.article_count,
    sourceCount: topic.source_count,
    recentArticlesCount: topic.recent_articles_count,
    updatedAt: topic.updated_at,
  };
}

/**
 * Transform Supabase data to frontend format
 * Topics now have precomputed top_articles, so articles parameter is optional
 * @param {Array} topics - Topics from topic_snapshots table (with top_articles precomputed)
 * @param {Array} articles - Optional additional articles from article_snapshots table
 * @returns {Array} Array of news item objects
 */
export function transformSupabaseData(topics, articles = []) {
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return [];
  }

  // Topics now have top_articles precomputed, so we can use them directly
  // If additional articles are provided, we can merge them, but top_articles takes precedence
  return topics
    .map((topic) => {
      if (!topic) {
        return null;
      }

      // If topic has top_articles, use them; otherwise try to find articles by topic_id
      let topicArticles = [];
      if (
        topic.top_articles &&
        Array.isArray(topic.top_articles) &&
        topic.top_articles.length > 0
      ) {
        topicArticles = topic.top_articles;
      } else if (articles && articles.length > 0 && topic.topic_id) {
        // Fallback: find articles that contain this topic_id in their topic_ids array
        topicArticles = articles.filter(
          (article) =>
            article &&
            article.topic_ids &&
            article.topic_ids.includes(topic.topic_id)
        );
      }

      return transformTopicToNewsItem(topic, topicArticles);
    })
    .filter((item) => item !== null); // Remove any null items
}
