import React, { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import useScrollLock from "@/shared/hooks/useScrollLock"

/**
 * A reusable interactive media lightbox modal supporting single media or playlist browsing,
 * whole-overlay drag panning, mousewheel zoom, mobile touch swipe gestures, and keyboard navigation.
 * @param {Object} props
 * @param {string|Object} [props.media] - Single image URL string or media object
 * @param {Array} [props.mediaList] - Array of media objects or URL strings
 * @param {number} [props.initialIndex=0] - Initial index to view when mediaList is provided
 * @param {Function} props.onClose - Callback fired when closing the viewer
 */
const MediaViewerModal = ({ media, mediaList, initialIndex = 0, onClose }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Touch swipe gesture refs for mobile/tablet
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const touchDeltaRef = useRef({ x: 0, y: 0 })

  // Normalize current active media
  const activeMedia =
    mediaList && mediaList.length > 0 ? mediaList[currentIndex] : media

  useScrollLock(!!activeMedia)

  const mediaUrl =
    typeof activeMedia === "string"
      ? activeMedia
      : activeMedia?.mediaUrl || activeMedia?.url || ""
  const mediaType =
    typeof activeMedia === "string"
      ? "Image"
      : activeMedia?.mediaType ||
        (mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "Video" : "Image")
  const fileName =
    typeof activeMedia === "string"
      ? "Preview Image"
      : activeMedia?.fileName || "Fullscreen preview"

  const isTransformed = scale !== 1 || position.x !== 0 || position.y !== 0

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }, [])

  const hasMultiple = Array.isArray(mediaList) && mediaList.length > 1
  const canGoPrev = hasMultiple && currentIndex > 0
  const canGoNext = hasMultiple && currentIndex < mediaList.length - 1

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation()
      setCurrentIndex((prev) => {
        if (prev > 0) {
          resetZoom()
          return prev - 1
        }
        return prev
      })
    },
    [resetZoom],
  )

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation()
      setCurrentIndex((prev) => {
        if (mediaList && prev < mediaList.length - 1) {
          resetZoom()
          return prev + 1
        }
        return prev
      })
    },
    [mediaList, resetZoom],
  )

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!activeMedia) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.()
      } else if (e.key === "ArrowLeft") {
        handlePrev(e)
      } else if (e.key === "ArrowRight") {
        handleNext(e)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeMedia, handlePrev, handleNext, onClose])

  if (!activeMedia || !mediaUrl) return null

  // Mouse wheel zoom handler
  const handleWheel = (e) => {
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.5), 5)
      if (next <= 1 && position.x === 0 && position.y === 0) {
        setPosition({ x: 0, y: 0 })
      }
      return next
    })
  }

  // Mouse click & drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch swipe and pan handlers for mobile/tablet
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      touchDeltaRef.current = { x: 0, y: 0 }

      if (scale > 1) {
        setIsDragging(true)
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        })
      }
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchDeltaRef.current = {
        x: touch.clientX - touchStartRef.current.x,
        y: touch.clientY - touchStartRef.current.y,
      }

      if (scale > 1 && isDragging) {
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      }
    }
  }

  const handleTouchEnd = () => {
    if (scale > 1) {
      setIsDragging(false)
      return
    }

    const { x: deltaX, y: deltaY } = touchDeltaRef.current
    const duration = Date.now() - touchStartRef.current.time

    // Swipe threshold: > 45px horizontal movement with predominantly horizontal swipe under 500ms
    if (
      Math.abs(deltaX) > 45 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2 &&
      duration < 500
    ) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }

    touchDeltaRef.current = { x: 0, y: 0 }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 overflow-hidden select-none touch-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Left Counter Badge */}
      {hasMultiple && (
        <div className="absolute top-4 left-4 z-50 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold select-none border border-white/10">
          {currentIndex + 1} / {mediaList.length}
        </div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1 z-50">
        {mediaType === "Image" && isTransformed && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              resetZoom()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Reset View"
            variant="overlay"
          >
            <RotateCcw />
          </IconButton>
        )}
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
            resetZoom()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Close"
          variant="overlay"
        >
          <X />
        </IconButton>
      </div>

      {/* Previous Arrow Button */}
      {canGoPrev && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
          <IconButton
            onClick={handlePrev}
            onMouseDown={(e) => e.stopPropagation()}
            variant="overlay"
            size="sm"
            title="Previous"
          >
            <ChevronLeft />
          </IconButton>
        </div>
      )}

      {/* Next Arrow Button */}
      {canGoNext && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
          <IconButton
            onClick={handleNext}
            onMouseDown={(e) => e.stopPropagation()}
            variant="overlay"
            size="sm"
            title="Next"
          >
            <ChevronRight />
          </IconButton>
        </div>
      )}

      {mediaType === "Image" ? (
        <img
          key={mediaUrl}
          src={mediaUrl}
          alt={fileName}
          className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform ${
            isDragging ? "duration-0" : "duration-100 ease-out"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          draggable={false}
        />
      ) : (
        <video
          key={mediaUrl}
          src={mediaUrl}
          controls
          autoPlay
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </div>,
    document.body,
  )
}

export default MediaViewerModal
