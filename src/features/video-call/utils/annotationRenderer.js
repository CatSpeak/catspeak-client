/**
 * Canvas 2D renderer shared by the in-app overlay and (later) the Electron
 * OS overlay. Pure drawing functions: no React, no LiveKit.
 *
 * Ticket 02 uses pen + highlighter; the line/arrow/rect/ellipse, multi-line
 * text and laser helpers are ready for ticket 03 to wire to its toolbar.
 */

import {
  TEXT_REFERENCE_HEIGHT,
  normalizedToCanvas,
} from "./annotationGeometry.js"

export const HIGHLIGHTER_ALPHA = 0.35
export const AUTHOR_PILL_MS = 3000
export const AUTHOR_PILL_FADE_MS = 600
export const LASER_TTL_MS = 2500

const toCanvasPoints = (pts, width, height) =>
  (pts ?? [])
    .filter((pt) => Array.isArray(pt) && pt.length === 2)
    .map((pt) => normalizedToCanvas(pt[0], pt[1], width, height))

const roundRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/**
 * Smooth polyline with the midpoint/quadratic-curve trick. A single point is
 * rendered as a dot so a click still leaves a mark.
 */
export const traceSmoothPath = (ctx, pts, width, height) => {
  const points = toCanvasPoints(pts, width, height)
  if (points.length === 0) return 0

  if (points.length === 1) {
    const point = points[0]
    ctx.beginPath()
    ctx.arc(point.x, point.y, Math.max(0.5, ctx.lineWidth / 2), 0, Math.PI * 2)
    return 1
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    ctx.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2,
    )
  }
  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
  return 2
}

export const drawStroke = (
  ctx,
  item,
  { width, height, alpha = 1 } = {},
) => {
  if (!ctx || !item?.pts?.length) return
  ctx.save()
  ctx.globalAlpha = alpha * (item.tool === "highlighter" ? HIGHLIGHTER_ALPHA : 1)
  ctx.strokeStyle = item.color || "#ef4444"
  ctx.fillStyle = item.color || "#ef4444"
  ctx.lineWidth = Math.max(1, item.width || 2)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const kind = traceSmoothPath(ctx, item.pts, width, height)
  if (kind === 1) ctx.fill()
  else if (kind === 2) ctx.stroke()
  ctx.restore()
}

export const drawShape = (
  ctx,
  item,
  { width, height, alpha = 1 } = {},
) => {
  if (!ctx) return
  const start = normalizedToCanvas(item.x1, item.y1, width, height)
  const end = normalizedToCanvas(item.x2, item.y2, width, height)

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = item.color || "#ef4444"
  ctx.fillStyle = item.color || "#ef4444"
  ctx.lineWidth = Math.max(1, item.width || 2)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  ctx.beginPath()
  switch (item.tool) {
    case "arrow": {
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      const head = 8 + ctx.lineWidth * 2
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(
        end.x - head * Math.cos(angle - Math.PI / 6),
        end.y - head * Math.sin(angle - Math.PI / 6),
      )
      ctx.lineTo(
        end.x - head * Math.cos(angle + Math.PI / 6),
        end.y - head * Math.sin(angle + Math.PI / 6),
      )
      ctx.closePath()
      ctx.fill()
      break
    }
    case "rect":
      ctx.rect(
        Math.min(start.x, end.x),
        Math.min(start.y, end.y),
        Math.abs(end.x - start.x),
        Math.abs(end.y - start.y),
      )
      ctx.stroke()
      break
    case "ellipse":
      ctx.ellipse(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        Math.abs(end.x - start.x) / 2,
        Math.abs(end.y - start.y) / 2,
        0,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
      break
    default:
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
  }
  ctx.restore()
}

export const drawTextAnnotation = (
  ctx,
  item,
  { width, height, alpha = 1 } = {},
) => {
  if (!ctx || !item?.text) return
  const point = normalizedToCanvas(item.x, item.y, width, height)
  const referenceScale = height > 0 ? height / TEXT_REFERENCE_HEIGHT : 1
  const fontSize = Math.max(8, (item.fontSize || 24) * referenceScale)
  const lines = String(item.text).split("\n")

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = item.color || "#ef4444"
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
  ctx.textBaseline = "top"
  lines.forEach((line, index) => {
    ctx.fillText(line, point.x, point.y + index * fontSize * 1.25)
  })
  ctx.restore()
}

export const drawLaser = (
  ctx,
  laser,
  { width, height } = {},
  now = Date.now(),
) => {
  if (!ctx || !laser) return
  const trail = Array.isArray(laser.trail) ? laser.trail : []
  const latest = trail.length > 0 ? trail[trail.length - 1] : laser
  const age = Math.max(0, now - (latest.ts ?? laser.ts ?? now))
  if (age > LASER_TTL_MS) return

  ctx.save()
  for (let i = 0; i < trail.length; i += 1) {
    const point = trail[i]
    const pointAge = Math.max(0, now - (point.ts ?? now))
    if (pointAge > LASER_TTL_MS) continue
    const alpha = (1 - pointAge / LASER_TTL_MS) * 0.4
    const position = normalizedToCanvas(point.x, point.y, width, height)
    ctx.globalAlpha = alpha
    ctx.fillStyle = laser.color || "#ef4444"
    ctx.beginPath()
    ctx.arc(position.x, position.y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const head = normalizedToCanvas(
    latest.x ?? laser.x,
    latest.y ?? laser.y,
    width,
    height,
  )
  const alpha = 1 - age / LASER_TTL_MS
  ctx.globalAlpha = alpha
  ctx.fillStyle = laser.color || "#ef4444"
  ctx.beginPath()
  ctx.arc(head.x, head.y, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export const drawAuthorPill = (
  ctx,
  { x, y, text, color = "#ef4444", alpha = 1 } = {},
) => {
  if (!ctx || !text) return
  const label = String(text).length > 28 ? `${String(text).slice(0, 27)}…` : text

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif"
  const textWidth = ctx.measureText(label).width
  const height = 20
  const width = textWidth + 24
  const left = x
  const top = y - height - 8

  roundRect(ctx, left, top, width, height, height / 2)
  ctx.fillStyle = "rgba(17, 24, 39, 0.88)"
  ctx.fill()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(left + 9, top + height / 2, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#ffffff"
  ctx.textBaseline = "middle"
  ctx.fillText(label, left + 16, top + height / 2 + 0.5)
  ctx.restore()
}

const itemAnchor = (item) => {
  if (Array.isArray(item.pts) && item.pts.length > 0) {
    return item.pts[item.pts.length - 1]
  }
  if (typeof item.x === "number" && typeof item.y === "number") {
    return [item.x, item.y]
  }
  if (typeof item.x2 === "number" && typeof item.y2 === "number") {
    return [item.x2, item.y2]
  }
  return null
}

/**
 * Draw one frame. Dimensions are CSS pixels (the caller scales the context by
 * devicePixelRatio); author pills fade out after ~3 s.
 */
export const renderAnnotationFrame = (
  ctx,
  {
    items = [],
    liveStrokes = [],
    lasers = [],
    width = 0,
    height = 0,
    now = Date.now(),
    showAuthorPills = true,
  } = {},
) => {
  if (!ctx || width <= 0 || height <= 0) return

  ctx.clearRect(0, 0, width, height)

  const drawOne = (item) => {
    if (!item) return
    if (item.kind === "stroke") {
      drawStroke(ctx, item, { width, height })
    } else if (item.kind === "shape") {
      drawShape(ctx, item, { width, height })
    } else if (item.kind === "text") {
      drawTextAnnotation(ctx, item, { width, height })
    }
  }

  items.forEach(drawOne)
  liveStrokes.forEach(drawOne)
  lasers.forEach((laser) => drawLaser(ctx, laser, { width, height }, now))

  if (!showAuthorPills) return
  const all = [...items, ...liveStrokes]
  for (const item of all) {
    if (!item?.createdAt) continue
    const age = now - item.createdAt
    if (age < 0 || age > AUTHOR_PILL_MS) continue
    const anchor = itemAnchor(item)
    if (!anchor) continue
    const point = normalizedToCanvas(anchor[0], anchor[1], width, height)
    const remaining = AUTHOR_PILL_MS - age
    const alpha =
      remaining < AUTHOR_PILL_FADE_MS ? remaining / AUTHOR_PILL_FADE_MS : 1
    const maxX = Math.max(4, width - 140)
    drawAuthorPill(ctx, {
      x: Math.min(Math.max(4, point.x + 10), maxX),
      y: Math.min(Math.max(30, point.y), height - 4),
      text: item.authorName,
      color: item.color,
      alpha,
    })
  }
}
