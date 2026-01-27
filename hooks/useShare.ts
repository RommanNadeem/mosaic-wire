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
    // We intentionally avoid using native share + clipboard APIs to prevent triggering
    // device-related permission prompts in some environments.
    // The simplest universal behavior: show the URL and let the user copy manually.
    try {
      window.prompt('Copy link:', shareUrl)
    } catch {
      // no-op
    }

    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2500)

    if (onShare) {
      onShare(shareUrl)
    }
  }, [onShare])

  return {
    shareCopied,
    handleShare,
  }
}

