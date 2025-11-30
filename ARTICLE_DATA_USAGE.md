# Article Data Usage from `latest_articles_view`

This document explains how data from the `latest_articles_view` is used in the MosaicWire frontend.

## Fields from `latest_articles_view`

The following fields are available in `latest_articles_view` and how they're used:

| Field | Type | Used For | Component |
|-------|------|----------|-----------|
| `id` | number | Unique identifier for each article | SourceList (key) |
| `topic_id` | number | Groups articles by topic | Data transformation |
| `topic_name` | string | Denormalized topic name | Reference |
| `headline` | string | **Displayed as source headline** | SourceList component |
| `hyperlink` | string | **Article URL (hyperlinked)** | SourceList component |
| `excerpt` | string \| null | Available but not displayed (can be used for tooltips) | - |
| `summary` | string \| null | Article-level AI summary (available if needed) | - |
| `sentiment` | enum | **Color-coded sentiment indicator** | SourceList (colored dot) |
| `date_time` | string | **Time calculation ("Xh ago")** | SourceList component |
| `news_source` | string \| null | **Source name (e.g., "Dawn", "Reuters")** | SourceList component |
| `category` | string \| null | Category from article | Available for filtering |
| `snapshot_timestamp` | string | When snapshot was created | Reference |
| `created_at` | string | Fallback for timestamp if `date_time` missing | Time calculation |

## How Article Data is Transformed

### 1. Data Flow
```
latest_articles_view (Supabase)
  ↓
getAllLatestArticles() (supabaseQueries.js)
  ↓
groupArticlesByTopic() (dataTransformers.js)
  ↓
transformTopicToNewsItem() (dataTransformers.js)
  ↓
SourceList component
```

### 2. Source Object Structure

Each article becomes a source object with this structure:

```javascript
{
  id: article.id,                           // From latest_articles_view.id
  source: article.news_source,              // From latest_articles_view.news_source
  headline: article.headline,               // From latest_articles_view.headline
  url: article.hyperlink,                   // From latest_articles_view.hyperlink
  sentiment: article.sentiment,             // From latest_articles_view.sentiment
  timeAgo: calculateTimeAgo(article.date_time), // Calculated from date_time
  excerpt: article.excerpt,                 // From latest_articles_view.excerpt
  summary: article.summary,                 // From latest_articles_view.summary
  dateTime: article.date_time,              // Raw timestamp
  category: article.category,               // From latest_articles_view.category
  topicId: article.topic_id,                // From latest_articles_view.topic_id
  topicName: article.topic_name             // From latest_articles_view.topic_name
}
```

### 3. Display in UI

**SourceList Component** displays:
- **Colored dot**: Based on `sentiment` field (green/yellow/red)
- **Source name**: From `news_source` field
- **Timestamp**: From `date_time` field (formatted as "Xh ago")
- **Headline**: From `headline` field (hyperlinked)
- **URL**: From `hyperlink` field (opens in new tab)

## Notes

1. **All fields are fetched**: The query uses `select('*')` to fetch all available fields from `latest_articles_view`

2. **Excerpt and Summary**: These fields are extracted but not currently displayed in the UI. They can be used for:
   - Tooltips on hover
   - Expandable source details
   - Search/filter functionality

3. **Author field**: The schema doesn't include an `author` field. If you need author information, you'll need to add it to your `latest_articles_view`.

4. **Sentiment Calculation**: Individual article sentiments are used to:
   - Calculate overall topic sentiment percentages
   - Display colored indicators per source
   - Generate the Signal Balance bar

5. **Time Calculation**: Uses `date_time` field (with fallback to `created_at`) to calculate relative time (e.g., "2h ago")

## Example Query

```javascript
// Fetches all fields from latest_articles_view
const articles = await supabase
  .from('latest_articles_view')
  .select('*')

// Result includes all fields:
// id, topic_id, topic_name, headline, hyperlink, excerpt, summary,
// sentiment, date_time, news_source, category, snapshot_timestamp, created_at
```



