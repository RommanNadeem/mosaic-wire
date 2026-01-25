'use client'

import { useState, useEffect, createContext, useContext } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: (newTheme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with a default theme to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage/system preference after mount
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('mosaicbeat-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
      return
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save theme to localStorage
      localStorage.setItem('mosaicbeat-theme', theme)
      
      // Apply theme data attribute for CSS variables
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

