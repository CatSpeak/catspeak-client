import { useEffect } from "react"

let lockCount = 0
let originalOverflow = ""
let originalPaddingRight = ""
let originalPosition = ""
let originalTop = ""
let originalWidth = ""
let lockedScrollY = 0

/**
 * Locks the body scroll while preventing layout shift.
 * Pins the body with position:fixed (iOS-safe: touch scrolling cannot
 * reach the page underneath) and restores the previous scroll offset
 * on unlock. Uses reference counting to keep nested locks correct.
 *
 * @param {boolean} locked - Whether scroll should be locked
 */
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return

    if (lockCount === 0) {
      // Save original styles only on the first lock
      lockedScrollY = window.scrollY
      originalOverflow = document.body.style.overflow
      originalPaddingRight = document.body.style.paddingRight
      originalPosition = document.body.style.position
      originalTop = document.body.style.top
      originalWidth = document.body.style.width

      // Measure scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

      // Pin the body so iOS Safari cannot scroll the page behind overlays
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = `-${lockedScrollY}px`
      document.body.style.width = "100%"
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    }

    lockCount++

    return () => {
      lockCount = Math.max(0, lockCount - 1)

      if (lockCount === 0) {
        // Restore original styles only when all locks are released
        document.body.style.overflow = originalOverflow
        document.body.style.position = originalPosition
        document.body.style.top = originalTop
        document.body.style.width = originalWidth
        document.body.style.paddingRight = originalPaddingRight
        window.scrollTo(0, lockedScrollY)
      }
    }
  }, [locked])
}

export default useScrollLock
