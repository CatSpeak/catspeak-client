import { useEffect, useRef, useState } from "react"

import {
  clientPointToNormalized,
  computeContainedMediaRect,
} from "@/features/video-call/utils/annotationGeometry"
import {
  AUTHOR_PILL_MS,
  renderAnnotationFrame,
} from "@/features/video-call/utils/annotationRenderer"

const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 }

const sameRect = (a, b) =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

/**
 * Tracks the `object-contain` media rect inside a container. The canvas is
 * absolutely positioned over exactly this rect, so normalized coordinates map
 * 1:1 to the shared video frame regardless of letterboxing/DPI.
 */
const useContainedMediaRect = (containerRef, videoRef) => {
  const [rect, setRect] = useState(EMPTY_RECT)

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return undefined
    const video = videoRef?.current ?? null

    const update = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      if (containerWidth <= 0 || containerHeight <= 0) {
        setRect((prev) => (sameRect(prev, EMPTY_RECT) ? prev : EMPTY_RECT))
        return
      }

      const mediaWidth =
        video?.videoWidth > 0 ? video.videoWidth : containerWidth
      const mediaHeight =
        video?.videoHeight > 0 ? video.videoHeight : containerHeight
      const next = computeContainedMediaRect(
        containerWidth,
        containerHeight,
        mediaWidth,
        mediaHeight,
      )
      setRect((prev) => (sameRect(prev, next) ? prev : next))
    }

    update()

    let observer = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update)
      observer.observe(container)
    }

    const mediaEvents = ["loadedmetadata", "resize", "emptied"]
    mediaEvents.forEach((event) => video?.addEventListener(event, update))
    window.addEventListener("resize", update)

    return () => {
      observer?.disconnect()
      mediaEvents.forEach((event) => video?.removeEventListener(event, update))
      window.removeEventListener("resize", update)
    }
  }, [containerRef, videoRef])

  return rect
}

/**
 * Transparent drawing surface over the shared screen. `readOnly` renders
 * existing strokes but can never take pointer input (thumbnails/grid/PiP).
 */
const AnnotationCanvas = ({
  containerRef,
  videoRef,
  items = [],
  liveStrokes = [],
  readOnly = false,
  canAnnotate = true,
  tool = "mouse",
  color = "#ef4444",
  width = 4,
  showAuthorPills = true,
  onStrokeStart,
  onStrokePoint,
  onStrokeEnd,
  className = "",
}) => {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const rect = useContainedMediaRect(containerRef, videoRef)
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 1

  const interactive =
    !readOnly && canAnnotate && tool !== "mouse" && tool !== "eraser"

  // Redraw on state changes, then keep a short animation loop alive only while
  // an author pill is still fading (~3 s).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || rect.width <= 0 || rect.height <= 0) return undefined
    const ctx = canvas.getContext("2d")
    if (!ctx) return undefined

    let frame = 0
    let cancelled = false

    const draw = () => {
      if (cancelled) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const now = Date.now()
      renderAnnotationFrame(ctx, {
        items,
        liveStrokes,
        width: rect.width,
        height: rect.height,
        now,
        showAuthorPills,
      })

      const latest = [...items, ...liveStrokes].reduce(
        (value, item) => Math.max(value, item?.createdAt ?? 0),
        0,
      )
      if (
        showAuthorPills &&
        latest > 0 &&
        now - latest < AUTHOR_PILL_MS &&
        typeof requestAnimationFrame === "function"
      ) {
        frame = requestAnimationFrame(draw)
      }
    }

    draw()
    return () => {
      cancelled = true
      if (frame && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(frame)
      }
    }
  }, [
    items,
    liveStrokes,
    rect.width,
    rect.height,
    dpr,
    showAuthorPills,
  ])

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const bounds = canvas.getBoundingClientRect()
    return clientPointToNormalized(event.clientX, event.clientY, bounds)
  }

  const finishStroke = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    onStrokeEnd?.()
  }

  const handlePointerDown = (event) => {
    if (!interactive || drawingRef.current) return
    const point = pointFromEvent(event)
    if (!point) return

    event.preventDefault()
    event.stopPropagation()
    drawingRef.current = true
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is best-effort (older browsers).
    }
    onStrokeStart?.({ ...point, tool, color, width })
  }

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return
    event.stopPropagation()

    const native = event.nativeEvent ?? event
    const coalesced =
      typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : []
    const samples = coalesced.length > 0 ? coalesced : [native]
    for (const sample of samples) {
      const point = pointFromEvent(sample)
      if (point) onStrokePoint?.(point)
    }
  }

  const handlePointerEnd = (event) => {
    if (!drawingRef.current) return
    event.stopPropagation()
    finishStroke()
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    } catch {
      // ignore
    }
  }

  if (rect.width <= 0 || rect.height <= 0) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={Math.max(1, Math.round(rect.width * dpr))}
      height={Math.max(1, Math.round(rect.height * dpr))}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={finishStroke}
      onClick={(event) => event.stopPropagation()}
      className={`absolute z-10 ${
        interactive
          ? "pointer-events-auto cursor-crosshair touch-none"
          : "pointer-events-none"
      } ${className}`}
      style={{
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    />
  )
}

export default AnnotationCanvas
