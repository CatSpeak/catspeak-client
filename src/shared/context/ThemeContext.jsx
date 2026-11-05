import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"

export const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
})

export const ThemeProvider = ({ children }) => {
  // System OS color scheme tracking
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
      }
    } catch {
      // Fallback
    }
    return false
  })

  // Listen to live OS theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches)
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else if (mediaQuery.addListener) {
      // Legacy browser support
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  // Saved theme or default to "system"
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("theme")
      if (saved === "dark" || saved === "light" || saved === "system") {
        return saved
      }
      return "system"
    } catch {
      return "system"
    }
  })

  // Dynamically resolve whether dark mode styles should apply
  const isDark = theme === "system" ? systemPrefersDark : theme === "dark"
  const resolvedTheme = isDark ? "dark" : "light"

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
    try {
      localStorage.setItem("theme", theme)
    } catch {
      // Storage unavailable
    }
  }, [theme, isDark])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === "light") return "dark"
      if (prev === "dark") return "system"
      return "light"
    })
  }, [])

  const setTheme = useCallback((newTheme) => {
    if (newTheme === "dark" || newTheme === "light" || newTheme === "system") {
      setThemeState(newTheme)
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, resolvedTheme, isDark, toggleTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export default ThemeContext

