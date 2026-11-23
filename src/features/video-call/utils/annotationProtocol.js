/**
 * Screen-annotation DataChannel contract v1 (topic: `screen-annotation`).
 *
 * Every packet carries `v: 1` and the `trackSid` of the screen share it
 * belongs to. Coordinates are normalized `[0..1]` against the source video
 * frame. Live strokes are lossy; commits/erases/clears/snapshots are reliable.
 * Late joiners receive the store in `sync-snap` chunks of at most 12 KB.
 *
 * This module is pure: encoding, validation, chunking and the 400-item FIFO
 * store. The hook owns timers/publishing; the renderer owns pixels.
 */

import { clamp01, simplifyPoints } from "./annotationGeometry.js"

export const ANNOTATION_TOPIC = "screen-annotation"
export const ANNOTATION_PROTOCOL_VERSION = 1

/** Maximum encoded size of one `sync-snap` packet (header included). */
export const MAX_SYNC_PACKET_BYTES = 12 * 1024

/** Maximum buffered objects per `trackSid` (FIFO beyond this). */
export const MAX_ANNOTATION_ITEMS = 400

/** Defensive bounds for a malicious/buggy sender. */
export const MAX_SYNC_CHUNKS = 128
export const MAX_STROKE_POINTS = 600
export const MAX_POINT_BATCH = 2000
export const MAX_ERASE_IDS = 500

/** Host fallback delay when the presenter did not answer a `sync-req`. */
export const SYNC_REQUEST_FALLBACK_MS = 400

export const ANNOTATION_TOOLS = new Set(["pen", "highlighter"])
export const CLEAR_SCOPES = new Set(["mine", "others", "all"])

export const ANNOTATION_PACKET_TYPES = new Set([
  "stroke-start",
  "stroke-point",
  "stroke-end",
  "shape-commit",
  "text-commit",
  "laser-move",
  "erase",
  "undo",
  "redo",
  "clear",
  "presenter-lock",
  "sync-req",
  "sync-snap",
])

/** Toolbar palette (8 colours, 3 widths). */
export const ANNOTATION_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ffffff",
]
export const ANNOTATION_WIDTHS = [2, 4, 8]

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value)

const isNonEmptyString = (value) =>
  typeof value === "string" && value.length > 0

const isNormalizedCoordinate = (value) =>
  isFiniteNumber(value) && value >= 0 && value <= 1

const isNormalizedPoint = (point) =>
  Array.isArray(point) &&
  point.length === 2 &&
  isNormalizedCoordinate(point[0]) &&
  isNormalizedCoordinate(point[1])

const roundPoint = (point) => [
  Number(clamp01(point[0]).toFixed(4)),
  Number(clamp01(point[1]).toFixed(4)),
]

const normalizePoints = (points) => points.map(roundPoint)

const isWidth = (value) => isFiniteNumber(value) && value > 0 && value <= 64

const isValidIdList = (ids) =>
  Array.isArray(ids) &&
  ids.length > 0 &&
  ids.length <= MAX_ERASE_IDS &&
  ids.every(isNonEmptyString)

const validateStrokeItem = (item) => {
  if (!item || typeof item !== "object") return null
  if (item.kind !== "stroke") return null
  if (!isNonEmptyString(item.id)) return null
  if (!ANNOTATION_TOOLS.has(item.tool)) return null
  if (!isNonEmptyString(item.color)) return null
  if (!isWidth(item.width)) return null
  if (!isNonEmptyString(item.authorId)) return null
  if (!isNonEmptyString(item.authorName)) return null
  if (
    !Array.isArray(item.pts) ||
    item.pts.length === 0 ||
    item.pts.length > MAX_STROKE_POINTS ||
    !item.pts.every(isNormalizedPoint)
  ) {
    return null
  }

  return {
    id: item.id,
    kind: "stroke",
    tool: item.tool,
    color: item.color,
    width: item.width,
    authorId: item.authorId,
    authorName: item.authorName,
    pts: normalizePoints(item.pts),
  }
}

/**
 * Validate and normalize one raw packet. Returns null for anything that
 * should never reach the store, so callers can safely ignore bad payloads.
 */
export const validateAnnotationPacket = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  if (raw.v !== ANNOTATION_PROTOCOL_VERSION) return null
  if (!isNonEmptyString(raw.trackSid) || raw.trackSid.length > 256) return null
  if (!ANNOTATION_PACKET_TYPES.has(raw.t)) return null

  const base = {
    v: ANNOTATION_PROTOCOL_VERSION,
    trackSid: raw.trackSid,
    t: raw.t,
  }

  switch (raw.t) {
    case "stroke-start": {
      if (!isNonEmptyString(raw.id)) return null
      if (!ANNOTATION_TOOLS.has(raw.tool)) return null
      if (!isNonEmptyString(raw.color)) return null
      if (!isWidth(raw.width)) return null
      if (!isNonEmptyString(raw.authorName)) return null
      if (!isNormalizedPoint(raw.pt)) return null
      const packet = {
        ...base,
        id: raw.id,
        tool: raw.tool,
        color: raw.color,
        width: raw.width,
        authorName: raw.authorName,
        pt: roundPoint(raw.pt),
      }
      if (isNonEmptyString(raw.authorId)) packet.authorId = raw.authorId
      return packet
    }
    case "stroke-point": {
      if (!isNonEmptyString(raw.id)) return null
      if (
        !Array.isArray(raw.pts) ||
        raw.pts.length === 0 ||
        raw.pts.length > MAX_POINT_BATCH ||
        !raw.pts.every(isNormalizedPoint)
      ) {
        return null
      }
      return { ...base, id: raw.id, pts: normalizePoints(raw.pts) }
    }
    case "stroke-end": {
      const item = validateStrokeItem(raw.item)
      return item ? { ...base, item } : null
    }
    case "erase":
      return isValidIdList(raw.ids) ? { ...base, ids: [...raw.ids] } : null
    case "clear": {
      if (!CLEAR_SCOPES.has(raw.scope)) return null
      const packet = { ...base, scope: raw.scope }
      if (isNonEmptyString(raw.authorId)) packet.authorId = raw.authorId
      return packet
    }
    case "presenter-lock":
      return typeof raw.locked === "boolean"
        ? { ...base, locked: raw.locked }
        : null
    case "laser-move":
      if (!isNonEmptyString(raw.authorName)) return null
      if (!isNonEmptyString(raw.color)) return null
      if (!isNormalizedCoordinate(raw.x) || !isNormalizedCoordinate(raw.y)) {
        return null
      }
      if (!isFiniteNumber(raw.ts)) return null
      return {
        ...base,
        authorName: raw.authorName,
        color: raw.color,
        x: raw.x,
        y: raw.y,
        ts: raw.ts,
      }
    case "sync-req":
      return isNonEmptyString(raw.requesterId)
        ? { ...base, requesterId: raw.requesterId }
        : null
    case "sync-snap": {
      if (!isNonEmptyString(raw.snapId)) return null
      if (!Number.isInteger(raw.chunkIndex) || raw.chunkIndex < 0) return null
      if (
        !Number.isInteger(raw.totalChunks) ||
        raw.totalChunks < 1 ||
        raw.totalChunks > MAX_SYNC_CHUNKS ||
        raw.chunkIndex >= raw.totalChunks
      ) {
        return null
      }
      if (typeof raw.presenterLocked !== "boolean") return null
      if (!Array.isArray(raw.itemsChunk)) return null

      const itemsChunk = raw.itemsChunk
        .map(validateStrokeItem)
        .filter(Boolean)
        .slice(0, MAX_ANNOTATION_ITEMS)

      return {
        ...base,
        snapId: raw.snapId,
        chunkIndex: raw.chunkIndex,
        totalChunks: raw.totalChunks,
        presenterLocked: raw.presenterLocked,
        itemsChunk,
      }
    }
    // Shapes, text and undo/redo are declared in protocol v1 but implemented
    // by ticket 03. Ignore them safely until the store/renderer grow support.
    default:
      return null
  }
}

/** Encode a packet as UTF-8 JSON. Throws so a bug never hits the wire. */
export const encodeAnnotationPacket = (packet) => {
  const valid = validateAnnotationPacket(packet)
  if (!valid) throw new Error("Invalid screen-annotation packet")
  return encoder.encode(JSON.stringify(valid))
}

/**
 * Decode bytes/string/object. Never throws; returns null for unsupported or
 * malformed payloads so every receive site can safely ignore them.
 */
export const decodeAnnotationPacket = (payload) => {
  let raw = payload
  try {
    if (payload == null) return null
    if (typeof payload === "string") {
      raw = JSON.parse(payload)
    } else if (payload instanceof Uint8Array) {
      raw = JSON.parse(decoder.decode(payload))
    } else if (payload instanceof ArrayBuffer) {
      raw = JSON.parse(decoder.decode(new Uint8Array(payload)))
    } else if (ArrayBuffer.isView(payload)) {
      raw = JSON.parse(
        decoder.decode(
          new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength),
        ),
      )
    }
  } catch {
    return null
  }
  return validateAnnotationPacket(raw)
}

const packet = (trackSid, fields) => ({
  v: ANNOTATION_PROTOCOL_VERSION,
  trackSid,
  ...fields,
})

export const buildStrokeStartPacket = ({
  trackSid,
  id,
  tool,
  color,
  width,
  authorId,
  authorName,
  pt,
}) =>
  packet(trackSid, {
    t: "stroke-start",
    id,
    tool,
    color,
    width,
    authorName,
    ...(isNonEmptyString(authorId) ? { authorId } : {}),
    pt: roundPoint(pt),
  })

export const buildStrokePointPacket = ({ trackSid, id, pts }) =>
  packet(trackSid, {
    t: "stroke-point",
    id,
    pts: normalizePoints(pts ?? []),
  })

export const buildStrokeEndPacket = ({ trackSid, item }) =>
  packet(trackSid, {
    t: "stroke-end",
    item: {
      ...item,
      pts: normalizePoints(item?.pts ?? []),
    },
  })

export const buildErasePacket = ({ trackSid, ids }) =>
  packet(trackSid, { t: "erase", ids: [...(ids ?? [])] })

export const buildClearPacket = ({ trackSid, scope, authorId }) =>
  packet(trackSid, {
    t: "clear",
    scope,
    ...(isNonEmptyString(authorId) ? { authorId } : {}),
  })

export const buildSyncRequestPacket = ({ trackSid, requesterId }) =>
  packet(trackSid, { t: "sync-req", requesterId: String(requesterId ?? "") })

let snapshotSequence = 0
export const createSnapshotId = () => {
  snapshotSequence += 1
  return `snap-${Date.now().toString(36)}-${snapshotSequence.toString(36)}`
}

const measurePacket = (chunk, totalChunks) =>
  encoder.encode(JSON.stringify({ ...chunk, totalChunks })).byteLength

/**
 * Pack items into `sync-snap` chunks whose encoded size never exceeds 12 KB.
 * Items that cannot fit alone are dropped (the committed stroke path already
 * bounds point counts, so this only protects against hostile payloads).
 */
export const buildSyncSnapshotChunks = ({
  trackSid,
  items,
  snapId = createSnapshotId(),
  presenterLocked = false,
}) => {
  const validItems = (items ?? []).map(validateStrokeItem).filter(Boolean)
  if (validItems.length === 0) return []

  const header = {
    v: ANNOTATION_PROTOCOL_VERSION,
    trackSid,
    t: "sync-snap",
    snapId,
    chunkIndex: 0,
    totalChunks: 1,
    presenterLocked: Boolean(presenterLocked),
  }

  const groups = []
  let current = []

  for (const item of validItems) {
    const candidate = [...current, item]
    if (measurePacket({ ...header, itemsChunk: candidate }, 9999) > MAX_SYNC_PACKET_BYTES) {
      if (current.length > 0) {
        groups.push(current)
        current = [item]
        if (measurePacket({ ...header, itemsChunk: current }, 9999) > MAX_SYNC_PACKET_BYTES) {
          current = []
        }
      }
    } else {
      current = candidate
    }
  }
  if (current.length > 0) groups.push(current)

  if (groups.length === 0) return []

  return groups.map((itemsChunk, chunkIndex) => ({
    ...header,
    chunkIndex,
    totalChunks: groups.length,
    itemsChunk,
  }))
}

export const createAnnotationSyncBuffers = () => ({})

const MAX_BUFFERED_SNAPSHOTS = 4

/**
 * Fold one chunk into the reassembly buffers. Returns the next buffers plus
 * the complete item list once every chunk has arrived.
 */
export const reassembleSyncChunk = (buffers, rawPacket) => {
  const result = {
    buffers: buffers ?? createAnnotationSyncBuffers(),
    complete: false,
    items: null,
    presenterLocked: false,
    snapId: null,
  }

  const packet = validateAnnotationPacket(rawPacket)
  if (!packet || packet.t !== "sync-snap") return result

  result.snapId = packet.snapId

  const existing = result.buffers[packet.snapId]
  if (existing && existing.totalChunks !== packet.totalChunks) {
    return result
  }

  let nextBuffers = result.buffers
  let entry = existing
  if (!entry) {
    nextBuffers = { ...result.buffers }
    const keys = Object.keys(nextBuffers)
    if (keys.length >= MAX_BUFFERED_SNAPSHOTS) {
      delete nextBuffers[keys[0]]
    }
    entry = {
      totalChunks: packet.totalChunks,
      chunks: new Array(packet.totalChunks).fill(null),
      presenterLocked: packet.presenterLocked,
    }
    nextBuffers[packet.snapId] = entry
  }

  if (!entry.chunks[packet.chunkIndex]) {
    entry.chunks[packet.chunkIndex] = packet.itemsChunk
    entry.presenterLocked = packet.presenterLocked
  }

  const complete = entry.chunks.every(Boolean)
  if (!complete) {
    return { ...result, buffers: nextBuffers }
  }

  const { [packet.snapId]: _done, ...remaining } = nextBuffers
  return {
    ...result,
    buffers: remaining,
    complete: true,
    items: entry.chunks.flat(),
    presenterLocked: entry.presenterLocked,
  }
}

/** Append with the 400-object FIFO cap. */
export const appendAnnotationItem = (
  items,
  item,
  limit = MAX_ANNOTATION_ITEMS,
) => {
  if (!item) return items ?? []
  const next = [...(items ?? []), item]
  return next.length > limit ? next.slice(next.length - limit) : next
}

export const removeAnnotationItems = (items, ids) => {
  const remove = new Set(ids ?? [])
  if (remove.size === 0) return items ?? []
  return (items ?? []).filter((item) => !remove.has(item?.id))
}

export const canApplyClearScope = ({ scope, canModerate = false } = {}) => {
  if (scope === "mine") return true
  if (scope === "others" || scope === "all") return Boolean(canModerate)
  return false
}

export const clearAnnotationItems = (
  items,
  { scope, authorId = null, canModerate = false } = {},
) => {
  if (!canApplyClearScope({ scope, canModerate })) return items ?? []
  const source = items ?? []

  if (scope === "all") return []
  if (scope === "mine") {
    if (authorId == null) return source
    return source.filter((item) => String(item?.authorId) !== String(authorId))
  }
  // scope === "others": moderators keep their own strokes.
  if (authorId == null) return source
  return source.filter((item) => String(item?.authorId) === String(authorId))
}

/**
 * Snapshot items are authoritative for history (no author pill timestamps);
 * newer local items that were not in the snapshot survive at the end.
 */
export const mergeSnapshotItems = (
  existingItems,
  snapshotItems,
  limit = MAX_ANNOTATION_ITEMS,
) => {
  const merged = new Map()
  for (const item of snapshotItems ?? []) {
    if (!item?.id) continue
    merged.set(item.id, { ...item, createdAt: 0 })
  }
  for (const item of existingItems ?? []) {
    if (!item?.id || merged.has(item.id)) continue
    merged.set(item.id, item)
  }
  const result = [...merged.values()]
  return result.length > limit ? result.slice(result.length - limit) : result
}

/**
 * Round/simplify a committed stroke. Endpoints survive; tolerance is raised
 * until the wire payload fits the point budget.
 */
export const prepareStrokePoints = (
  points,
  { tolerance = 0.0015, maxPoints = MAX_STROKE_POINTS } = {},
) => {
  const cleaned = []
  for (const point of points ?? []) {
    if (!isNormalizedPoint(point)) continue
    const rounded = roundPoint(point)
    const previous = cleaned[cleaned.length - 1]
    if (previous && previous[0] === rounded[0] && previous[1] === rounded[1]) {
      continue
    }
    cleaned.push(rounded)
  }

  if (cleaned.length <= 2) return cleaned

  let currentTolerance = tolerance
  let simplified = simplifyPoints(cleaned, currentTolerance)
  while (simplified.length > maxPoints && currentTolerance < 0.25) {
    currentTolerance = Math.max(currentTolerance * 1.8, 0.003)
    simplified = simplifyPoints(cleaned, currentTolerance)
  }

  if (simplified.length <= maxPoints) return simplified

  const sampled = []
  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i * (simplified.length - 1)) / (maxPoints - 1))
    sampled.push(simplified[index])
  }
  return sampled
}
