'use client'

import { useState, useCallback } from 'react'

interface UseTooltipReturn {
  openTooltip: string | null
  setOpenTooltip: (id: string | null) => void
  handleTooltipOpen: (id: string) => void
  handleTooltipClose: () => void
}

export function useTooltip(): UseTooltipReturn {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  const handleTooltipOpen = useCallback((id: string) => {
    setOpenTooltip(id)
  }, [])

  const handleTooltipClose = useCallback(() => {
    setOpenTooltip(null)
  }, [])

  return {
    openTooltip,
    setOpenTooltip,
    handleTooltipOpen,
    handleTooltipClose,
  }
}

