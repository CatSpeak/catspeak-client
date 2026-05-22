import { useState, useEffect, useCallback, useRef } from "react"

/**
 * High-performance hook to manage vertical scroll snapping, gesture locking,
 * keyboard controls, mouse wheel debouncing, and mute/volume states for Reels.
 *
 * @param {Object} props
 * @param {number} props.reelsCount - Total number of reels in the feed
 * @param {Function} props.onLoadMore - Callback to fetch more reels
 * @param {React.RefObject<HTMLDivElement>} props.containerRef - Ref to the scroll container
 * @param {string} props.initialReelId - Initial reel ID for deep link restoration
 */
export default function useReelNavigation({
  reelsCount,
  onLoadMore,
  containerRef,
  initialReelId,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("reelVolume")
    return saved !== null ? parseFloat(saved) : 0.5
  })
  const [isMuted, setIsMuted] = useState(true) // Muted by default for autoplay compliance

  const activeIndexRef = useRef(0)
  const isScrollingRef = useRef(false)

  // Trigger loadMore callback if close to the end
  useEffect(() => {
    if (activeIndex >= reelsCount - 2 && onLoadMore) {
      onLoadMore()
    }
  }, [activeIndex, reelsCount, onLoadMore])

  // Sync index to ref for event listener closures
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  // Save active index to session memory
  useEffect(() => {
    if (reelsCount > 0) {
      sessionStorage.setItem("lastReelIndex", String(activeIndex))
    }
  }, [activeIndex, reelsCount])

  // Save volume to localStorage on change
  const handleVolumeChange = useCallback((newVol) => {
    const vol = Math.max(0, Math.min(1, newVol))
    setVolume(vol)
    localStorage.setItem("reelVolume", String(vol))
    if (vol > 0) {
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  // Vibrate mobile device if supported
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10)
      } catch (e) {
        // Vibrate not allowed / ignored
      }
    }
  }, [])

  /**
   * Smoothly scrolls container to a specific index
   */
  const scrollToReel = useCallback(
    (index) => {
      const container = containerRef.current
      if (!container || isScrollingRef.current) return

      const targetIndex = Math.max(0, Math.min(reelsCount - 1, index))
      if (targetIndex === activeIndexRef.current) return

      const containerHeight = container.clientHeight
      const targetScrollTop = targetIndex * containerHeight

      // Safety guard: if we are already at the target scroll position, immediately sync and return without locking
      if (Math.abs(container.scrollTop - targetScrollTop) < 2) {
        isScrollingRef.current = false
        setIsScrolling(false)
        setActiveIndex(targetIndex)
        return
      }

      // Lock inputs during smooth transition to prevent scroll chasing
      isScrollingRef.current = true
      setIsScrolling(true)
      triggerHaptic()

      container.scrollTo({
        top: targetScrollTop,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      })

      // Sync local index state immediately
      setActiveIndex(targetIndex)
    },
    [containerRef, reelsCount, triggerHaptic]
  )

  const scrollNext = useCallback(() => {
    if (activeIndexRef.current < reelsCount - 1) {
      scrollToReel(activeIndexRef.current + 1)
    }
  }, [reelsCount, scrollToReel])

  const scrollPrev = useCallback(() => {
    if (activeIndexRef.current > 0) {
      scrollToReel(activeIndexRef.current - 1)
    }
  }, [scrollToReel])

  /* ── Input Event Listeners ───────────────────────────────── */

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e) => {
      // Ignore key events if user is typing in comments/inputs
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          scrollNext()
          break
        case "ArrowUp":
          e.preventDefault()
          scrollPrev()
          break
        case " ":
          e.preventDefault()
          // Find the active video tag and toggle play/pause
          const activeVideo = containerRef.current?.querySelector(
            `[data-index="${activeIndexRef.current}"] video`
          )
          if (activeVideo) {
            if (activeVideo.paused) {
              activeVideo.play().catch(() => {})
            } else {
              activeVideo.pause()
            }
          }
          break
        case "m":
        case "M":
          e.preventDefault()
          handleToggleMute()
          break
        default:
          break
      }
    },
    [scrollNext, scrollPrev, handleToggleMute, containerRef]
  )

  // Mouse wheel debouncer
  const handleWheel = useCallback(
    (e) => {
      const container = containerRef.current
      if (!container) return

      // Stop default snapping chasing on rapid scroll wheel spins
      e.preventDefault()

      if (isScrollingRef.current) return

      // Ignore low delta wheel micro-scrolls (e.g. momentum trackpads)
      if (Math.abs(e.deltaY) < 20) return

      if (e.deltaY > 0) {
        scrollNext()
      } else {
        scrollPrev()
      }
    },
    [scrollNext, scrollPrev, containerRef]
  )

  // Scroll settling detector to unlock scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollEnd = () => {
      isScrollingRef.current = false
      setIsScrolling(false)
      if (container.clientHeight > 0) {
        const index = Math.round(container.scrollTop / container.clientHeight)
        if (index >= 0 && index < reelsCount && index !== activeIndexRef.current) {
          setActiveIndex(index)
        }
      }
    }

    // 'scrollend' fires when scroll + snap is fully settled
    container.addEventListener("scrollend", handleScrollEnd)
    
    // Fallback for browsers without scrollend support
    let fallbackTimer
    const handleScroll = () => {
      clearTimeout(fallbackTimer)
      fallbackTimer = setTimeout(handleScrollEnd, 150)
    }
    container.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      container.removeEventListener("scrollend", handleScrollEnd)
      container.removeEventListener("scroll", handleScroll)
      clearTimeout(fallbackTimer)
    }
  }, [containerRef, reelsCount])

  // Event binders
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Wheel event must be non-passive to allow e.preventDefault()
    container.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("wheel", handleWheel)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [containerRef, handleWheel, handleKeyDown])

  return {
    activeIndex,
    setActiveIndex,
    isScrolling,
    volume,
    isMuted,
    setVolume: handleVolumeChange,
    setIsMuted,
    toggleMute: handleToggleMute,
    scrollToReel,
    scrollNext,
    scrollPrev,
  }
}
