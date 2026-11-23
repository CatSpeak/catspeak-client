import {
  ANNOTATION_COLORS,
  ANNOTATION_WIDTHS,
  MAX_ANNOTATION_ITEMS,
  MAX_ERASE_IDS,
  MAX_POINT_BATCH,
  MAX_STROKE_POINTS,
  SHAPE_TOOLS,
  buildErasePacket,
  buildLaserMovePacket,
  buildShapeCommitPacket,
  buildStrokeEndPacket,
  buildStrokePointPacket,
  buildStrokeStartPacket,
  buildTextCommitPacket,
} from "./annotationProtocol.js"
import { ANNOTATION_TEXT_MAX_LENGTH } from "./annotationText.js"

/**
 * Pure helpers for the Electron OS overlay (ticket 09).
 *
 * The overlay renderer is local and untrusted-by-shape: it sends simplified
 * events, never protocol packets. This module validates those events, stamps
 * the presenter identity and turns them into the same v1 `screen-annotation`
 * packets the in-app canvas publishes. The React hook stays thin.
 */

export const OVERLAY_TOOLS = new Set([
  "mouse",
  "pen",
  "highlighter",
  "text",
  "line",
  "arrow",
  "rect",
  "ellipse",
  "laser",
  "eraser",
])

export const OVERLAY_DRAW_TOOLS = new Set([
  "pen",
  "highlighter",
  "text",
  "line",
  "arrow",
  "rect",
  "ellipse",
  "laser",
  "eraser",
])

const MAX_OVERLAY_LASERS = 32
const MAX_LASER_POINTS = 48
const MAX_ID_LENGTH = 256
const MAX_COLOR_LENGTH = 32
const MAX_AUTHOR_NAME_LENGTH = 120

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)

const isNormalizedCoordinate = (value) =>
  isFiniteNumber(value) && value >= 0 && value <= 1

const isNormalizedPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  isNormalizedCoordinate(point[0]) &&
  isNormalizedCoordinate(point[1])

const isId = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= MAX_ID_LENGTH

const isColor = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= MAX_COLOR_LENGTH

const isWidth = (value) =>
  isFiniteNumber(value) && value > 0 && value <= 64

const round4 = (value) => Number(value.toFixed(4))
const roundPoint = (point) => [round4(point[0]), round4(point[1])]

export const overlayModeForTool = (tool) =>
  tool === "mouse" ? "mouse" : "draw"

/**
 * Double-stroke prevention decision. Every local copy of the presenter's tile
 * hides its in-app canvas for the whole full-display share: the OS overlay is
 * content-protected, so the captured screen must not contain baked-in strokes.
 */
export const shouldHideInAppCanvas = ({
  bridgeAvailable = false,
  isLocalPresenter = false,
  isFullDisplay = false,
  trackSid = null,
  isMock = false,
} = {}) =>
  Boolean(
    bridgeAvailable &&
      isLocalPresenter &&
      isFullDisplay &&
      typeof trackSid === "string" &&
      trackSid.length > 0 &&
      isMock !== true,
  )

/**
 * Feature-detected adapter over `window.catspeakDesktop.overlay`. In a plain
 * browser (or an older desktop build) every method is an inert no-op, so the
 * web app keeps working without the bridge.
 */
export const createDesktopOverlayBridge = (
  scope = typeof window !== "undefined" ? window : null,
) => {
  const overlay = scope?.catspeakDesktop?.overlay ?? null
  const available = Boolean(
    overlay &&
      overlay.isAvailable !== false &&
      typeof overlay.start === "function",
  )

  const invoke = (method, ...args) => {
    if (!available || typeof overlay[method] !== "function") {
      return Promise.resolve({ ok: false, error: "UNAVAILABLE" })
    }

    try {
      return Promise.resolve(overlay[method](...args)).catch(() => ({
        ok: false,
        error: "FAILED",
      }))
    } catch {
      return Promise.resolve({ ok: false, error: "FAILED" })
    }
  }

  return {
    available,
    start: (payload) => invoke("start", payload),
    stop: () => invoke("stop"),
    setMode: (mode) => invoke("setMode", mode),
    updateState: (state) => invoke("updateState", state),
    onEvent: (handler) => {
      if (
        !available ||
        typeof handler !== "function" ||
        typeof overlay.onEvent !== "function"
      ) {
        return () => {}
      }

      const wrapped = (event) => {
        try {
          handler(event)
        } catch {
          // The overlay must never break the web app.
        }
      }

      let unsubscribe = null
      try {
        const result = overlay.onEvent(wrapped)
        if (typeof result === "function") unsubscribe = result
      } catch {
        return () => {}
      }

      let active = true
      return () => {
        if (!active) return
        active = false

        try {
          if (unsubscribe) unsubscribe()
          else if (typeof overlay.offEvent === "function") {
            overlay.offEvent(wrapped)
          }
        } catch {
          // Best effort; the preload owns the real listener.
        }
      }
    },
  }
}

/**
 * Start/keep/restart/stop decision for the OS overlay. `suppressedTrackSid`
 * remembers an explicit toolbar exit so the overlay does not immediately
 * reopen while the same share is still active.
 */
export const evaluateOverlayLifecycle = ({
  bridgeAvailable = false,
  isPresenter = false,
  isFullDisplay = false,
  isShareActive = false,
  trackSid = null,
  displayId = null,
  overlayTrackSid = null,
  suppressedTrackSid = null,
} = {}) => {
  const hasTrack = typeof trackSid === "string" && trackSid.length > 0
  const hasDisplay =
    (typeof displayId === "string" && displayId.length > 0) ||
    (typeof displayId === "number" && Number.isFinite(displayId))
  const eligible = Boolean(
    bridgeAvailable &&
      isPresenter &&
      isFullDisplay &&
      isShareActive &&
      hasTrack &&
      hasDisplay,
  )

  if (!eligible) {
    return overlayTrackSid ? "stop" : "idle"
  }

  if (suppressedTrackSid && suppressedTrackSid === trackSid) {
    return overlayTrackSid === trackSid ? "stop" : "idle"
  }

  if (overlayTrackSid === trackSid) return "keep"
  return overlayTrackSid ? "restart" : "start"
}

const copyItem = (item) => {
  if (!item || typeof item !== "object") return null
  if (item.kind === "stroke") {
    if (!Array.isArray(item.pts) || item.pts.length === 0) return null
    return {
      ...item,
      pts: item.pts
        .filter(isNormalizedPoint)
        .slice(0, MAX_STROKE_POINTS)
        .map(roundPoint),
    }
  }
  if (item.kind === "shape") {
    if (
      !isNormalizedCoordinate(item.x1) ||
      !isNormalizedCoordinate(item.y1) ||
      !isNormalizedCoordinate(item.x2) ||
      !isNormalizedCoordinate(item.y2)
    ) {
      return null
    }
    return { ...item }
  }
  if (item.kind === "text") {
    if (
      typeof item.text !== "string" ||
      item.text.length === 0 ||
      !isNormalizedCoordinate(item.x) ||
      !isNormalizedCoordinate(item.y)
    ) {
      return null
    }
    return { ...item }
  }
  return null
}

const copyLaser = (laser) => {
  if (!laser || typeof laser !== "object" || !Array.isArray(laser.trail)) {
    return null
  }

  const trail = laser.trail
    .filter(
      (point) =>
        point &&
        isNormalizedCoordinate(point.x) &&
        isNormalizedCoordinate(point.y) &&
        isFiniteNumber(point.ts),
    )
    .slice(-MAX_LASER_POINTS)
    .map((point) => ({
      x: round4(point.x),
      y: round4(point.y),
      ts: point.ts,
    }))

  if (trail.length === 0) return null
  return {
    color: isColor(laser.color) ? laser.color : ANNOTATION_COLORS[0],
    authorName:
      typeof laser.authorName === "string"
        ? laser.authorName.slice(0, MAX_AUTHOR_NAME_LENGTH)
        : "",
    trail,
  }
}

/** Coalesced state sent to the overlay windows via `overlay:update-state`. */
export const buildOverlayState = ({
  items = [],
  lasers = [],
  tool = "mouse",
  color = ANNOTATION_COLORS[0],
  width = ANNOTATION_WIDTHS[1],
  canAnnotate = false,
  presenterLocked = false,
  authorId = "",
  authorName = "",
  mode = null,
} = {}) => {
  const normalizedTool = OVERLAY_TOOLS.has(tool) ? tool : "mouse"
  const normalizedItems = Array.isArray(items)
    ? items.map(copyItem).filter(Boolean)
    : []
  const normalizedLasers = Array.isArray(lasers)
    ? lasers.map(copyLaser).filter(Boolean).slice(-MAX_OVERLAY_LASERS)
    : []

  return {
    items:
      normalizedItems.length > MAX_ANNOTATION_ITEMS
        ? normalizedItems.slice(normalizedItems.length - MAX_ANNOTATION_ITEMS)
        : normalizedItems,
    lasers: normalizedLasers,
    tool: normalizedTool,
    color: ANNOTATION_COLORS.includes(color) ? color : ANNOTATION_COLORS[0],
    width: ANNOTATION_WIDTHS.includes(width) ? width : ANNOTATION_WIDTHS[1],
    canAnnotate: canAnnotate === true,
    presenterLocked: presenterLocked === true,
    authorId: authorId === null || authorId === undefined ? "" : String(authorId),
    authorName:
      typeof authorName === "string"
        ? authorName.slice(0, MAX_AUTHOR_NAME_LENGTH)
        : "",
    mode: mode === "draw" ? "draw" : mode === "mouse" ? "mouse" : overlayModeForTool(normalizedTool),
  }
}

const stampIdentity = (item, { authorId, authorName }) => ({
  ...item,
  authorId,
  authorName,
})

const normalizeStrokeItem = (item, identity) => {
  if (!item || item.kind !== "stroke") return null
  if (!isId(item.id)) return null
  if (item.tool !== "pen" && item.tool !== "highlighter") return null
  if (!isColor(item.color) || !isWidth(item.width)) return null
  if (!Array.isArray(item.pts) || item.pts.length === 0) return null
  if (!item.pts.every(isNormalizedPoint)) return null

  return stampIdentity(
    {
      id: item.id,
      kind: "stroke",
      tool: item.tool,
      color: item.color,
      width: item.width,
      pts: item.pts.slice(0, MAX_STROKE_POINTS).map(roundPoint),
    },
    identity,
  )
}

const normalizeShapeItem = (item, identity) => {
  if (!item || item.kind !== "shape") return null
  if (!isId(item.id)) return null
  if (!SHAPE_TOOLS.has(item.tool)) return null
  if (!isColor(item.color) || !isWidth(item.width)) return null
  if (
    !isNormalizedCoordinate(item.x1) ||
    !isNormalizedCoordinate(item.y1) ||
    !isNormalizedCoordinate(item.x2) ||
    !isNormalizedCoordinate(item.y2)
  ) {
    return null
  }

  return stampIdentity(
    {
      id: item.id,
      kind: "shape",
      tool: item.tool,
      color: item.color,
      width: item.width,
      x1: round4(item.x1),
      y1: round4(item.y1),
      x2: round4(item.x2),
      y2: round4(item.y2),
    },
    identity,
  )
}

const normalizeTextItem = (item, identity) => {
  if (!item || item.kind !== "text") return null
  if (!isId(item.id)) return null
  if (!isColor(item.color)) return null
  if (!isFiniteNumber(item.fontSize) || item.fontSize <= 0 || item.fontSize > 200) {
    return null
  }
  if (!isNormalizedCoordinate(item.x) || !isNormalizedCoordinate(item.y)) {
    return null
  }
  if (
    typeof item.text !== "string" ||
    item.text.length === 0 ||
    item.text.length > ANNOTATION_TEXT_MAX_LENGTH
  ) {
    return null
  }

  return stampIdentity(
    {
      id: item.id,
      kind: "text",
      color: item.color,
      fontSize: item.fontSize,
      x: round4(item.x),
      y: round4(item.y),
      text: item.text,
    },
    identity,
  )
}

/**
 * Translate one overlay event into either a protocol packet or a local tool
 * control. Returns null for anything malformed or for a missing `trackSid`.
 */
export const translateOverlayEvent = (
  event,
  { trackSid = null, authorId = "", authorName = "", now = () => Date.now() } = {},
) => {
  if (!event || typeof event !== "object" || !trackSid) return null

  const identity = {
    authorId: authorId === null || authorId === undefined ? "" : String(authorId),
    authorName:
      typeof authorName === "string" && authorName
        ? authorName.slice(0, MAX_AUTHOR_NAME_LENGTH)
        : "Guest",
  }

  switch (event.type) {
    case "stroke-start": {
      if (!isId(event.id)) return null
      if (event.tool !== "pen" && event.tool !== "highlighter") return null
      if (!isColor(event.color) || !isWidth(event.width)) return null
      if (!isNormalizedPoint(event.pt)) return null

      return {
        packet: buildStrokeStartPacket({
          trackSid,
          id: event.id,
          tool: event.tool,
          color: event.color,
          width: event.width,
          authorId: identity.authorId,
          authorName: identity.authorName,
          pt: roundPoint(event.pt),
        }),
      }
    }
    case "stroke-point": {
      if (!isId(event.id)) return null
      const rawPoints = Array.isArray(event.pts)
        ? event.pts
        : isNormalizedPoint(event.pt)
          ? [event.pt]
          : []
      if (rawPoints.length === 0 || !rawPoints.every(isNormalizedPoint)) {
        return null
      }

      return {
        packet: buildStrokePointPacket({
          trackSid,
          id: event.id,
          pts: rawPoints.slice(0, MAX_POINT_BATCH).map(roundPoint),
        }),
      }
    }
    case "stroke-end": {
      const item = normalizeStrokeItem(event.item, identity)
      return item ? { packet: buildStrokeEndPacket({ trackSid, item }), item } : null
    }
    case "shape-commit": {
      const item = normalizeShapeItem(event.item, identity)
      return item
        ? { packet: buildShapeCommitPacket({ trackSid, item }), item }
        : null
    }
    case "text-commit": {
      const item = normalizeTextItem(event.item, identity)
      return item
        ? { packet: buildTextCommitPacket({ trackSid, item }), item }
        : null
    }
    case "laser-move": {
      if (!isNormalizedCoordinate(event.x) || !isNormalizedCoordinate(event.y)) {
        return null
      }
      if (!isColor(event.color)) return null

      return {
        packet: buildLaserMovePacket({
          trackSid,
          authorName: identity.authorName,
          color: event.color,
          x: round4(event.x),
          y: round4(event.y),
          ts: isFiniteNumber(event.ts) ? event.ts : now(),
        }),
      }
    }
    case "erase": {
      if (
        !Array.isArray(event.ids) ||
        event.ids.length === 0 ||
        event.ids.length > MAX_ERASE_IDS ||
        !event.ids.every(isId)
      ) {
        return null
      }

      return { packet: buildErasePacket({ trackSid, ids: [...event.ids] }) }
    }
    case "mode-change": {
      if (event.mode !== "draw" && event.mode !== "mouse") return null
      return { control: { type: "mode-change", mode: event.mode } }
    }
    case "tool-change": {
      if (!OVERLAY_TOOLS.has(event.tool)) return null
      return { control: { type: "tool-change", tool: event.tool } }
    }
    case "color-change": {
      if (!isColor(event.color)) return null
      return { control: { type: "color-change", color: event.color } }
    }
    case "width-change": {
      if (!ANNOTATION_WIDTHS.includes(event.width)) return null
      return { control: { type: "width-change", width: event.width } }
    }
    case "exit":
      return { control: { type: "exit" } }
    default:
      return null
  }
}
