import { getLatestTopicsServer } from '@/lib/supabase/queries'
import { transformSupabaseData } from '@/utils/data/transformers'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { generateWebSiteSchema, generateItemListSchema, generateFAQSchema, generateHowToSchema } from '@/utils/seo/structured-data'
import { generatePlatformFAQSchema } from '@/utils/seo/ai-optimization'
import { getDisplayImageUrlServer } from '@/utils/images/server-url'
import HomePageClient from './HomePageClient'
import { sampleNewsData } from '@/data/sampleData'
import Script from 'next/script'

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

  const websiteSchema = generateWebSiteSchema()
  const itemListSchema = generateItemListSchema(newsData)
  const faqSchema = generateFAQSchema()
  const howToSchema = generateHowToSchema()
  const platformFAQSchema = generatePlatformFAQSchema()

  const featuredImageUrl = newsData.length > 0
    ? await getDisplayImageUrlServer(newsData[0].image ?? null)
    : null

  return (
    <>
      {/* Structured Data Schemas */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="platform-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(platformFAQSchema) }}
      />
      <HomePageClient
        initialNewsData={newsData}
        usingSampleData={usingSampleData}
        featuredImageUrl={featuredImageUrl}
      />
    </>
  )
}

