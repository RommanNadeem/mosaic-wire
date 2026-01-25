'use client'

import { useState, useEffect } from 'react'
import { getSignedImageUrl } from '@/utils/images/signed-urls'

interface UseImageReturn {
  imageUrl: string | null
  imageError: boolean
  isLoading: boolean
}

export function useImage(imageUrl: string | null): UseImageReturn {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!imageUrl) {
      setUrl(null)
      setError(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(false)

    getSignedImageUrl(imageUrl)
      .then((signedUrl) => {
        if (signedUrl) {
          setUrl(signedUrl)
          setError(false)
        } else {
          setError(true)
          setUrl(null)
        }
      })
      .catch((err) => {
        console.error('Error getting signed image URL:', err)
        setError(true)
        setUrl(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [imageUrl])

  return { imageUrl: url, imageError: error, isLoading }
}

