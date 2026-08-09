import { useState, useEffect } from "react"

/**
 * Custom hook to dynamically calculate grid/masonry column count based on viewport width.
 *
 * @param {Object} breakpoints - Optional min-width breakpoint thresholds { xl, md, sm }
 * @returns {number} The current responsive column count.
 */
export const useColumnCount = (
  breakpoints = { xl: 1280, md: 768, sm: 480 },
) => {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= (breakpoints.xl ?? 1280)) setCols(4)
      else if (w >= (breakpoints.md ?? 768)) setCols(3)
      else if (w >= (breakpoints.sm ?? 480)) setCols(2)
      else setCols(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoints.xl, breakpoints.md, breakpoints.sm])

  return cols
}

export default useColumnCount
