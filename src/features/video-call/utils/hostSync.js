import {
  SYNC_HEARTBEAT_INTERVAL_MS,
  buildWatchSyncMessage,
} from "./watchSync.js"

/**
 * Host-side watch-sync helpers (pure; the interval wiring lives in
 * useHostSync). The host never applies incoming commands — it publishes:
 * reliable play/pause/seek/stop/load on user action, plus a lossy position
 * heartbeat so lagging viewers catch up without any server involvement.
 */

/** How often the host samples its own player for transitions. */
export const HOST_TRACK_INTERVAL_MS = 500

/** Re-exported so host and viewer agree on the heartbeat deal. */
export const HOST_HEARTBEAT_INTERVAL_MS = SYNC_HEARTBEAT_INTERVAL_MS

/**
 * Position jump that counts as a native seek (well above the viewer-side
 * 1.5s silent-seek threshold so the two never fight).
 */
export const SEEK_JUMP_THRESHOLD_S = 2

/** YouTube IFrame PlayerState values (no YT global needed to compare). */
export const YT_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}

const COMMAND_TYPES = new Set(["play", "pause", "seek"])

const isValidPosition = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0

/**
 * Payload for one reliable host command (viewer compensates atTs latency).
 * Throws on unknown types/bad positions so a bug never goes on the wire.
 */
export const buildCommandPayload = (command, position, atTs) => {
  if (!COMMAND_TYPES.has(command)) {
    throw new Error(`Unknown watch-sync host command: ${command}`)
  }
  if (!isValidPosition(position)) {
    throw new Error(`Invalid watch-sync position: ${position}`)
  }
  return { t: command, position, atTs }
}

/** Payload for one lossy heartbeat tick. */
export const buildHeartbeatPayload = (position, isPlaying, atTs) => ({
  t: "sync",
  position,
  playing: isPlaying === true,
  atTs,
})

/**
 * Fold one host player sample into the previous one. Returns the reliable
 * command to publish, or null when nothing worth broadcasting happened.
 * Buffering is transient noise (never emits); ended freezes via pause.
 */
export const detectHostTransition = (prev, next) => {
  if (!prev || !next) return null
  const { ytState: was, position: wasAt } = prev
  const { ytState: is, position: at } = next
  const { PLAYING, PAUSED, BUFFERING, CUED, ENDED } = YT_PLAYER_STATE

  if (is === PLAYING && was !== PLAYING && was !== BUFFERING) {
    return { command: "play", position: at }
  }
  if (was === PLAYING && (is === PAUSED || is === CUED || is === ENDED)) {
    return { command: "pause", position: at }
  }
  if (
    is === PLAYING &&
    was === PLAYING &&
    isValidPosition(wasAt) &&
    isValidPosition(at) &&
    Math.abs(at - wasAt) > SEEK_JUMP_THRESHOLD_S
  ) {
    return { command: "seek", position: at }
  }
  return null
}

/** The host loops only while it is the host and something is presenting. */
export const shouldRunHostSync = ({ isHost, isActive }) =>
  isHost === true && isActive === true

/** Encode a payload object for LiveKit publishData. */
export const encodeSyncPayload = (payload) => {
  const { t, ...fields } = payload
  return new TextEncoder().encode(buildWatchSyncMessage(t, fields))
}
