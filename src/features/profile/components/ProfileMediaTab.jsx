import React, { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { Image as ImageIcon, X, ZoomIn, ZoomOut, Play } from "lucide-react"
import { useGetUserWallMediaQuery } from "../../../store/api/social/profilePostsApi"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import { IconButton } from "@/shared/components/ui/buttons"
import FluentCard from "@/shared/components/ui/FluentCard"

const useColumnCount = () => {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1024) setCols(4)
      else if (w >= 768) setCols(3)
      else if (w >= 480) setCols(2)
      else setCols(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return cols
}

const ProfileMediaTab = ({ targetAccountId }) => {
  const [fullscreenMedia, setFullscreenMedia] = useState(null)

  // Pan and Zoom state
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const isDragSignificant = useRef(false)

  const { data, isLoading } = useGetUserWallMediaQuery({
    accountId: targetAccountId,
    page: 1,
    pageSize: 50,
  })

  const medias = data?.data || []

  const columnsCount = useColumnCount()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (fullscreenMedia) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [fullscreenMedia])

  // Distribute into masonry columns
  const columns = useMemo(() => {
    const colsArray = Array.from({ length: columnsCount }, () => [])
    medias.forEach((media, i) => {
      colsArray[i % columnsCount].push(media)
    })
    return colsArray
  }, [medias, columnsCount])

  // Pan and Zoom handlers
  const handleWheel = (e) => {
    if (fullscreenMedia?.mediaType !== "Image") return

    const delta = e.deltaY < 0 ? 0.3 : -0.3
    const newScale = Math.min(Math.max(scale + delta, 0.5), 5)
    if (newScale === scale) return

    const mouseX = e.clientX - window.innerWidth / 2
    const mouseY = e.clientY - window.innerHeight / 2

    const ratio = newScale / scale
    const newX = mouseX - (mouseX - position.x) * ratio
    const newY = mouseY - (mouseY - position.y) * ratio

    setPosition({ x: newX, y: newY })
    setScale(newScale)
  }

  const handleMouseDown = (e) => {
    if (fullscreenMedia?.mediaType !== "Image") return
    e.preventDefault()
    setIsDragging(true)
    isDragSignificant.current = false
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      isDragSignificant.current = true
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="w-full">
      <div className="w-full min-h-[500px]">
        {/* Masonry Media Grid */}
        {isLoading ? (
          <div className="flex flex-row w-full gap-3 items-start">
            {Array.from({ length: columnsCount }).map((_, colIndex) => (
              <div key={colIndex} className="flex flex-col flex-1 gap-3">
                {[220, 320, 260].map((height, i) => (
                  <Skeleton
                    key={i}
                    className="w-full rounded-xl"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : medias.length === 0 ? (
          <FluentCard>
            <EmptyState message="Chưa có phương tiện nào" icon={ImageIcon} />
          </FluentCard>
        ) : (
          <div className="flex flex-row w-full gap-3 items-start">
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex flex-col flex-1 gap-3 min-w-0"
              >
                {col.map((media) => (
                  <div
                    key={media.postMediaId}
                    onClick={() => setFullscreenMedia(media)}
                    className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-100 border border-[#e5e5e5]"
                  >
                    {media.mediaType === "Image" ? (
                      <img
                        src={media.mediaUrl}
                        alt={media.fileName}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative w-full aspect-square flex items-center justify-center bg-black">
                        <video
                          src={media.mediaUrl}
                          className="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                        />
                        <Play className="absolute w-12 h-12 text-white/80 drop-shadow-md z-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {fullscreenMedia &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 overflow-hidden"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setFullscreenMedia(null)
                resetZoom()
              }
            }}
          >
            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center z-50">
              {fullscreenMedia.mediaType === "Image" && (
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setScale((s) => Math.max(s - 0.5, 0.5))
                    }}
                    title="Zoom Out"
                    variant="overlay"
                  >
                    <ZoomOut />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setScale((s) => Math.min(s + 0.5, 5))
                    }}
                    title="Zoom In"
                    variant="overlay"
                  >
                    <ZoomIn />
                  </IconButton>
                </>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  setFullscreenMedia(null)
                  resetZoom()
                }}
                title="Close"
                variant="overlay"
              >
                <X />
              </IconButton>
            </div>

            {fullscreenMedia.mediaType === "Image" ? (
              <img
                src={fullscreenMedia.mediaUrl}
                alt="Fullscreen preview"
                className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform ${isDragging ? "duration-0 cursor-grabbing" : "duration-200 ease-out cursor-grab"}`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
                onMouseDown={handleMouseDown}
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isDragSignificant.current) return
                  if (scale > 1) {
                    resetZoom()
                  } else {
                    // Zoom in to 2x at cursor
                    const newScale = 2
                    const mouseX = e.clientX - window.innerWidth / 2
                    const mouseY = e.clientY - window.innerHeight / 2
                    setPosition({
                      x: mouseX - mouseX * newScale,
                      y: mouseY - mouseY * newScale,
                    })
                    setScale(newScale)
                  }
                }}
              />
            ) : (
              <video
                src={fullscreenMedia.mediaUrl}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}

export default ProfileMediaTab
