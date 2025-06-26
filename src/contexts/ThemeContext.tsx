import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Hook to use theme context - kept in same file to avoid circular dependencies
const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from data-theme attribute set by the blocking script for better reliability
    if (typeof document !== 'undefined') {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme
      }
      // Fallback to class check
      if (document.documentElement.classList.contains('dark')) {
        return 'dark'
      }
    }
    return 'light'
  })

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const isDark = theme === 'dark'

  useEffect(() => {
    // Save to localStorage (guard against SSR/test environments)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme)
    }

    // Update document class and data attribute (guard against SSR/test environments)
    if (typeof document !== 'undefined') {
      // Temporarily add class to prevent transitions during theme change
      document.documentElement.classList.add('theme-transitioning')

      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }

      // Remove transition-blocking class after a short delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('theme-transitioning')
        })
      })
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    // Guard against environments where window.matchMedia is not available (like tests)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      // Additional guard to ensure mediaQuery has the addEventListener method
      if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
        const handleChange = (e: MediaQueryListEvent) => {
          // Only update if user hasn't set a manual preference
          if (typeof localStorage !== 'undefined' && !localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light')
          }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => {
          if (typeof mediaQuery.removeEventListener === 'function') {
            mediaQuery.removeEventListener('change', handleChange)
          }
        }
      }
    }
    // Return undefined for environments where matchMedia is not available
    return undefined
  }, [])

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Export hook separately - keeping in same file due to tight coupling with context
// eslint-disable-next-line react-refresh/only-export-components
export { useTheme }
