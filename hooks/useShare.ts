'use client'

import { useState, useCallback } from 'react'
import { generateNewsUrl } from '@/utils/routing/navigation'

interface UseShareReturn {
  shareCopied: boolean
  handleShare: (newsItem: { id: string; title: string; summary?: string }) => Promise<void>
}

export function useShare(
  onShare?: (url: string) => void
): UseShareReturn {
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = useCallback(async (newsItem: { id: string; title: string; summary?: string }) => {
    const shareUrl = generateNewsUrl(newsItem.title, newsItem.id)
    
    // Try Web Share API first (works on mobile devices)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const shareData: ShareData = {
          title: newsItem.title,
          text: newsItem.summary || newsItem.title,
          url: shareUrl,
        }
        
        await navigator.share(shareData)
        
        // Share was successful
        if (onShare) {
          onShare(shareUrl)
        }
        return
      } catch (err: any) {
        // User cancelled the share or an error occurred
        // If user cancelled (AbortError), don't fall through to clipboard
        if (err.name === 'AbortError') {
          return
        }
        // For other errors, fall through to clipboard copy
        console.error('Web Share API failed:', err)
      }
    }
    
    // Fallback: Copy to clipboard (for desktop or when Web Share API is not available)
    try {
      // Modern clipboard API (works silently when triggered by user interaction)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2500)
        
        if (onShare) {
          onShare(shareUrl)
        }
        return
      }
    } catch (err) {
      // If clipboard API fails, fall through to fallback method
      console.error('Clipboard API failed:', err)
    }
    
    // Fallback for older browsers (also silent, no prompts)
    try {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
      
      if (onShare) {
        onShare(shareUrl)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      // Even if copy fails, show feedback
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }, [onShare])

  return {
    shareCopied,
    handleShare,
  }
}

