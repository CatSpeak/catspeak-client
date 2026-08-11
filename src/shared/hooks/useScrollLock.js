import { useEffect } from "react"

let lockCount = 0
let originalOverflow = ""
let originalPaddingRight = ""

/**
 * Locks the body scroll while preventing layout shift.
 * It measures the scrollbar width and applies it as padding-right,
 * simulating the behavior seen on modern sites like Facebook.
 * Uses reference counting to prevent layout/scroll state bugs when switching or nesting modals.
 *
 * @param {boolean} locked - Whether scroll should be locked
 */
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return

    if (lockCount === 0) {
      // Save original styles only on the first lock
      originalOverflow = document.body.style.overflow
      originalPaddingRight = document.body.style.paddingRight

      // Measure scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

      // Apply scroll lock and padding
      document.body.style.overflow = "hidden"
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
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [locked])
}

export default useScrollLock

