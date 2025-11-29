# MosaicWire - News Aggregator

A modern, clean news aggregation website that displays news articles with AI-generated summaries, sentiment analysis, and source tracking.

## Features

- **Overall Sentiment Tracking**: View the aggregate sentiment across all news sources
- **Individual News Cards**: Detailed view of each news story with:
  - Category tags
  - AI-generated summary
  - Sentiment analysis (positive/negative/neutral with percentages)
  - Multiple source links with headlines
  - Quotes from analysts/experts
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Source Attribution**: Hyperlinked source headlines with color-coded sentiment indicators

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for production) - optional for development (uses sample data)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase (optional):
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   - If not configured, the app will use sample data

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase (for data)
- Modern JavaScript (ES6+)

## Supabase Integration

The application reads from Supabase views:

- **`latest_topics_view`**: Contains all latest topics with article counts and sentiment
- **`latest_articles_view`**: Contains all latest articles with full details

### Data Flow

1. App fetches topics from `latest_topics_view`
2. App fetches articles from `latest_articles_view`
3. Articles are grouped by topic_id
4. Data is transformed to match component structure
5. Overall sentiment is calculated from all articles

### Views Schema

The views must contain the following fields:

**latest_topics_view:**
- `id`, `topic_name`, `category`, `date`, `ai_summary`, `overall_sentiment`, `article_count`, `snapshot_timestamp`, `created_at`

**latest_articles_view:**
- `id`, `topic_name`, `topic_id`, `headline`, `hyperlink`, `excerpt`, `summary`, `sentiment`, `date_time`, `news_source`, `category`, `snapshot_timestamp`, `created_at`

## Project Structure

```
src/
  components/
    Header.jsx          # Site header/navigation
    OverallSentiment.jsx # Overall sentiment bar
    NewsCard.jsx        # Individual news article card
    SentimentBar.jsx    # Sentiment visualization
    SourceList.jsx      # List of news sources
  data/
    sampleData.js       # Sample news data (fallback)
  lib/
    supabase.js         # Supabase client configuration
    supabaseQueries.js  # Data fetching functions
  utils/
    dataTransformers.js # Transform Supabase data to component format
  types/
    index.js            # Type definitions
  App.jsx               # Main application component
  main.jsx              # Application entry point
  index.css             # Global styles
```

## License

MIT
