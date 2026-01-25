import { getLatestTopicsServer } from '@/lib/supabase/queries'
import { transformSupabaseData } from '@/utils/data/transformers'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import HomePageClient from './HomePageClient'
import { sampleNewsData } from '@/data/sampleData'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
          console.warn('Supabase topics found, but transformation resulted in empty array.')
          newsData = sampleNewsData
          usingSampleData = true
        }
      } else {
        console.warn('Supabase returned no topics.')
        newsData = sampleNewsData
        usingSampleData = true
      }
    } catch (error) {
      console.error('Critical error fetching from Supabase:', error)
      newsData = sampleNewsData
      usingSampleData = true
    }
  } else {
    newsData = sampleNewsData
    usingSampleData = true
  }

  return <HomePageClient initialNewsData={newsData} usingSampleData={usingSampleData} />
}

