import { getLatestTopicsServer } from '@/lib/supabase/queries'
import { transformSupabaseData } from '@/utils/data/transformers'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import HomePageClient from './HomePageClient'
import { sampleNewsData } from '@/data/sampleData'

export default async function HomePage() {
  let newsData = []
  let usingSampleData = false

  if (isSupabaseConfigured) {
    try {
      const topics = await getLatestTopicsServer()
      
      if (topics && topics.length > 0) {
        const transformedData = transformSupabaseData(topics)
        
        if (transformedData && transformedData.length > 0) {
          newsData = transformedData
        } else {
          newsData = sampleNewsData
          usingSampleData = true
        }
      } else {
        newsData = sampleNewsData
        usingSampleData = true
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      newsData = sampleNewsData
      usingSampleData = true
    }
  } else {
    newsData = sampleNewsData
    usingSampleData = true
  }

  return <HomePageClient initialNewsData={newsData} usingSampleData={usingSampleData} />
}

