import { NextResponse } from 'next/server'
import { getLatestTopicsServer } from '@/lib/supabase/queries'
import { transformSupabaseData } from '@/utils/data/transformers'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'

/**
 * Google News Sitemap Route Handler
 * Generates XML sitemap for Google News indexing
 */
export async function GET() {
  try {
    // Fetch all topics from Supabase
    const topics = await getLatestTopicsServer()
    const newsItems = transformSupabaseData(topics)

    // Generate news sitemap entries
    // Google News sitemap should only include articles from the last 2 days
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const newsEntries = newsItems
      .filter((item) => {
        if (!item.updatedAt) return false
        const itemDate = new Date(item.updatedAt)
        return itemDate >= twoDaysAgo
      })
      .slice(0, 1000) // Google News limit is 1000 articles
      .map((item) => {
        const slug = `${item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}-${String(item.id).slice(-6)}`
        const lastMod = item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString()
        
        return `    <url>
      <loc>${BASE_URL}/news/${slug}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>hourly</changefreq>
      <priority>0.9</priority>
    </url>`
      })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsEntries.join('\n')}
</urlset>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating news sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}

