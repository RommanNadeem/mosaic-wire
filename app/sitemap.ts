import { MetadataRoute } from 'next'
import { getLatestTopicsServer } from '@/lib/supabase/queries'
import { transformSupabaseData } from '@/utils/data/transformers'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]

  try {
    // Fetch all topics from Supabase
    const topics = await getLatestTopicsServer()
    const newsItems = transformSupabaseData(topics)

    // Generate sitemap entries for each news article
    const newsEntries: MetadataRoute.Sitemap = newsItems.map((item) => {
      const slug = `${item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}-${String(item.id).slice(-6)}`
      
      return {
        url: `${BASE_URL}/news/${slug}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }
    })

    return [...baseEntries, ...newsEntries]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return baseEntries
  }
}

