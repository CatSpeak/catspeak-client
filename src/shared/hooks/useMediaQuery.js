import { useSyncExternalStore, useCallback } from "react"

/**
 * Custom hook to detect if the current viewport matches a CSS media query.
 * @param {string} query - The CSS media query to evaluate (e.g., '(max-width: 768px)').
 * @returns {boolean} True if the media query matches, false otherwise.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      if (typeof window === "undefined") return () => {}
      const media = window.matchMedia(query)
      if (media.addEventListener) {
        media.addEventListener("change", callback)
      } else {
        media.addListener(callback)
      }
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener("change", callback)
        } else {
          media.removeListener(callback)
        }
      }
    },
    [query],
  )

  const getSnapshot = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  }

  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useMediaQuery
