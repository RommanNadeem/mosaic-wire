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
    
    // Silently copy to clipboard - no dialogs or prompts
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

