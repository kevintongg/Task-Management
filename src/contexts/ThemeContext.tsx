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
    // Since the theme is already applied by the blocking script,
    // we just need to read the current state
    if (typeof document !== 'undefined' && document.documentElement?.classList.contains('dark')) {
      return 'dark'
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

    // Update document class with smooth transition (guard against SSR/test environments)
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
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
