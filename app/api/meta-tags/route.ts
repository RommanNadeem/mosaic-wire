import { NextRequest, NextResponse } from 'next/server'
import { getTopicByShortIdServer } from '@/lib/supabase/queries'
import { processImageForMetaTags } from '@/utils/images/meta-processing'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash || !hash.startsWith('#news/')) {
      return NextResponse.json(
        { error: 'Invalid hash format' },
        { status: 400 }
      )
    }

    // Extract slug from hash (e.g., #news/slug-abc123 -> slug-abc123)
    const slug = hash.replace('#news/', '')
    const parts = slug.split('-')
    const shortId = parts[parts.length - 1]

    if (!shortId || shortId.length > 6) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      )
    }

    const topic = await getTopicByShortIdServer(shortId)

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    const origin = request.headers.get('host')
      ? `https://${request.headers.get('host')}`
      : 'https://mosaicbeat.com'
    
    const defaultImage = `${origin}/mosaicbeat-white.png`
    const rawImage = topic.image_url
    let imageUrl = defaultImage

    if (rawImage) {
      const processedUrl = await processImageForMetaTags(rawImage, origin)
      if (processedUrl) {
        imageUrl = processedUrl
      }
    }

    const title = topic.headline || 'MosaicBeat'
    const description = topic.summary || 'Real-time analysis of how Pakistan\'s news is told'
    const category = topic.tag || null
    const fullUrl = `${origin}/news/${slug}`

    return NextResponse.json({
      title,
      description,
      image: imageUrl,
      url: fullUrl,
      category,
      type: 'article',
    })
  } catch (error: any) {
    console.error('Error in meta-tags API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

