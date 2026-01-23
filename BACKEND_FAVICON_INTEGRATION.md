# Backend Favicon Integration Guide

## Overview

This document outlines the backend changes required to include favicon URLs in the `top_articles` JSONB field within the `topic_snapshots` table. The frontend expects favicon data to be included in each article object within the `top_articles` array.

## Required Changes

### 1. Modify the Query That Populates `topic_snapshots.top_articles`

The backend query that generates the `top_articles` JSONB field needs to be updated to include favicon information from two sources:

- **Regular news sources**: Join through `article_snapshots` → `raw_articles` → `news_sources` to get `logo_url`
- **External sources**: Join through `article_snapshots` → `external_sources` to get `source_favicon`

### 2. Favicon Priority Logic

When populating the `favicon` field in `top_articles`, use the following priority:

1. **First priority**: `external_sources.source_favicon` (if the article is from an external source)
2. **Second priority**: `news_sources.logo_url` (if the article is from a regular news source)
3. **Fallback**: `null` or omit the field if no favicon is available

### 3. Expected JSON Structure

Each article object in the `top_articles` JSONB array should include a `favicon` field:

```json
{
  "id": "uuid-string",
  "title": "Article title",
  "url": "https://example.com/article",
  "source": "Dawn",
  "sentiment": "positive",
  "published_at": "2025-01-15T10:00:00Z",
  "favicon": "https://example.com/favicon.ico"
}
```

**Note**: The `favicon` field should be optional. If no favicon is available, either:
- Set `favicon` to `null`, or
- Omit the field entirely

Both approaches are acceptable as the frontend handles missing favicons gracefully.

## SQL Query Example

Here's an example of how the query might look (adjust based on your actual implementation):

```sql
-- Example query structure (pseudocode)
SELECT 
  topic_id,
  -- ... other topic fields ...
  jsonb_agg(
    jsonb_build_object(
      'id', a.article_id,
      'title', a.title,
      'url', a.url,
      'source', a.source_name,
      'sentiment', a.sentiment_label,
      'published_at', a.published_at,
      'favicon', COALESCE(
        es.source_favicon,  -- External source favicon (priority 1)
        ns.logo_url         -- News source logo (priority 2)
      )
    ) ORDER BY a.published_at DESC
  ) FILTER (WHERE a.article_id IS NOT NULL) as top_articles
FROM topic_snapshots ts
LEFT JOIN article_snapshots a ON a.topic_ids @> ARRAY[ts.topic_id]
LEFT JOIN raw_articles ra ON ra.id = a.article_id
LEFT JOIN news_sources ns ON ns.id = ra.source_id
LEFT JOIN external_sources es ON es.url = a.url  -- Adjust join condition as needed
GROUP BY topic_id;
```

**Important**: Adjust the join conditions (`LEFT JOIN external_sources`) based on how your schema links `article_snapshots` to `external_sources`. The example above assumes a URL match, but your actual relationship may differ.

## Database Schema Reference

### Relevant Tables

- **`article_snapshots`**: Contains article data with `source_name` (text field)
- **`raw_articles`**: Links to `news_sources` via `source_id` foreign key
- **`news_sources`**: Contains `logo_url` field for regular news sources
- **`external_sources`**: Contains `source_favicon` field for external sources (YouTube, Twitter, etc.)
- **`topic_snapshots`**: Contains `top_articles` JSONB field that needs to include favicon

### Key Fields

- `news_sources.logo_url` (text) - Favicon/logo URL for regular news sources
- `external_sources.source_favicon` (text) - Favicon URL for external sources
- `article_snapshots.source_name` (text) - Source name (used for matching, but not a foreign key)

## Testing Checklist

After implementing the changes, verify:

- [ ] Articles from regular news sources include `favicon` from `news_sources.logo_url`
- [ ] Articles from external sources include `favicon` from `external_sources.source_favicon`
- [ ] Articles without a matching source have `favicon` set to `null` or omitted
- [ ] The `top_articles` JSONB structure remains valid
- [ ] Existing functionality (topic snapshots, article counts, etc.) still works correctly

## Frontend Compatibility

The frontend has been updated to:

- Extract `favicon` from article data
- Display favicons next to source names (16x16px, rounded)
- Handle missing or broken favicon URLs gracefully
- Hide broken images automatically using error handlers

No additional frontend changes are required once the backend includes favicon data in `top_articles`.

## Questions or Issues

If you encounter any issues implementing these changes, please:

1. Verify the join conditions match your actual schema relationships
2. Check that `news_sources.logo_url` and `external_sources.source_favicon` contain valid URLs
3. Ensure the JSONB structure matches the expected format
4. Test with a small subset of topics first before applying to all data

