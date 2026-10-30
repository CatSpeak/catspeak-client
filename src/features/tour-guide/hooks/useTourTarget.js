import { useState, useEffect, useCallback, useRef } from "react"

export const useTourTarget = (targetSelector, isOpen) => {
  const [targetRect, setTargetRect] = useState(null)
  const [isTargetReady, setIsTargetReady] = useState(false)
  const retryTimerRef = useRef(null)

  const updateRect = useCallback(() => {
    if (!targetSelector) {
      setTargetRect(null)
      setIsTargetReady(true)
      return true
    }

    const element = document.querySelector(targetSelector)
    if (!element) {
      return false
    }

    const rect = element.getBoundingClientRect()
    // Element might be detached or zero size
    if (rect.width === 0 && rect.height === 0) {
      return false
    }

    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
    })
    setIsTargetReady(true)
    return true
  }, [targetSelector])

  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null)
      setIsTargetReady(false)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      return
    }

    if (!targetSelector) {
      setTargetRect(null)
      setIsTargetReady(true)
      return
    }

    setIsTargetReady(false)

    // Attempt to locate target with retry backoff for dynamically rendered components
    let attempts = 0
    const maxAttempts = 15

    const attemptFind = () => {
      const element = document.querySelector(targetSelector)
      if (element) {
        // Scroll into view if out of viewport
        const rect = element.getBoundingClientRect()
        const isOutOfView =
          rect.top < 70 ||
          rect.bottom > window.innerHeight - 70 ||
          rect.left < 20 ||
          rect.right > window.innerWidth - 20

        if (isOutOfView) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          })
          // Wait slightly for smooth scroll to settle before taking exact coordinates
          setTimeout(() => {
            updateRect()
          }, 350)
        } else {
          updateRect()
        }
      } else if (attempts < maxAttempts) {
        attempts++
        retryTimerRef.current = setTimeout(attemptFind, 80)
      } else {
        // Fallback: ready without target rect
        setIsTargetReady(true)
      }
    }

    attemptFind()

    // Setup scroll and resize listeners for live rect recalculation
    let ticking = false
    const handleScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateRect()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("resize", handleScrollOrResize, { passive: true })
    window.addEventListener("scroll", handleScrollOrResize, { passive: true })

    // Observe element resize
    let observer = null
    const el = document.querySelector(targetSelector)
    if (el && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        handleScrollOrResize()
      })
      observer.observe(el)
    }

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      window.removeEventListener("resize", handleScrollOrResize)
      window.removeEventListener("scroll", handleScrollOrResize)
      if (observer) observer.disconnect()
    }
  }, [targetSelector, isOpen, updateRect])

  return { targetRect, isTargetReady }
}

export default useTourTarget
