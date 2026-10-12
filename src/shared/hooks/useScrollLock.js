import { useLayoutEffect, useEffect } from "react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

let lockCount = 0
let gapReserveCount = 0
let originalOverflow = ""
let originalPaddingRight = ""
let originalPosition = ""
let originalTop = ""
let originalWidth = ""
let lockedScrollY = 0

/**
 * Locks the body scroll while preventing layout shift.
 * Uses reference counting to prevent layout/scroll state bugs when switching or nesting modals,
 * and when transitioning across routes (such as entering/exiting fullscreen video call layouts).
 *
 * @param {boolean} locked - Whether scroll should be locked
 * @param {object} [options]
 * @param {boolean} [options.reserveScrollBarGap=true] - Whether to apply padding-right to body to avoid layout shift
 */
const useScrollLock = (locked, { reserveScrollBarGap = true } = {}) => {
  useIsomorphicLayoutEffect(() => {
    if (!locked) return

    if (lockCount === 0) {
      // Save original styles only on the first lock across the application.
      // If document.body.style.overflow is already "hidden" (e.g. from an unclean or race state),
      // do not save "hidden" as original.
      const currentOverflow = document.body.style.overflow
      originalOverflow = currentOverflow !== "hidden" ? currentOverflow : ""
      originalPaddingRight = document.body.style.paddingRight || ""

      // Measure scrollbar width before locking overflow to prevent layout shift
      if (reserveScrollBarGap) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`
        }
      }

      document.body.style.overflow = "hidden"
    } else if (reserveScrollBarGap && gapReserveCount === 0) {
      // Another lock was already active without gap reservation; measure and apply if needed
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    }

    lockCount++
    if (reserveScrollBarGap) {
      gapReserveCount++
    }

    return () => {
      if (reserveScrollBarGap) {
        gapReserveCount = Math.max(0, gapReserveCount - 1)
        if (gapReserveCount === 0 && lockCount > 1) {
          // If no more locks require the scrollbar gap, restore padding-right even if still locked
          document.body.style.paddingRight = originalPaddingRight || ""
        }
      }

      lockCount = Math.max(0, lockCount - 1)

      if (lockCount === 0) {
        // Restore original styles only when all locks are released
        document.body.style.overflow =
          originalOverflow && originalOverflow !== "hidden"
            ? originalOverflow
            : ""
        document.body.style.paddingRight = originalPaddingRight || ""
        originalOverflow = ""
        originalPaddingRight = ""
        gapReserveCount = 0
      }
    }
  }, [locked, reserveScrollBarGap])
}

export default useScrollLock
