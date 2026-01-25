import { supabase } from '@/lib/supabase/client'

/**
 * Get a signed URL for an image stored in Supabase Storage (client-side)
 */
export async function getSignedImageUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) {
    return null
  }

  // Check if the URL is from Supabase Storage
  const supabaseStoragePattern = /supabase\.co\/storage\/v1\/object\/(public|sign|authenticated)\/([^/]+)\/(.+)$/
  const match = imageUrl.match(supabaseStoragePattern)

  if (match && supabase) {
    const [, accessType, bucket, path] = match

    try {
      if (accessType === 'public') {
        // Public bucket - no signing needed, return as is
        return imageUrl
      } else {
        // Private/authenticated bucket - need signed URL
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600) // 1 hour expiry

        if (error) {
          console.error('Error creating signed URL:', error)
          return null
        }

        return data?.signedUrl || null
      }
    } catch (error) {
      console.error('Error in getSignedImageUrl:', error)
      return null
    }
  }

  // Check if URL is from Azure Blob Storage or AWS S3
  const isAzureBlob = /\.blob\.core\.windows\.net/.test(imageUrl)
  const isAwsS3 = /s3\.amazonaws\.com/.test(imageUrl) || /s3\.[^.]*\.amazonaws\.com/.test(imageUrl)
  
  if (isAzureBlob || isAwsS3) {
    console.warn('Image URL requires backend signing:', {
      url: imageUrl,
      service: isAzureBlob ? 'Azure Blob Storage' : 'AWS S3',
      message: 'Backend must generate signed URLs before sending image_url field'
    })
    
    return null
  }

  // For other URLs, return as-is (assume they're public or already signed)
  return imageUrl
}

/**
 * Check if an image URL needs authentication
 */
export function needsAuthentication(imageUrl: string | null): boolean {
  if (!imageUrl) return false

  const authPatterns = [
    /supabase\.co\/storage\/v1\/object\/(sign|authenticated)/,
    /\.blob\.core\.windows\.net/,
    /s3\.amazonaws\.com/,
    /storage\.googleapis\.com/
  ]

  return authPatterns.some(pattern => pattern.test(imageUrl))
}

