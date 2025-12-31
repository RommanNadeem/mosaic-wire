# Backend Data Format Specification

This document defines the exact data format that the MosaicBeat frontend expects from the backend API.

## Overview

The frontend expects data from two endpoints/views:
1. **Topics** - Aggregated topic information with sentiment analysis
2. **Articles** - Individual article details grouped by topic

Both endpoints should return JSON arrays of objects.

---

## 1. Topics Endpoint

**Endpoint/View**: `latest_topics_view`  
**Method**: GET  
**Response**: Array of topic objects

### Response Format

```json
[
  {
    "id": 1,
    "topic_name": "Pakistan Elections 2024",
    "category": "Politics",
    "date": "2024-01-15",
    "ai_summary": "The 2024 Pakistan elections marked a significant shift in political dynamics...",
    "overall_sentiment": "neutral",
    "article_count": 5,
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Field Specifications

| Field | Type | Required | Nullable | Description | Example |
|-------|------|----------|----------|-------------|---------|
| `id` | number | ✅ Yes | ❌ No | Primary key (serial), unique identifier | `1` |
| `topic_id` | string (UUID) | ✅ Yes | ❌ No | Topic UUID (foreign key to topics table) | `"550e8400-e29b-41d4-a716-446655440000"` |
| `topic_name` | string | ✅ Yes | ❌ No | Topic name/title | `"Pakistan Elections 2024"` |
| `category` | string | ❌ No | ✅ Yes | Category classification | `"Politics"`, `"Economy"`, `"Technology"`, or `null` |
| `date` | string | ✅ Yes | ❌ No | ISO date format (YYYY-MM-DD) | `"2024-01-15"` |
| `ai_summary` | string | ❌ No | ✅ Yes | AI-generated summary of the topic | `"The elections..."` or `null` |
| `overall_sentiment` | enum | ✅ Yes | ❌ No | Overall sentiment for the topic | `"positive"`, `"negative"`, or `"neutral"` |
| `article_count` | number | ✅ Yes | ❌ No | Number of articles for this topic | `5` |
| `snapshot_timestamp` | string | ✅ Yes | ❌ No | ISO 8601 timestamp when snapshot was created | `"2024-01-15T10:30:00Z"` |
| `created_at` | string | ✅ Yes | ❌ No | ISO 8601 timestamp when record was created | `"2024-01-15T10:30:00Z"` |

### Validation Rules

- `overall_sentiment` must be exactly one of: `"positive"`, `"negative"`, `"neutral"` (lowercase, no other values)
- `date` must be in ISO date format: `YYYY-MM-DD`
- `snapshot_timestamp` and `created_at` must be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- `article_count` must be a non-negative integer
- `id` must be unique across all topics

### Example Response

```json
[
  {
    "id": 1,
    "topic_name": "The 27th Amendment & Power Shift",
    "category": "Politics",
    "date": "2024-01-15",
    "ai_summary": "The constitutional package moves forward after rancorous debate. Proponents pitch stability and coherent command; critics warn of centralization and weaker judicial independence.",
    "overall_sentiment": "negative",
    "article_count": 5,
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "topic_name": "AI Breakthrough in Quantum Computing",
    "category": "Technology",
    "date": "2024-01-15",
    "ai_summary": "Scientists achieve major milestone in quantum computing with new error correction techniques.",
    "overall_sentiment": "positive",
    "article_count": 4,
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## 2. Articles Endpoint

**Endpoint/View**: `latest_articles_view`  
**Method**: GET  
**Response**: Array of article objects

### Response Format

```json
[
  {
    "id": 1,
    "topic_name": "Pakistan Elections 2024",
    "topic_id": 1,
    "headline": "Election Results Announced",
    "hyperlink": "https://www.dawn.com/news/123456",
    "excerpt": "The election commission announced the final results...",
    "summary": "AI-generated summary of the article content...",
    "sentiment": "neutral",
    "date_time": "2024-01-15T14:30:00Z",
    "news_source": "Dawn",
    "category": "Politics",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Field Specifications

| Field | Type | Required | Nullable | Description | Example |
|-------|------|----------|----------|-------------|---------|
| `id` | number | ✅ Yes | ❌ No | Primary key (serial), unique identifier | `1` |
| `article_id` | string (UUID) | ✅ Yes | ❌ No | Article UUID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `topic_id` | string (UUID) | ✅ Yes | ❌ No | Topic UUID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `topic_name` | string | ✅ Yes | ❌ No | Denormalized topic name (must match topic) | `"Pakistan Elections 2024"` |
| `frontend_topic_id` | number | ✅ Yes | ❌ No | Foreign key to topic_snapshots.id (integer, used for grouping) | `1` |
| `headline` | string | ✅ Yes | ❌ No | Article headline/title (displayed in UI) | `"Election Results Announced"` |
| `hyperlink` | string | ✅ Yes | ❌ No | Full URL to the article (must be valid URL) | `"https://www.dawn.com/news/123456"` |
| `excerpt` | string | ❌ No | ✅ Yes | Article excerpt/preview text | `"The election commission..."` or `null` |
| `summary` | string | ❌ No | ✅ Yes | AI-generated summary of article | `"AI summary..."` or `null` |
| `sentiment` | enum | ✅ Yes | ❌ No | Article sentiment | `"positive"`, `"negative"`, or `"neutral"` |
| `date_time` | string | ✅ Yes | ❌ No | ISO 8601 timestamp of article publication | `"2024-01-15T14:30:00Z"` |
| `news_source` | string | ❌ No | ✅ Yes | News source name | `"Dawn"`, `"Reuters"`, or `null` |
| `category` | string | ❌ No | ✅ Yes | Category classification | `"Politics"`, `"Economy"`, or `null` |
| `snapshot_timestamp` | string | ✅ Yes | ❌ No | ISO 8601 timestamp when snapshot was created | `"2024-01-15T10:30:00Z"` |
| `created_at` | string | ✅ Yes | ❌ No | ISO 8601 timestamp when record was created | `"2024-01-15T10:30:00Z"` |

### Validation Rules

- `sentiment` must be exactly one of: `"positive"`, `"negative"`, or `"neutral"` (lowercase, no other values)
- `frontend_topic_id` must be a valid integer that references `topic_snapshots.id` (the serial primary key)
- `topic_id` is the UUID of the topic (for reference)
- `topic_name` should match the `topic_name` of the topic with matching `frontend_topic_id` (denormalized for performance)
- `hyperlink` must be a valid URL (preferably absolute URL with protocol)
- `date_time` must be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- `snapshot_timestamp` and `created_at` must be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- `id` must be unique across all articles

### Example Response

```json
[
  {
    "id": 1,
    "topic_name": "The 27th Amendment & Power Shift",
    "topic_id": 1,
    "headline": "Reform for a Stronger Pakistan?",
    "hyperlink": "https://ptvnews.gov.pk/article/123",
    "excerpt": "The 27th Amendment introduces sweeping changes to constitutional structures, with proponents arguing it strengthens governance.",
    "summary": "The amendment proposes significant changes to Pakistan's constitutional framework...",
    "sentiment": "positive",
    "date_time": "2024-01-15T12:00:00Z",
    "news_source": "PTV News",
    "category": "Politics",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "topic_name": "The 27th Amendment & Power Shift",
    "topic_id": 1,
    "headline": "PTI's Gohar raises 'elite class' concern",
    "hyperlink": "https://dawn.com/news/456",
    "excerpt": "Opposition leader questions whether the new amendment serves the interests of ordinary citizens or political elites.",
    "summary": null,
    "sentiment": "neutral",
    "date_time": "2024-01-15T11:00:00Z",
    "news_source": "Dawn",
    "category": "Politics",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 3,
    "topic_name": "The 27th Amendment & Power Shift",
    "topic_id": 1,
    "headline": "Power balance and army's role",
    "hyperlink": "https://aljazeera.com/news/789",
    "excerpt": "Critics warn that the amendment shifts too much authority to military institutions, potentially undermining civilian oversight.",
    "summary": "Analysis of the constitutional changes and their implications for military-civilian relations...",
    "sentiment": "negative",
    "date_time": "2024-01-15T10:00:00Z",
    "news_source": "Al Jazeera",
    "category": "Politics",
    "snapshot_timestamp": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Data Relationships

### Topic-Article Relationship

- Articles are grouped by `topic_id`
- Each article's `topic_id` must reference a valid topic `id`
- The `topic_name` in articles should match the `topic_name` in the corresponding topic (denormalized for query performance)
- Multiple articles can belong to the same topic

### Example Relationship

```json
// Topic (from topic_snapshots)
{
  "id": 1,
  "topic_id": "550e8400-e29b-41d4-a716-446655440000",
  "topic_name": "Pakistan Elections 2024",
  "article_count": 3,
  ...
}

// Articles (from article_snapshots) for frontend_topic_id = 1
[
  { "id": 1, "frontend_topic_id": 1, "topic_id": "550e8400-e29b-41d4-a716-446655440000", "topic_name": "Pakistan Elections 2024", ... },
  { "id": 2, "frontend_topic_id": 1, "topic_id": "550e8400-e29b-41d4-a716-446655440000", "topic_name": "Pakistan Elections 2024", ... },
  { "id": 3, "frontend_topic_id": 1, "topic_id": "550e8400-e29b-41d4-a716-446655440000", "topic_name": "Pakistan Elections 2024", ... }
]
```

---

## Common Patterns

### Empty Results

Both endpoints should return an empty array `[]` if no data is available, not `null` or an error.

```json
[]
```

### Error Response Format

If an error occurs, return a standard error object:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Ordering

- **Topics**: Should be ordered by `date` descending (newest first)
- **Articles**: Should be ordered by `date_time` descending (newest first)

---

## Type Definitions

### Sentiment Enum

```typescript
type Sentiment = "positive" | "negative" | "neutral"
```

### Topic Object

```typescript
interface Topic {
  id: number  // Serial primary key
  topic_id: string  // UUID foreign key to topics table
  topic_name: string
  category: string | null
  date: string  // ISO date: "YYYY-MM-DD"
  ai_summary: string | null
  overall_sentiment: "positive" | "negative" | "neutral"
  article_count: number
  snapshot_timestamp: string  // ISO 8601
  created_at: string  // ISO 8601
  snapshot_version?: number | null
}
```

### Article Object

```typescript
interface Article {
  id: number  // Serial primary key
  article_id: string  // Article UUID
  topic_id: string  // Topic UUID
  topic_name: string
  frontend_topic_id: number  // Integer FK to topic_snapshots.id
  headline: string
  hyperlink: string
  excerpt: string | null
  summary: string | null
  sentiment: "positive" | "negative" | "neutral"
  date_time: string  // ISO 8601
  news_source: string | null
  category: string | null
  snapshot_timestamp: string  // ISO 8601
  created_at: string  // ISO 8601
}
```

---

## Testing Checklist

When implementing the backend, ensure:

- [ ] Topics endpoint returns array of topic objects
- [ ] Articles endpoint returns array of article objects
- [ ] All required fields are present and non-null
- [ ] Sentiment values are exactly `"positive"`, `"negative"`, or `"neutral"` (lowercase)
- [ ] All timestamps are in ISO 8601 format
- [ ] `topic_id` in articles references valid topic `id`
- [ ] `hyperlink` values are valid URLs
- [ ] Empty results return `[]` not `null`
- [ ] Data is ordered by date (newest first)
- [ ] All IDs are unique within their respective collections

---

## Notes

1. **Denormalization**: The `topic_name` field is denormalized in articles for query performance. It should match the topic's `topic_name` but the frontend will use `topic_id` for grouping.

2. **Nullable Fields**: Fields marked as nullable can be `null` or omitted. The frontend handles both cases.

3. **Timestamp Format**: All timestamps must be in ISO 8601 format with timezone (Z for UTC). Example: `"2024-01-15T14:30:00Z"`

4. **URL Format**: Hyperlinks should be absolute URLs with protocol (http:// or https://). Relative URLs may cause issues.

5. **Sentiment Calculation**: The frontend calculates sentiment percentages from individual article sentiments, so ensure article sentiments are accurate.

