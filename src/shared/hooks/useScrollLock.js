import { useEffect } from "react"

/**
 * Locks the body scroll while preventing layout shift.
 * It measures the scrollbar width and applies it as padding-right,
 * simulating the behavior seen on modern sites like Facebook.
 *
 * @param {boolean} locked - Whether scroll should be locked
 */
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return

    // Measure scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Save original styles
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Apply scroll lock and padding
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [locked])
}

export default useScrollLock
