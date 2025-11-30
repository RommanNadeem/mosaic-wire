import { useState, useEffect } from 'react'
import Header from './components/Header'
import OverallSentiment from './components/OverallSentiment'
import NewsCard from './components/NewsCard'
import { sampleNewsData } from './data/sampleData'
import { getLatestTopicsSnapshot } from './lib/supabaseQueries'
import { transformSnapshotToNewsItems, calculateOverallSentimentFromSnapshot } from './utils/dataTransformers'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  const [newsItems, setNewsItems] = useState([])
  const [overallSentiment, setOverallSentiment] = useState({
    type: 'neutral',
    percentage: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingSampleData, setUsingSampleData] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Using sample data.')
        setNewsItems(sampleNewsData)
        setOverallSentiment(calculateOverallSentiment(sampleNewsData))
        setUsingSampleData(true)
        setLoading(false)
        return
      }

      try {
        // Fetch latest snapshot from topics_snapshots table
        const snapshot = await getLatestTopicsSnapshot()

        console.log('Fetched snapshot:', {
          snapshot: snapshot,
          hasTopics: snapshot?.topics?.length > 0,
          topicsCount: snapshot?.topics?.length || 0,
          sampleTopic: snapshot?.topics?.[0]
        })

        if (!snapshot) {
          throw new Error('No snapshot data found in topics_snapshots table')
        }

        // Transform snapshot data to match component structure
        const transformedItems = transformSnapshotToNewsItems(snapshot)
        
        console.log('Transformed items:', {
          count: transformedItems.length,
          itemsWithSources: transformedItems.filter(item => item.sources?.length > 0).length,
          sampleItem: transformedItems[0]
        })
        
        // Calculate overall sentiment from snapshot
        const overall = calculateOverallSentimentFromSnapshot(snapshot)

        setNewsItems(transformedItems)
        setOverallSentiment(overall)
        setUsingSampleData(false)
      } catch (err) {
        console.error('Error fetching data from Supabase:', err)
        setError(err.message)
        // Fallback to sample data on error
        setNewsItems(sampleNewsData)
        setOverallSentiment(calculateOverallSentiment(sampleNewsData))
        setUsingSampleData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate overall sentiment from news items (for sample data fallback)
  function calculateOverallSentiment(newsItems) {
    const sentiments = newsItems.flatMap(item => 
      item.sources.map(source => source.sentiment)
    )
    
    const sentimentCounts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {})

    const total = sentiments.length || 1
    const positive = (sentimentCounts.positive || 0) / total * 100
    const negative = (sentimentCounts.negative || 0) / total * 100
    const neutral = (sentimentCounts.neutral || 0) / total * 100

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
      percentage: Math.round(percentage),
      positive: Math.round(positive),
      negative: Math.round(negative),
      neutral: Math.round(neutral)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {usingSampleData && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Using sample data. Please configure Supabase environment variables to connect to your database.
            </p>
          </div>
        )}

        {error && !usingSampleData && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              ⚠️ Error loading data: {error}. Showing sample data as fallback.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading news...</p>
            </div>
          </div>
        ) : (
          <>
            <OverallSentiment sentiment={overallSentiment} />
            
            {newsItems.length === 0 ? (
              <div className="mt-8 text-center py-12">
                <p className="text-gray-600 text-lg">No news items found.</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsItems.map((item) => (
                  <NewsCard key={item.id} newsItem={item} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
