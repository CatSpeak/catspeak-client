import React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/shared/context/ThemeContext"
import IconButton from "./buttons/IconButton"

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <IconButton
      variant="ghost"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`text-gray-600 dark:text-[#AAAAAA] hover:text-gray-900 dark:hover:text-white ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 transition-transform duration-200" />
      )}
    </IconButton>
  )
}

export default ThemeToggle

