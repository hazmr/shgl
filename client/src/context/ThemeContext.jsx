import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Light/Dark theme provider. Persists to localStorage and toggles the
 * `dark` class on <html> so Tailwind v4 `dark:` variants activate.
 */
export const ThemeProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    let initial = 'light'
    try {
      const stored = localStorage.getItem('shgl-theme')
      if (stored === 'dark' || stored === 'light') {
        initial = stored
      } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    } catch (_) {
      /* ignore storage errors */
    }
    setTheme(initial)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    try {
      localStorage.setItem('shgl-theme', theme)
    } catch (_) {
      /* ignore */
    }
  }, [theme, isInitialized])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  )
}
