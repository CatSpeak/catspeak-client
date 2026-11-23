/**
 * Screen-annotation geometry.
 *
 * Everything on the wire is normalized against the *source video frame*
 * (`x, y ∈ [0..1]`). These helpers translate between that space, the
 * `object-contain` media rect inside a container, and canvas pixels. Keeping
 * the math here means the in-app canvas and the Electron overlay agree and
 * DPI/Retina scaling never leaks into the protocol.
 */

export const DEFAULT_HIT_TOLERANCE = 0.01

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)

export const clamp01 = (value) => Math.min(1, Math.max(0, value))

const isPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  isFiniteNumber(point[0]) &&
  isFiniteNumber(point[1])

const isEmptySize = (width, height) =>
  !isFiniteNumber(width) ||
  !isFiniteNumber(height) ||
  width <= 0 ||
  height <= 0

const cleanNumber = (value) => {
  const rounded = Math.round(value)
  return Math.abs(value - rounded) < 1e-9 ? rounded + 0 : value
}

/**
 * Largest rect with the media aspect ratio that fits inside the container,
 * centred like CSS `object-fit: contain`.
 */
export const computeContainedMediaRect = (
  containerWidth,
  containerHeight,
  mediaWidth,
  mediaHeight,
) => {
  if (
    isEmptySize(containerWidth, containerHeight) ||
    isEmptySize(mediaWidth, mediaHeight)
  ) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const scale = Math.min(
    containerWidth / mediaWidth,
    containerHeight / mediaHeight,
  )
  const width = mediaWidth * scale
  const height = mediaHeight * scale
  const x = (containerWidth - width) / 2
  const y = (containerHeight - height) / 2

  return {
    x: cleanNumber(x),
    y: cleanNumber(y),
    width: cleanNumber(width),
    height: cleanNumber(height),
  }
}

/**
 * Client (viewport) coordinates to normalized media coordinates. The caller
 * normally passes a point that is already inside the canvas; clamping keeps
 * pointer rounding at the edge inside the contract.
 */
export const clientPointToNormalized = (clientX, clientY, mediaRect) => {
  if (!mediaRect || isEmptySize(mediaRect.width, mediaRect.height)) {
    return null
  }
  if (!isFiniteNumber(clientX) || !isFiniteNumber(clientY)) return null

  return {
    x: clamp01((clientX - mediaRect.x) / mediaRect.width),
    y: clamp01((clientY - mediaRect.y) / mediaRect.height),
  }
}

/** Normalized media coordinates to canvas pixels. */
export const normalizedToCanvas = (x, y, canvasWidth, canvasHeight) => {
  if (isEmptySize(canvasWidth, canvasHeight)) {
    return { x: 0, y: 0 }
  }
  return {
    x: clamp01(x) * canvasWidth,
    y: clamp01(y) * canvasHeight,
  }
}

const pointSegmentDistanceSq = (point, start, end) => {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]

  if (dx === 0 && dy === 0) {
    const px = point[0] - start[0]
    const py = point[1] - start[1]
    return px * px + py * py
  }

  const lengthSq = dx * dx + dy * dy
  const t = Math.min(
    1,
    Math.max(
      0,
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSq,
    ),
  )
  const closestX = start[0] + t * dx
  const closestY = start[1] + t * dy
  const px = point[0] - closestX
  const py = point[1] - closestY
  return px * px + py * py
}

/**
 * Ramer-Douglas-Peucker simplification. Endpoints are always preserved;
 * the tolerance is expressed in normalized units.
 */
export const simplifyPoints = (points, tolerance = 0.001) => {
  const source = (points ?? []).filter(isPoint)
  if (source.length <= 2) return source.map((point) => [point[0], point[1]])

  const toleranceSq = Math.max(0, tolerance) ** 2
  const keep = new Uint8Array(source.length)
  keep[0] = 1
  keep[source.length - 1] = 1

  const stack = [[0, source.length - 1]]
  while (stack.length > 0) {
    const [first, last] = stack.pop()
    let farthest = -1
    let farthestDistanceSq = 0

    for (let i = first + 1; i < last; i += 1) {
      const distanceSq = pointSegmentDistanceSq(
        source[i],
        source[first],
        source[last],
      )
      if (distanceSq > farthestDistanceSq) {
        farthestDistanceSq = distanceSq
        farthest = i
      }
    }

    if (farthest !== -1 && farthestDistanceSq > toleranceSq) {
      keep[farthest] = 1
      stack.push([first, farthest], [farthest, last])
    }
  }

  const simplified = []
  for (let i = 0; i < source.length; i += 1) {
    if (keep[i]) simplified.push([source[i][0], source[i][1]])
  }
  return simplified
}

/** Reference frame used to estimate a text note's bounds in normalized space. */
export const TEXT_REFERENCE_HEIGHT = 720
export const TEXT_LINE_HEIGHT_FACTOR = 1.25
export const TEXT_CHAR_WIDTH_FACTOR = 0.6

/** Conservative normalized bounding box for a multi-line text note. */
export const estimateTextBounds = (item) => {
  const fontSize = isFiniteNumber(item?.fontSize) ? item.fontSize : 24
  const scale = fontSize / TEXT_REFERENCE_HEIGHT
  const lines = String(item?.text ?? "").split("\n")
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0)
  const x = isFiniteNumber(item?.x) ? item.x : 0
  const y = isFiniteNumber(item?.y) ? item.y : 0

  return {
    x1: x,
    y1: y,
    x2: clamp01(x + longest * scale * TEXT_CHAR_WIDTH_FACTOR),
    y2: clamp01(y + Math.max(1, lines.length) * scale * TEXT_LINE_HEIGHT_FACTOR),
  }
}

const pointRectDistanceSq = (point, rect) => {
  const centerX = (rect.x1 + rect.x2) / 2
  const centerY = (rect.y1 + rect.y2) / 2
  const halfWidth = Math.abs(rect.x2 - rect.x1) / 2
  const halfHeight = Math.abs(rect.y2 - rect.y1) / 2
  const dx = Math.max(Math.abs(point[0] - centerX) - halfWidth, 0)
  const dy = Math.max(Math.abs(point[1] - centerY) - halfHeight, 0)

  if (dx === 0 && dy === 0) {
    // Inside: the border is the closest edge.
    const edge = Math.min(
      halfWidth - Math.abs(point[0] - centerX),
      halfHeight - Math.abs(point[1] - centerY),
    )
    return Math.max(0, edge) ** 2
  }
  return dx * dx + dy * dy
}

const ELLIPSE_SAMPLES = 64

const pointEllipseDistanceSq = (point, shape) => {
  const centerX = (shape.x1 + shape.x2) / 2
  const centerY = (shape.y1 + shape.y2) / 2
  const radiusX = Math.abs(shape.x2 - shape.x1) / 2
  const radiusY = Math.abs(shape.y2 - shape.y1) / 2
  if (radiusX <= 1e-9 || radiusY <= 1e-9) {
    return pointSegmentDistanceSq(
      point,
      [shape.x1, shape.y1],
      [shape.x2, shape.y2],
    )
  }

  let closest = Infinity
  let previous = [centerX + radiusX, centerY]
  for (let i = 1; i <= ELLIPSE_SAMPLES; i += 1) {
    const angle = (i / ELLIPSE_SAMPLES) * Math.PI * 2
    const current = [
      centerX + radiusX * Math.cos(angle),
      centerY + radiusY * Math.sin(angle),
    ]
    closest = Math.min(closest, pointSegmentDistanceSq(point, previous, current))
    previous = current
  }
  return closest
}

const hitTestItem = (item, target, toleranceSq) => {
  if (!item) return false

  if (item.kind === "stroke") {
    if (!Array.isArray(item.pts)) return false
    const pts = item.pts.filter(isPoint)
    if (pts.length === 0) return false
    if (pts.length === 1) {
      return pointSegmentDistanceSq(target, pts[0], pts[0]) <= toleranceSq
    }
    for (let i = 1; i < pts.length; i += 1) {
      if (pointSegmentDistanceSq(target, pts[i - 1], pts[i]) <= toleranceSq) {
        return true
      }
    }
    return false
  }

  if (item.kind === "shape") {
    if (
      !isFiniteNumber(item.x1) ||
      !isFiniteNumber(item.y1) ||
      !isFiniteNumber(item.x2) ||
      !isFiniteNumber(item.y2)
    ) {
      return false
    }

    if (item.tool === "line" || item.tool === "arrow") {
      return (
        pointSegmentDistanceSq(
          target,
          [item.x1, item.y1],
          [item.x2, item.y2],
        ) <= toleranceSq
      )
    }
    if (item.tool === "rect") {
      return pointRectDistanceSq(target, item) <= toleranceSq
    }
    if (item.tool === "ellipse") {
      return pointEllipseDistanceSq(target, item) <= toleranceSq
    }
    return false
  }

  if (item.kind === "text") {
    const bounds = estimateTextBounds(item)
    const inside =
      target[0] >= bounds.x1 &&
      target[0] <= bounds.x2 &&
      target[1] >= bounds.y1 &&
      target[1] <= bounds.y2
    return inside || pointRectDistanceSq(target, bounds) <= toleranceSq
  }

  return false
}

/**
 * Every annotation touched at `point` (eraser). Geometry is author-agnostic;
 * the caller applies the ownership/moderation filter.
 */
export const hitTestAnnotations = (
  items,
  point,
  { tolerance = DEFAULT_HIT_TOLERANCE } = {},
) => {
  if (!isPoint([point?.x, point?.y])) return []
  const target = [point.x, point.y]
  const toleranceSq = Math.max(0, tolerance) ** 2

  return (items ?? []).filter((item) => hitTestItem(item, target, toleranceSq))
}

/** First annotation touched at `point`, or null. */
export const hitTestAnnotation = (items, point, options = {}) =>
  hitTestAnnotations(items, point, options)[0] ?? null
