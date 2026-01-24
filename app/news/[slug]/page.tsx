import { getTopicBySlug } from '@/lib/supabase/queries'
import { transformTopicToNewsItem } from '@/utils/data/transformers'
import { generateNewsMetadata } from '@/utils/meta/generate'
import { processImageForMetaTags } from '@/utils/images/meta-processing'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = await getTopicBySlug(params.slug)
  
  if (!topic) {
    return {
      title: 'News Not Found - MosaicBeat',
    }
  }

  const newsItem = transformTopicToNewsItem(topic)
  if (!newsItem) {
    return {
      title: 'News Not Found - MosaicBeat',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mosaicbeat.com'
  const imageUrl = await processImageForMetaTags(newsItem.image, baseUrl)
  
  const metadata = generateNewsMetadata(newsItem, baseUrl)
  
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: newsItem.title,
      }] : metadata.openGraph?.images,
    },
    twitter: {
      ...metadata.twitter,
      images: imageUrl ? [imageUrl] : metadata.twitter?.images,
    },
  }
}

export default async function NewsPage({ params }: PageProps) {
  const topic = await getTopicBySlug(params.slug)
  
  if (!topic) {
    notFound()
  }

  const newsItem = transformTopicToNewsItem(topic)
  
  if (!newsItem) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          {newsItem.title}
        </h1>
        {newsItem.summary && (
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            {newsItem.summary}
          </p>
        )}
        {newsItem.sources && newsItem.sources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Sources
            </h2>
            <ul className="space-y-2">
              {newsItem.sources.map((source) => (
                <li key={source.id} className="text-sm text-[var(--text-secondary)]">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent-positive)]"
                  >
                    {source.headline} - {source.source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  )
}

