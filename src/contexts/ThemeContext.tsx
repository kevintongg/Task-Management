import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
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
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      return savedTheme
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  const toggleTheme = () => {
    // Temporarily disable transitions to prevent white flash
    const css = document.createElement('style')
    css.type = 'text/css'
    css.appendChild(
      document.createTextNode(
        `* {
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }`
      )
    )
    document.head.appendChild(css)

    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.head.removeChild(css)
    }, 100)
  }

  const isDark = theme === 'dark'

  useEffect(() => {
    // Temporarily disable transitions to prevent white flash
    const disableTransitions = () => {
      const css = document.createElement('style')
      css.type = 'text/css'
      css.id = 'disable-transitions'
      css.appendChild(
        document.createTextNode(
          `*, *::before, *::after {
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
        }`
        )
      )
      document.head.appendChild(css)

      return css
    }

    const enableTransitions = (css: HTMLStyleElement) => {
      if (css && css.parentNode) {
        css.parentNode.removeChild(css)
      }
    }

    // Disable transitions
    const transitionDisabler = disableTransitions()

    // Save to localStorage
    localStorage.setItem('theme', theme)

    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Re-enable transitions after DOM update
    setTimeout(() => {
      enableTransitions(transitionDisabler)
    }, 50)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
