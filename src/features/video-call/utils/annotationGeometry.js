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

/**
 * First annotation whose stroke passes within `tolerance` of the point.
 * Shapes/text arrive in ticket 03; the return contract is already "item".
 */
export const hitTestAnnotation = (
  items,
  point,
  { tolerance = DEFAULT_HIT_TOLERANCE } = {},
) => {
  if (!isPoint([point?.x, point?.y])) return null
  const target = [point.x, point.y]

  for (const item of items ?? []) {
    if (!item || item.kind !== "stroke" || !Array.isArray(item.pts)) continue
    const pts = item.pts.filter(isPoint)
    if (pts.length === 0) continue

    if (pts.length === 1) {
      const dx = target[0] - pts[0][0]
      const dy = target[1] - pts[0][1]
      if (dx * dx + dy * dy <= tolerance * tolerance) return item
      continue
    }

    for (let i = 1; i < pts.length; i += 1) {
      if (
        pointSegmentDistanceSq(target, pts[i - 1], pts[i]) <=
        tolerance * tolerance
      ) {
        return item
      }
    }
  }

  return null
}
