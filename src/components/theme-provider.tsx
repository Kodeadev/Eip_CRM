'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'obsidian-gold' | 'arctic-slate' | 'midnight-emerald'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('obsidian-gold')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('eip-crm-theme') as Theme
    if (savedTheme && ['obsidian-gold', 'arctic-slate', 'midnight-emerald'].includes(savedTheme)) {
      setThemeState(savedTheme)
    } else {
      setThemeState('obsidian-gold')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Remove all old theme classes
    root.classList.remove('theme-obsidian-gold', 'theme-arctic-slate', 'theme-midnight-emerald')
    
    // Add new theme class
    root.classList.add(`theme-${theme}`)
    
    // Ensure .dark class is added to html for dark themes, but removed for arctic-slate (light theme)
    if (theme === 'arctic-slate') {
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
    }

    localStorage.setItem('eip-crm-theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
