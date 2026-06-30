import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the current viewport matches a CSS media query.
 * @param {string} query - The CSS media query to evaluate (e.g., '(max-width: 768px)').
 * @returns {boolean} True if the media query matches, false otherwise.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)
    // Set initial value
    setMatches(media.matches)

    // Listener for changes
    const listener = (event) => setMatches(event.matches)
    
    // Fallback for older browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener)
    } else {
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

export default useMediaQuery
