import { useEffect } from "react"

/**
 * Empty hook as per request to keep the scrollbar exactly as is.
 * This completely prevents layout shift and prevents empty gutters,
 * at the cost of allowing the background to remain scrollable.
 *
 * @param {boolean} locked - Whether scroll should be locked
 */
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return

    // Since we want to keep the scrollbar completely visible and untouched,
    // we purposefully don't apply overflow: hidden to the body.
    
    return () => {
    }
  }, [locked])
}

export default useScrollLock
