import React, { useState, useRef, useCallback } from 'react'
import ScreenShareTile from "../ScreenShareTile"
import VideoTile from "../VideoTile"

// CSS position classes for each corner
const CORNER_CLASSES = {
  "bottom-right": "bottom-3 right-3 md:bottom-4 md:right-4",
  "bottom-left": "bottom-3 left-3 md:bottom-4 md:left-4",
  "top-right": "top-3 right-3 md:top-4 md:right-4",
  "top-left": "top-3 left-3 md:top-4 md:left-4",
}

const PiPLayout = ({ spotlightItem, screenShareTracks, participants, handleTileClick }) => {
  const containerRef = useRef(null)
  const pipRef = useRef(null)
  const dragState = useRef({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, hasMoved: false })
  const [corner, setCorner] = useState("bottom-right")
  const [dragging, setDragging] = useState(false)
  const [isSwapped, setIsSwapped] = useState(false)

  const getNearestCorner = useCallback((pipCenterX, pipCenterY) => {
    const container = containerRef.current
    if (!container) return "bottom-right"

    const rect = container.getBoundingClientRect()
    const midX = rect.width / 2
    const midY = rect.height / 2

    const isLeft = pipCenterX < midX
    const isTop = pipCenterY < midY

    if (isTop && isLeft) return "top-left"
    if (isTop && !isLeft) return "top-right"
    if (!isTop && isLeft) return "bottom-left"
    return "bottom-right"
  }, [])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    const pip = pipRef.current
    if (!pip) return

    const pipRect = pip.getBoundingClientRect()
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      // Store the initial offset from the pointer to the pip's top-left
      offsetX: e.clientX - pipRect.left,
      offsetY: e.clientY - pipRect.top,
      hasMoved: false,
    }
    setDragging(true)

    // Remove transition during drag for immediate feedback
    pip.style.transition = "none"
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current.isDragging) return

    const dx = Math.abs(e.clientX - dragState.current.startX)
    const dy = Math.abs(e.clientY - dragState.current.startY)
    if (dx > 5 || dy > 5) {
      dragState.current.hasMoved = true
    }

    const container = containerRef.current
    const pip = pipRef.current
    if (!container || !pip) return

    const containerRect = container.getBoundingClientRect()
    const pipW = pip.offsetWidth
    const pipH = pip.offsetHeight

    // Calculate new position relative to the container
    let newLeft = e.clientX - containerRect.left - dragState.current.offsetX
    let newTop = e.clientY - containerRect.top - dragState.current.offsetY

    // Clamp within container bounds
    newLeft = Math.max(0, Math.min(newLeft, containerRect.width - pipW))
    newTop = Math.max(0, Math.min(newTop, containerRect.height - pipH))

    // Apply position directly via inline styles for instant response
    pip.style.inset = "auto"
    pip.style.left = `${newLeft}px`
    pip.style.top = `${newTop}px`
    pip.style.right = "auto"
    pip.style.bottom = "auto"
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!dragState.current.isDragging) return
    dragState.current.isDragging = false

    const container = containerRef.current
    const pip = pipRef.current
    if (!container || !pip) return

    if (!dragState.current.hasMoved) {
      setIsSwapped((prev) => !prev)
    }

    const containerRect = container.getBoundingClientRect()
    const pipRect = pip.getBoundingClientRect()

    // Calculate pip center relative to the container
    const pipCenterX = pipRect.left - containerRect.left + pipRect.width / 2
    const pipCenterY = pipRect.top - containerRect.top + pipRect.height / 2

    const nearest = getNearestCorner(pipCenterX, pipCenterY)

    // Clear inline styles so Tailwind corner classes take over
    pip.style.transition = ""
    pip.style.inset = ""
    pip.style.left = ""
    pip.style.top = ""
    pip.style.right = ""
    pip.style.bottom = ""

    setCorner(nearest)
    setDragging(false)
  }, [getNearestCorner])

  const renderItem = (item) => {
    if (item.type === "screen") {
      return (
        <ScreenShareTile
          trackRef={item.data}
          presenterDisplayName={item.data.participant?.name || item.data.participant?.identity || "Unknown"}
          isLocal={item.data.participant?.isLocal}
          onClick={() => handleTileClick({ type: "screen", trackRef: item.data })}
        />
      )
    } else {
      return (
        <VideoTile
          participant={item.data}
          onClick={() => handleTileClick({ type: "video", participant: item.data })}
        />
      )
    }
  }

  // ── Build items & determine main/pip ──
  const allItems = [
    ...(screenShareTracks || []).map((t) => ({
      type: "screen",
      data: t,
      // eslint-disable-next-line react-hooks/purity
      key: t.publication?.trackSid || Math.random(),
    })),
    ...(participants || []).map((p) => ({
      type: "video",
      data: p,
      key: p.identity,
    })),
  ]

  // Fallback just in case
  if (allItems.length === 0) return null;

  if (allItems.length === 1) {
    return (
      <div ref={containerRef} className="relative h-full w-full bg-black overflow-hidden">
        {/* Main Background Video */}
        <div className="absolute inset-0 w-full h-full">
          {renderItem(allItems[0])}
        </div>
      </div>
    )
  }

  // Determine which item goes to the background (main) and which is floating (PiP)
  let mainItem;
  let pipItem;

  const localIndex = allItems.findIndex(i => i.type === "video" && (i.data.isLocal || i.data.participant?.isLocal));

  if (localIndex !== -1) {
    // Floating PiP is always the local participant
    pipItem = allItems[localIndex];

    // Main background is the spotlight item if it's not the local participant
    if (spotlightItem) {
      const isSpotlightVideo = spotlightItem.type === "video";
      const spotIndex = allItems.findIndex(i =>
        isSpotlightVideo
          ? i.type === "video" && i.data.identity === spotlightItem.participant?.identity
          : i.type === "screen" && i.data.publication?.trackSid === spotlightItem.trackRef?.publication?.trackSid
      );

      if (spotIndex !== -1 && spotIndex !== localIndex) {
        mainItem = allItems[spotIndex];
      }
    }

    // Fallback for main if spotlight is local, not found, or not active
    if (!mainItem) {
      const firstNonLocalIndex = allItems.findIndex(i => i.type !== "video" || !(i.data.isLocal || i.data.participant?.isLocal));
      if (firstNonLocalIndex !== -1) {
        mainItem = allItems[firstNonLocalIndex];
      } else {
        mainItem = allItems[localIndex === 0 ? 1 : 0];
      }
    }
  } else {
    // Fallback if local participant is not found
    mainItem = allItems[0];
    pipItem = allItems[1];
  }

  // Swap layout roles if clicked/swapped
  if (isSwapped && mainItem && pipItem) {
    const temp = mainItem;
    mainItem = pipItem;
    pipItem = temp;
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Main Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {renderItem(mainItem)}
      </div>

      {/* Floating PiP Video — draggable, snaps to 4 corners */}
      <div
        ref={pipRef}
        className={`absolute ${CORNER_CLASSES[corner]} w-[134px] h-[190px] md:w-[240px] md:h-[135px] rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 ${dragging ? "" : "transition-all duration-300 ease-out"}`}
        style={{ touchAction: "none" }}
      >
        {renderItem(pipItem)}

        {/* Transparent drag handle overlay */}
        <div
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  )
}

export default PiPLayout
