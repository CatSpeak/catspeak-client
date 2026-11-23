import { useEffect, useRef, useState } from "react"

import {
  TEXT_REFERENCE_HEIGHT,
  clientPointToNormalized,
  computeContainedMediaRect,
} from "@/features/video-call/utils/annotationGeometry"
import {
  AUTHOR_PILL_MS,
  LASER_TTL_MS,
  renderAnnotationFrame,
} from "@/features/video-call/utils/annotationRenderer"
import {
  ANNOTATION_TEXT_FONT_SIZE,
  resolveAnnotationTextKey,
  shouldCommitAnnotationText,
} from "@/features/video-call/utils/annotationText"
import { SHAPE_TOOLS } from "@/features/video-call/utils/annotationProtocol"

const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 }
const STROKE_TOOLS = new Set(["pen", "highlighter"])

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

const cursorForTool = (tool) => {
  if (tool === "text") return "cursor-text"
  if (tool === "eraser") return "cursor-cell"
  return "cursor-crosshair"
}

/**
 * Transparent drawing surface over the shared screen. `readOnly` renders
 * existing strokes/lasers but can never take pointer input (thumbnails/grid/
 * PiP). Text notes are edited in a textarea aligned with the normalized point.
 */
const AnnotationCanvas = ({
  containerRef,
  videoRef,
  items = [],
  liveStrokes = [],
  draftShape = null,
  lasers = [],
  readOnly = false,
  canAnnotate = true,
  tool = "mouse",
  color = "#ef4444",
  width = 4,
  showAuthorPills = true,
  onStrokeStart,
  onStrokePoint,
  onStrokeEnd,
  onShapeStart,
  onShapePoint,
  onShapeEnd,
  onTextCommit,
  onLaserMove,
  onErase,
  onToolChange,
  className = "",
}) => {
  const canvasRef = useRef(null)
  const drawingModeRef = useRef(null)
  const textEditorRef = useRef(null)
  const cancelledTextRef = useRef(false)
  const [textEditor, setTextEditor] = useState(null)
  const rect = useContainedMediaRect(containerRef, videoRef)
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 1

  const interactive =
    !readOnly && canAnnotate && tool !== "mouse"

  // Redraw on state changes, then keep a short animation loop alive only while
  // an author pill or a laser trail is still fading.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || rect.width <= 0 || rect.height <= 0) return undefined
    const ctx = canvas.getContext("2d")
    if (!ctx) return undefined

    let frame = 0
    let cancelled = false
    const live = draftShape ? [...liveStrokes, draftShape] : liveStrokes

    const draw = () => {
      if (cancelled) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const now = Date.now()
      renderAnnotationFrame(ctx, {
        items,
        liveStrokes: live,
        lasers,
        width: rect.width,
        height: rect.height,
        now,
        showAuthorPills,
      })

      const latestPill = [...items, ...live].reduce(
        (value, item) => Math.max(value, item?.createdAt ?? 0),
        0,
      )
      const latestLaser = lasers.reduce((value, laser) => {
        const trail = Array.isArray(laser?.trail) ? laser.trail : []
        const last = trail[trail.length - 1]
        return Math.max(value, last?.ts ?? 0)
      }, 0)

      const pillActive =
        showAuthorPills &&
        latestPill > 0 &&
        now - latestPill < AUTHOR_PILL_MS
      const laserActive = latestLaser > 0 && now - latestLaser <= LASER_TTL_MS
      if (
        (pillActive || laserActive) &&
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
    draftShape,
    lasers,
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

  const releaseCapture = (event) => {
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    } catch {
      // ignore
    }
  }

  const finishDrawing = () => {
    const mode = drawingModeRef.current
    if (!mode) return
    drawingModeRef.current = null
    if (STROKE_TOOLS.has(mode)) onStrokeEnd?.()
    else if (SHAPE_TOOLS.has(mode)) onShapeEnd?.()
  }

  const closeTextEditor = (commit) => {
    const editor = textEditorRef.current
    if (!editor) return
    textEditorRef.current = null
    setTextEditor(null)
    if (commit && shouldCommitAnnotationText(editor.value)) {
      onTextCommit?.({
        x: editor.x,
        y: editor.y,
        text: editor.value,
        color,
        fontSize: ANNOTATION_TEXT_FONT_SIZE,
      })
    }
  }

  const openTextEditor = (point) => {
    if (textEditorRef.current) {
      // A click outside first commits the open note; it does not start a
      // second editor in the same gesture.
      closeTextEditor(true)
      return
    }
    const editor = { x: point.x, y: point.y, value: "" }
    textEditorRef.current = editor
    setTextEditor(editor)
  }

  const handlePointerDown = (event) => {
    if (!interactive || drawingModeRef.current) return
    const point = pointFromEvent(event)
    if (!point) return

    event.preventDefault()
    event.stopPropagation()

    if (tool === "text") {
      openTextEditor(point)
      return
    }

    if (tool === "eraser") {
      onErase?.(point)
      drawingModeRef.current = tool
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId)
      } catch {
        // Pointer capture is best-effort (older browsers).
      }
      return
    }

    if (tool === "laser") {
      onLaserMove?.(point, color)
      return
    }

    if (!STROKE_TOOLS.has(tool) && !SHAPE_TOOLS.has(tool)) return

    drawingModeRef.current = tool
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is best-effort (older browsers).
    }

    if (SHAPE_TOOLS.has(tool)) {
      onShapeStart?.({ tool, color, width, pt: [point.x, point.y] })
    } else {
      onStrokeStart?.({ tool, color, width, pt: [point.x, point.y] })
    }
  }

  const handlePointerMove = (event) => {
    if (!interactive) return

    if (tool === "laser") {
      event.stopPropagation()
      const point = pointFromEvent(event)
      if (point) onLaserMove?.(point, color)
      return
    }

    const mode = drawingModeRef.current
    if (!mode) return
    event.stopPropagation()

    const native = event.nativeEvent ?? event
    const coalesced =
      typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : []
    const samples = coalesced.length > 0 ? coalesced : [native]
    for (const sample of samples) {
      const point = pointFromEvent(sample)
      if (!point) continue
      if (mode === "eraser") {
        onErase?.(point)
      } else if (SHAPE_TOOLS.has(mode)) {
        onShapePoint?.([point.x, point.y])
      } else {
        onStrokePoint?.([point.x, point.y])
      }
    }
  }

  const handlePointerEnd = (event) => {
    if (!drawingModeRef.current) return
    event.stopPropagation()
    finishDrawing()
    releaseCapture(event)
  }

  const handleTextKeyDown = (event) => {
    const action = resolveAnnotationTextKey(event)
    if (!action) return
    event.stopPropagation()
    if (action === "cancel") {
      event.preventDefault()
      cancelledTextRef.current = true
      closeTextEditor(false)
      cancelledTextRef.current = false
      onToolChange?.("mouse")
      return
    }
    event.preventDefault()
    closeTextEditor(true)
  }

  const handleTextBlur = () => {
    if (cancelledTextRef.current) return
    closeTextEditor(true)
  }

  const handleTextChange = (event) => {
    const editor = textEditorRef.current
    if (!editor) return
    const next = { ...editor, value: event.target.value }
    textEditorRef.current = next
    setTextEditor(next)
  }

  if (rect.width <= 0 || rect.height <= 0) return null

  const textFontSize = Math.max(
    8,
    ANNOTATION_TEXT_FONT_SIZE * (rect.height / TEXT_REFERENCE_HEIGHT),
  )

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={Math.max(1, Math.round(rect.width * dpr))}
        height={Math.max(1, Math.round(rect.height * dpr))}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={finishDrawing}
        onClick={(event) => event.stopPropagation()}
        className={`absolute z-10 ${
          interactive
            ? `pointer-events-auto touch-none ${cursorForTool(tool)}`
            : "pointer-events-none"
        } ${className}`}
        style={{
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }}
      />

      {textEditor && !readOnly && (
        <textarea
          autoFocus
          value={textEditor.value}
          rows={Math.max(1, textEditor.value.split("\n").length)}
          wrap="off"
          spellCheck={false}
          aria-label="Annotation text"
          onChange={handleTextChange}
          onKeyDown={handleTextKeyDown}
          onBlur={handleTextBlur}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="absolute z-20 resize-none overflow-auto rounded border border-dashed border-white/60 px-1 py-0.5 font-semibold shadow-sm outline-none focus:border-white"
          style={{
            left: `${rect.x + textEditor.x * rect.width}px`,
            top: `${rect.y + textEditor.y * rect.height}px`,
            width: `${Math.max(160, rect.width * 0.35)}px`,
            color,
            caretColor: color,
            backgroundColor: "rgba(17, 24, 39, 0.72)",
            fontSize: `${textFontSize}px`,
            lineHeight: 1.25,
          }}
        />
      )}
    </>
  )
}

export default AnnotationCanvas
