import { useState, useEffect } from 'react'
import Header from './components/Header'
import OverallSentiment from './components/OverallSentiment'
import NewsCard from './components/NewsCard'
import Footer from './components/Footer'
import { useTheme } from './contexts/ThemeContext'
import { getLatestTopics } from './lib/supabaseQueries'
import { transformSupabaseData } from './utils/dataTransformers'
import { sampleNewsData } from './data/sampleData'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  const { theme } = useTheme()
  const [newsData, setNewsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingSampleData, setUsingSampleData] = useState(false)

  const getBackgroundClass = () => {
    return theme === 'light' ? 'bg-white' : 'bg-ground-dark'
  }

  const getTextClass = () => {
    return theme === 'light' ? 'text-ground-text-dark-primary' : 'text-ground-text-primary'
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        if (isSupabaseConfigured) {
          // Fetch all topics from Supabase (topics now have top_articles precomputed)
          const topics = await getLatestTopics()

          if (topics && topics.length > 0) {
            // Topics now include top_articles, so we don't need to fetch articles separately
            const transformedData = transformSupabaseData(topics)
            
            if (transformedData && transformedData.length > 0) {
              setNewsData(transformedData)
              setUsingSampleData(false)
            } else {
              // Transformation returned empty, use sample data
              setNewsData(sampleNewsData)
              setUsingSampleData(true)
            }
          } else {
            // No data in Supabase, use sample data
            setNewsData(sampleNewsData)
            setUsingSampleData(true)
          }
        } else {
          // Supabase not configured, use sample data
          setNewsData(sampleNewsData)
          setUsingSampleData(true)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Unknown error occurred')
        // Fallback to sample data on error
        console.log('Falling back to sample data due to error')
        setNewsData(sampleNewsData)
        setUsingSampleData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getBorderClass = () => {
    return theme === 'light' ? 'border-gray-200' : 'border-ground-dark-tertiary'
  }

  const getCardBgClass = () => {
    return theme === 'light' ? 'bg-white' : 'bg-ground-dark-secondary'
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${theme === 'light' ? 'border-gray-900' : 'border-ground-text-primary'}`}></div>
            <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-ground-text-secondary'}`}>Loading news...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && newsData.length === 0) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`${getCardBgClass()} border border-red-500 rounded-lg p-4`}>
            <p className="text-red-400">Error loading data: {error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} flex flex-col`}>
      <Header />
      
      {usingSampleData && (
        <div className={`${theme === 'light' ? 'bg-yellow-50 border-yellow-200' : 'bg-ground-dark-secondary border-ground-dark-tertiary'} border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className={`text-sm ${theme === 'light' ? 'text-yellow-800' : 'text-ground-text-tertiary'}`}>
              ⚠️ Using sample data. Configure Supabase to use real data.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {newsData.length > 0 ? (
          <>
            <OverallSentiment newsData={newsData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {newsData.map((item) => (
                <NewsCard key={item.id} newsItem={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className={theme === 'light' ? 'text-gray-600' : 'text-ground-text-secondary'}>No news data available.</p>
            {error && (
              <div className={`mt-4 ${getCardBgClass()} border border-red-500 rounded-lg p-4 max-w-md mx-auto`}>
                <p className="text-red-400 font-semibold">Error:</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <div className={`mt-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-ground-text-tertiary'} space-y-1`}>
              <p>NewsData length: {newsData.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Using sample data: {usingSampleData ? 'Yes' : 'No'}</p>
              <p>Supabase configured: {isSupabaseConfigured ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default App
