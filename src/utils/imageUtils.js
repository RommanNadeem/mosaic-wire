import { supabase } from '../lib/supabase'

/**
 * Get a signed URL for an image stored in Supabase Storage
 * @param {string} imageUrl - The image URL from the backend
 * @returns {Promise<string|null>} Signed URL or null if error
 */
export async function getSignedImageUrl(imageUrl) {
  if (!imageUrl) {
    return null
  }

  // Check if the URL is from Supabase Storage
  // Supabase Storage URLs typically look like: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
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

  // Check if URL is from Azure Blob Storage (common pattern for 403 errors)
  const isAzureBlob = /\.blob\.core\.windows\.net/.test(imageUrl)
  const isAwsS3 = /s3\.amazonaws\.com/.test(imageUrl) || /s3\.[^.]*\.amazonaws\.com/.test(imageUrl)
  
  if (isAzureBlob || isAwsS3) {
    // Azure Blob Storage and AWS S3 URLs need to be pre-signed by the backend
    // If we're getting 403 errors, the backend is sending unsigned URLs
    console.warn('Image URL requires backend signing:', {
      url: imageUrl,
      service: isAzureBlob ? 'Azure Blob Storage' : 'AWS S3',
      message: 'Backend must generate signed URLs before sending image_url field'
    })
    
    // Return null to prevent 403 errors - image won't display until backend fixes URLs
    return null
  }

  // For other URLs, return as-is (assume they're public or already signed)
  return imageUrl
}

/**
 * Handle image loading errors and provide fallback
 * @param {string} imageUrl - The image URL that failed
 * @param {Error} error - The error object
 */
export function handleImageError(imageUrl, error) {
  console.error('Image loading error:', {
    url: imageUrl,
    error: error.message || error,
    timestamp: new Date().toISOString()
  })

  // If it's a 403 error, it likely means the URL needs authentication
  if (error?.status === 403 || error?.message?.includes('403')) {
    console.warn('Image requires authentication. Backend should provide signed URLs for private storage.')
  }
}

/**
 * Check if an image URL needs authentication
 * @param {string} imageUrl - The image URL
 * @returns {boolean} True if URL might need authentication
 */
export function needsAuthentication(imageUrl) {
  if (!imageUrl) return false

  // Check for common patterns that indicate authentication is needed
  const authPatterns = [
    /supabase\.co\/storage\/v1\/object\/(sign|authenticated)/,
    /\.blob\.core\.windows\.net/, // Azure Blob Storage
    /s3\.amazonaws\.com/, // AWS S3
    /storage\.googleapis\.com/ // Google Cloud Storage
  ]

  return authPatterns.some(pattern => pattern.test(imageUrl))
}

