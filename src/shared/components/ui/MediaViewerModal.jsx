import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, RotateCcw } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

/**
 * A reusable interactive media lightbox modal supporting whole-overlay drag panning, mousewheel zoom, and view reset.
 * @param {Object} props
 * @param {string|Object} props.media - Image URL string or media object { mediaUrl, mediaType, fileName }
 * @param {Function} props.onClose - Callback fired when closing the viewer
 */
const MediaViewerModal = ({ media, onClose }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const mediaUrl =
    typeof media === "string" ? media : media?.mediaUrl || media?.url || ""
  const mediaType =
    typeof media === "string"
      ? "Image"
      : media?.mediaType || (mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "Video" : "Image")
  const fileName =
    typeof media === "string" ? "Preview Image" : media?.fileName || "Fullscreen preview"

  const isTransformed = scale !== 1 || position.x !== 0 || position.y !== 0

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
  }

  useEffect(() => {
    if (media) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      resetZoom()
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [media])

  if (!media || !mediaUrl) return null

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

  // Click & drag pan handlers for the whole overlay + image
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

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 overflow-hidden select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls */}
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

      {mediaType === "Image" ? (
        <img
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
