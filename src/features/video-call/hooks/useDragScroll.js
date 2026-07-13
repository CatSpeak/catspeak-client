import { useRef, useEffect } from "react"

export const useDragScroll = (speed = 10, threshold = 60) => {
  const containerRef = useRef(null)
  const scrollInterval = useRef(null)

  const handleDragOverScroll = (e) => {
    if (!containerRef.current) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    const y = e.clientY
    const isNearTop = y - rect.top < threshold
    const isNearBottom = rect.bottom - y < threshold

    if (isNearTop) {
      startScrolling(-speed)
    } else if (isNearBottom) {
      startScrolling(speed)
    } else {
      stopScrolling()
    }
  }

  const startScrolling = (amount) => {
    if (scrollInterval.current) return
    scrollInterval.current = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += amount
      }
    }, 16)
  }

  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }
  }

  const isDragging = useRef(false)

  const handleDragLeaveScroll = (e) => {
    // If mouse leaves the container entirely, stop scrolling
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      stopScrolling()
    }
  }

  useEffect(() => {
    const handleEnd = () => stopScrolling()
    
    window.addEventListener("dragend", handleEnd)
    window.addEventListener("drop", handleEnd)
    window.addEventListener("mouseup", handleEnd)

    return () => {
      window.removeEventListener("dragend", handleEnd)
      window.removeEventListener("drop", handleEnd)
      window.removeEventListener("mouseup", handleEnd)
      stopScrolling()
    }
  }, [])

  return { containerRef, handleDragOverScroll, handleDragLeaveScroll }
}
