import { useState, useEffect } from "react"

const MOBILE_MAX = 640 // ≤640px → touch scroll (returns null)
const DESKTOP_MIN = 1024 // ≥1024px → 4 cards, 641px–1023px → 2 cards

/**
 * Returns the number of visible carousel items per breakpoint.
 * - Mobile (≤640px): returns null (touch-scroll mode, no pagination buttons)
 * - Tablet / half-screen (641px–1023px): returns 2 (2 cards, pagination buttons, no scroll)
 * - Desktop (≥1024px): returns 4 (4 cards, pagination buttons, no scroll)
 * @returns {number | null}
 */
const useResponsiveItemsPerPage = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : DESKTOP_MIN,
  )

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (width <= MOBILE_MAX) return null // mobile: touch scroll without pagination buttons
  if (width < DESKTOP_MIN) return 2 // tablet / half-screen: 2 cards with pagination
  return 4 // desktop: 4 columns
}

export default useResponsiveItemsPerPage
