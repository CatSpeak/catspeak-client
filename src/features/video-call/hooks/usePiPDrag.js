import { useState, useEffect, useRef, useCallback } from "react"

// ─── Corner snap math ──────────────────────────────────────────────────────

const SNAP_MARGIN = 20

const getWidgetSize = () => {
  return {
    w: 320,
    h: 180,
  }
}

export const getCornerPositions = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const { w, h } = getWidgetSize()

  return {
    topLeft: { x: SNAP_MARGIN, y: SNAP_MARGIN },
    topRight: { x: vw - w - SNAP_MARGIN, y: SNAP_MARGIN },
    bottomLeft: { x: SNAP_MARGIN, y: vh - h - SNAP_MARGIN },
    bottomRight: { x: vw - w - SNAP_MARGIN, y: vh - h - SNAP_MARGIN },
  }
}

export const getNearestCorner = (x, y) => {
  const corners = getCornerPositions()
  let best = "bottomRight"
  let bestDist = Infinity

  for (const [key, pos] of Object.entries(corners)) {
    const dist = Math.hypot(x - pos.x, y - pos.y)
    if (dist < bestDist) {
      bestDist = dist
      best = key
    }
  }

  return corners[best]
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Manages PiP widget drag-and-snap-to-corner behavior.
 *
 * @param {boolean} isPiP - Whether PiP mode is currently active
 * @returns {{ position, constraintsRef, handleDragEnd }}
 */
export const usePiPDrag = (isPiP) => {
  const constraintsRef = useRef(null)

  const [position, setPosition] = useState(
    () => getCornerPositions().bottomRight,
  )

  // Recalc on viewport resize
  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => getNearestCorner(prev.x, prev.y))
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Reset to bottom-right when entering PiP
  useEffect(() => {
    if (isPiP) {
      setPosition(getCornerPositions().bottomRight)
    }
  }, [isPiP])

  const handleDragEnd = useCallback((_, info) => {
    const corner = getNearestCorner(info.point.x, info.point.y)
    setPosition(corner)
  }, [])

  return { position, constraintsRef, handleDragEnd }
}
