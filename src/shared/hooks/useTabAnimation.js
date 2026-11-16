import { useState, useEffect, useCallback } from "react"
import { useReducedMotion } from "framer-motion"

export const TAB_ANIMATION_STORAGE_KEY = "catspeak_tab_animations_enabled"
const TAB_ANIMATION_EVENT = "catspeak:tab-animation-change"

/**
 * Hook to manage user preference for tab transition animations.
 * Returns whether animations should be reduced/disabled based on both
 * system prefers-reduced-motion AND the user's in-app preference.
 */
export const useTabAnimation = () => {
  const osReducedMotion = useReducedMotion()
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    if (typeof window === "undefined") return true
    try {
      const saved = localStorage.getItem(TAB_ANIMATION_STORAGE_KEY)
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === TAB_ANIMATION_STORAGE_KEY && e.newValue !== null) {
        try {
          setAnimationsEnabled(JSON.parse(e.newValue))
        } catch {
          // fallback
        }
      }
    }

    const handleCustomChange = (e) => {
      setAnimationsEnabled(Boolean(e.detail))
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(TAB_ANIMATION_EVENT, handleCustomChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(TAB_ANIMATION_EVENT, handleCustomChange)
    }
  }, [])

  const setTabAnimationPreference = useCallback((enabled) => {
    setAnimationsEnabled(enabled)
    try {
      localStorage.setItem(TAB_ANIMATION_STORAGE_KEY, JSON.stringify(enabled))
      window.dispatchEvent(
        new CustomEvent(TAB_ANIMATION_EVENT, { detail: enabled }),
      )
    } catch {
      // storage unavailable
    }
  }, [])

  const shouldReduceMotion = osReducedMotion || !animationsEnabled

  return {
    animationsEnabled,
    setTabAnimationPreference,
    shouldReduceMotion,
  }
}

export default useTabAnimation
