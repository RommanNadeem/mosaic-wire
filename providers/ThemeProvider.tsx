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
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mosaicbeat-theme')
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    
    // Default to light theme
    return 'light'
  })

  useEffect(() => {
    // Save theme to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mosaicbeat-theme', theme)
      
      // Apply theme data attribute for CSS variables
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

