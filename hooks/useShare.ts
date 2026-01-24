'use client'

import { useState, useCallback } from 'react'
import { generateNewsUrl } from '@/utils/routing/navigation'

interface UseShareReturn {
  shareCopied: boolean
  handleShare: (newsItem: { id: string; title: string }) => Promise<void>
}

export function useShare(
  onShare?: (url: string) => void
): UseShareReturn {
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = useCallback(async (newsItem: { id: string; title: string }) => {
    const shareUrl = generateNewsUrl(newsItem.title, newsItem.id)
    const shareTitle = newsItem.title || 'Check out this news on MosaicBeat'
    
    // Check if device is mobile or tablet
    const isMobileOrTablet = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 640

    // Use native share on mobile/tablet
    if (navigator.share && isMobileOrTablet) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        })
        
        if (onShare) {
          onShare(shareUrl)
        }
        return
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
        // Fall through to clipboard
      }
    }
    
    // Copy to clipboard
    const textToCopy = isMobileOrTablet ? `${shareTitle}\n\n${shareUrl}` : shareUrl
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 3000)
      
      if (onShare) {
        onShare(shareUrl)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 3000)
    }
  }, [onShare])

  return {
    shareCopied,
    handleShare,
  }
}

