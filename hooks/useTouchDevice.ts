'use client'

import { useState, useEffect } from 'react'

interface UseTouchDeviceReturn {
  isTouchDevice: boolean
  isMobile: boolean
}

export function useTouchDevice(): UseTouchDeviceReturn {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const touchDevice = 
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      
      const mobile = window.innerWidth < 640 || touchDevice
      
      setIsTouchDevice(touchDevice)
      setIsMobile(mobile)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return { isTouchDevice, isMobile }
}

