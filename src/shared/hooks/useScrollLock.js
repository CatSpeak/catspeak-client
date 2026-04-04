import { useEffect } from "react"

/**
 * Locks body scroll and handles scrollbar-gutter compensation.
 * Use in modals, drawers, and any overlay that needs to prevent background scrolling.
 *
 * @param {boolean} locked - Whether scroll should be locked
 */
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return

    const html = document.documentElement
    const scrollbarWidth = window.innerWidth - html.clientWidth

    // Save originals
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const originalScrollbarGutter = html.style.scrollbarGutter

    // Compensate for disappearing scrollbar to prevent layout shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `calc(${originalPaddingRight || "0px"} + ${scrollbarWidth}px)`
    }
    document.body.style.overflow = "hidden"
    html.style.scrollbarGutter = "auto"

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      html.style.scrollbarGutter = originalScrollbarGutter
    }
  }, [locked])
}

export default useScrollLock
