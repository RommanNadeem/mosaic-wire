import { createServerClient } from '@/lib/supabase/server'

/**
 * Resolve display URL for an image (server-side).
 * For Supabase: returns public URL as-is, or creates a signed URL for private buckets.
 * For other absolute URLs, returns as-is. Used for LCP hero images so the browser
 * can start loading without waiting for client-side getSignedImageUrl.
 */
export async function getDisplayImageUrlServer(
  imageUrl: string | null
): Promise<string | null> {
  if (!imageUrl) return null

  const supabaseStoragePattern =
    /supabase\.co\/storage\/v1\/object\/(public|sign|authenticated)\/([^/]+)\/(.+)$/
  const match = imageUrl.match(supabaseStoragePattern)

  if (match) {
    const [, accessType, bucket, path] = match
    const supabase = createServerClient()

    if (accessType === 'public') {
      return imageUrl
    }
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600)
        if (error) {
          console.error('Server getDisplayImageUrlServer signed URL error:', error)
          return null
        }
        return data?.signedUrl ?? null
      } catch (err) {
        console.error('Server getDisplayImageUrlServer error:', err)
        return null
      }
    }
    return null
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  return imageUrl
}
