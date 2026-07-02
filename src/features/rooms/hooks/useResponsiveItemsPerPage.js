import { useState, useEffect } from "react"

const MOBILE_MAX = 425 // ≤425px → touch scroll (returns null)
const DESKTOP_MIN = 1024 // ≥1024px → 4 cards, below → 2 cards

/**
 * Returns the number of visible carousel items per breakpoint.
 * Returns null on mobile/tablet (≤1024px) to signal touch-scroll mode instead of button carousel.
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

  if (width <= DESKTOP_MIN) return null // mobile & tablet: use touch scroll
  return 4 // desktop: 4 columns
}

export default useResponsiveItemsPerPage
