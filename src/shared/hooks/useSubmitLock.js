import { useCallback, useRef } from "react"

/**
 * Synchronous double-submit prevention hook backed by a ref so rapid repeated
 * clicks or Enter key presses cannot dispatch duplicate mutations before React
 * re-renders loading states.
 */
export function useSubmitLock() {
  const inFlightRef = useRef(false)

  const runLocked = useCallback(async (task) => {
    if (inFlightRef.current) return undefined
    inFlightRef.current = true
    try {
      return await task()
    } finally {
      inFlightRef.current = false
    }
  }, [])

  return { inFlightRef, runLocked }
}
