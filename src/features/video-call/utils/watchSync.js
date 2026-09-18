/**
 * watch-sync DataChannel contract (client-sync watch-together).
 *
 * Topic: `watch-sync`. Reliable commands: load{videoId,title},
 * play{position,atTs}, pause{position,atTs}, seek{position,atTs}, stop{}.
 * Lossy heartbeat every 5s: sync{position,playing,atTs}. `atTs` is the
 * sender's client-side clock (Date.now()) so the receiver can compensate
 * publish latency. Viewers silently re-seek past a 1.5s drift.
 */

export const WATCH_SYNC_TOPIC = "watch-sync"

/** Heartbeat cadence while presenting (lossy). */
export const SYNC_HEARTBEAT_INTERVAL_MS = 5000

/** Drift past which a viewer silently re-seeks (avoids jitter inside it). */
export const SYNC_DRIFT_THRESHOLD_S = 1.5

/** Message types on the watch-sync topic (single source of truth). */
export const WATCH_SYNC_TYPES = new Set([
  "load",
  "play",
  "pause",
  "seek",
  "stop",
  "sync",
])

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v)

const isValidPosition = (v) => isFiniteNumber(v) && v >= 0

const normalizeAtTs = (v) => (isFiniteNumber(v) ? v : null)

/**
 * Parse one watch-sync message from DataChannel bytes, a JSON string, or an
 * already-decoded object. Returns a normalized message or null when the
 * payload is not a well-formed watch-sync command (never throws).
 */
export const parseWatchSyncMessage = (payload) => {
  let json = null
  try {
    if (payload == null) return null
    if (payload instanceof Uint8Array) {
      json = JSON.parse(new TextDecoder().decode(payload))
    } else if (typeof payload === "string") {
      json = JSON.parse(payload)
    } else if (typeof payload === "object") {
      json = payload
    } else {
      return null
    }
  } catch {
    return null
  }

  if (!json || typeof json !== "object" || !WATCH_SYNC_TYPES.has(json.t)) {
    return null
  }

  switch (json.t) {
    case "load":
      if (typeof json.videoId !== "string" || json.videoId.length === 0) {
        return null
      }
      return {
        type: "load",
        videoId: json.videoId,
        title: typeof json.title === "string" ? json.title : null,
      }
    case "play":
    case "pause":
    case "seek":
      if (!isValidPosition(json.position)) return null
      return { type: json.t, position: json.position, atTs: normalizeAtTs(json.atTs) }
    case "sync":
      if (!isValidPosition(json.position)) return null
      if (typeof json.playing !== "boolean") return null
      return {
        type: "sync",
        position: json.position,
        playing: json.playing,
        atTs: normalizeAtTs(json.atTs),
      }
    case "stop":
      return { type: "stop" }
    default:
      return null
  }
}

/**
 * Build one watch-sync message for publishing (host side). Throws on
 * unknown types so a typo can never go on the wire silently.
 */
export const buildWatchSyncMessage = (type, fields = {}) => {
  if (!WATCH_SYNC_TYPES.has(type)) {
    throw new Error(`Unknown watch-sync message type: ${type}`)
  }
  return JSON.stringify({ t: type, ...fields })
}

/**
 * Compensate publish latency: where the sender's clock has moved since atTs.
 * Missing atTs or clock skew (atTs in the future) yields position as-is.
 */
export const extrapolatePosition = (position, atTs, nowMs) => {
  if (!isFiniteNumber(atTs) || !isFiniteNumber(nowMs)) return position
  const elapsed = (nowMs - atTs) / 1000
  return position + Math.max(0, elapsed)
}

/**
 * True only when the drift exceeds the threshold (strictly greater, so a
 * viewer sitting exactly on the boundary is left alone — no jitter).
 */
export const shouldSilentSeek = (
  currentPosition,
  targetPosition,
  thresholdS = SYNC_DRIFT_THRESHOLD_S,
) => {
  if (!isFiniteNumber(currentPosition) || !isFiniteNumber(targetPosition)) {
    return false
  }
  return Math.abs(targetPosition - currentPosition) > thresholdS
}
