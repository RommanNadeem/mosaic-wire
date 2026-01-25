/**
 * Process image URL for meta tags (server-side)
 * Converts Supabase Storage URLs to publicly accessible format
 */
export async function processImageForMetaTags(
  imageUrl: string | null,
  origin: string
): Promise<string | null> {
  if (!imageUrl) return null

  const defaultImage = `${origin}/mosaicbeat-white.png`
  
  // Check if URL is from Supabase Storage
  const supabaseStoragePattern = /(https?:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/)(sign|authenticated|public)\/([^\/]+)\/(.+)$/
  const match = imageUrl.match(supabaseStoragePattern)

  if (match) {
    const [, baseUrl, accessType] = match
    // Convert sign/authenticated URLs to public for meta tags
    if (accessType === 'sign' || accessType === 'authenticated') {
      return imageUrl.replace(`/${accessType}/`, '/public/')
    }
    return imageUrl
  }

  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If it's a relative URL, make it absolute
  return `${origin}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
}

