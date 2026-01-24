import { generateNewsUrl } from '@/utils/routing/navigation'

export function generateNewsMetadata(newsItem: any, baseUrl: string) {
  const imageUrl = `${baseUrl}/mosaicbeat-white.png` // Default image
  
  return {
    title: newsItem.title || 'MosaicBeat',
    description: newsItem.summary || 'Real-time analysis of how Pakistan\'s news is told',
    openGraph: {
      title: newsItem.title,
      description: newsItem.summary,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: newsItem.title,
      }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: newsItem.title,
      description: newsItem.summary,
      images: [imageUrl],
    },
  }
}

export function generateDefaultMetadata() {
  return {
    title: 'MosaicBeat - Real-time analysis of how Pakistan\'s news is told',
    description: 'Real-time analysis of how Pakistan\'s news is told',
  }
}

