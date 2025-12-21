# Supabase Queries Documentation

## Query: `latest_articles_view`

### Main Query

```javascript
import { supabase } from './lib/supabase'

// Fetch all articles from latest_articles_view
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
```

### Current Implementation

**Location**: `src/lib/supabaseQueries.js`

**Function**: `getAllLatestArticles()`

```javascript
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
```

### Fields Returned (All Fields with `select('*')`)

Based on the schema, the query returns:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Primary key |
| `topic_name` | string | Topic name (denormalized) |
| `topic_id` | number | Foreign key to topics |
| `headline` | string | Article headline |
| `hyperlink` | string | Full URL to article |
| `excerpt` | string \| null | Article excerpt |
| `summary` | string \| null | AI-generated summary |
| `sentiment` | enum | "positive", "negative", or "neutral" |
| `date_time` | string | ISO timestamp: "2024-01-15T14:30:00Z" |
| `news_source` | string \| null | News source name (e.g., "Dawn", "Reuters") |
| `category` | string \| null | Category name (denormalized) |
| `snapshot_timestamp` | string | ISO timestamp when snapshot was created |
| `created_at` | string | ISO timestamp when record was created |

### Alternative Queries

#### 1. Select Specific Fields Only

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('id, headline, hyperlink, sentiment, news_source, date_time')
```

#### 2. Filter by Topic ID

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .eq('topic_id', 1)
```

#### 3. Filter by Sentiment

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .eq('sentiment', 'positive')
```

#### 4. Filter by Category

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .eq('category', 'Politics')
```

#### 5. Filter by News Source

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .eq('news_source', 'Dawn')
```

#### 6. Order by Date (newest first - already ordered in view)

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .order('date_time', { ascending: false })
```

#### 7. Limit Results

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .limit(10)
```

#### 8. Combined Filters

```javascript
const { data, error } = await supabase
  .from('latest_articles_view')
  .select('*')
  .eq('category', 'Politics')
  .eq('sentiment', 'negative')
  .order('date_time', { ascending: false })
  .limit(20)
```

### Usage in Application

**Location**: `src/App.jsx`

The query is called during app initialization:

```javascript
import { getAllLatestArticles } from './lib/supabaseQueries'

// In useEffect:
const [topics, articles] = await Promise.all([
  getLatestTopics(),
  getAllLatestArticles(), // ← Query executed here
])
```

### Test Query Manually

You can test the query in your browser console:

```javascript
// Open browser console on your app
// Then paste:

import { supabase } from './lib/supabase'

// Test the query
const testQuery = async () => {
  const { data, error } = await supabase
    .from('latest_articles_view')
    .select('*')
    .limit(5) // Limit to 5 for testing
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Articles:', data)
    console.log('Count:', data.length)
  }
  
  return { data, error }
}

testQuery()
```

### Expected Response Format

```json
[
  {
    "id": 1,
    "topic_name": "Pakistan Elections 2024",
    "topic_id": 1,
    "headline": "Election Results Announced",
    "hyperlink": "https://www.dawn.com/news/123456",
    "excerpt": "The election commission announced...",
    "summary": "AI-generated summary of the article...",
    "sentiment": "neutral",
    "date_time": "2024-01-15T14:30:00Z",
    "news_source": "Dawn",
    "category": "Politics",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "topic_name": "Economic Crisis",
    "topic_id": 2,
    "headline": "Inflation Reaches Record High",
    "hyperlink": "https://www.reuters.com/news/789012",
    "excerpt": "Pakistan's inflation rate...",
    "summary": "AI-generated summary...",
    "sentiment": "negative",
    "date_time": "2024-01-15T13:20:00Z",
    "news_source": "Reuters",
    "category": "Economy",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Query Functions Available

1. **`getAllLatestArticles()`** - Get all articles
2. **`getArticlesForTopic(topicId)`** - Get articles for specific topic
3. **`getArticlesBySentiment(sentiment)`** - Filter by sentiment

### Notes

- The view is **pre-ordered** by `date_time DESC` (newest first)
- All data is **denormalized** (no joins needed)
- The view contains **only the latest** aggregation run
- Use `select('*')` to get all fields, or specify fields for better performance




