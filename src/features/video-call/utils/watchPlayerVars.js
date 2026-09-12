/**
 * Pure seam for the watch-together player chrome (unit-testable).
 * Single source of truth for the YT.Player playerVars used by
 * SyncedYouTubePlayer — the room wants a fully chromeless surface driven
 * only by WatchTogetherToolbar.
 */
import { YT_PLAYER_STATE } from "./hostSync.js"
export const buildWatchPlayerVars = (origin) => ({
  rel: 0,
  playsinline: 1,
  modestbranding: 1,
  enablejsapi: 1,
  controls: 0,
  disablekb: 1,
  fs: 0,
  iv_load_policy: 3,
  origin,
})

const CENTER_PLAY_STATES = new Set([
  -1, // UNSTARTED (fires on cue; not in YT_PLAYER_STATE)
  YT_PLAYER_STATE.ENDED,
  YT_PLAYER_STATE.PAUSED,
  YT_PLAYER_STATE.CUED,
])

/**
 * Host-only center play affordance over the interaction shield. It replaces
 * the native center triangle (visible but dead behind the shield) and routes
 * through the same play() path as the toolbar, so useHostSync still
 * publishes the transition. Never shown to viewers (they follow the host),
 * over errors, or over the tap-to-sync gate.
 */
export const shouldShowCenterPlay = (
  playerState,
  { isHost = false, needsTapToSync = false, hasError = false } = {},
) =>
  !!isHost &&
  !needsTapToSync &&
  !hasError &&
  CENTER_PLAY_STATES.has(playerState)

/**
 * Local-only CC preference (Q6=A, Q8=A). Each viewer toggles captions on
 * their own copy; nothing is published over watch-sync. Stored as "1"/"0"
 * so the choice survives video swaps and re-joins on the same device.
 */
export const WATCH_CC_STORAGE_KEY = "catspeak:watch-cc-enabled"

export const readWatchCcEnabled = (storage = null) => {
  try {
    const store =
      storage ??
      (typeof window !== "undefined" ? window.localStorage : null)
    return store?.getItem?.(WATCH_CC_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export const writeWatchCcEnabled = (enabled, storage = null) => {
  try {
    const store =
      storage ??
      (typeof window !== "undefined" ? window.localStorage : null)
    if (!store) return
    if (enabled) store.setItem?.(WATCH_CC_STORAGE_KEY, "1")
    else store.removeItem?.(WATCH_CC_STORAGE_KEY)
  } catch {
    // Private-mode storage failures must never break playback.
  }
}

/**
 * Applies a local CC preference to a YT.Player. Enabled loads the captions
 * module (YouTube auto-picks the track); disabled unloads it so forced
 * subtitles never cover the shared video. Returns false only when the
 * player is missing/torn down.
 */
export const applyWatchCcPreference = (player, enabled) => {
  if (!player) return false
  try {
    if (enabled) player.loadModule?.("captions")
    else player.unloadModule?.("captions")
    return true
  } catch {
    return false
  }
}

/**
 * Returns the YouTube captions tracklist when the API exposes it, an empty
 * array when the video has no tracks, or null when unknown (player not
 * ready / older embed without getOption). Callers should only disable the
 * CC button on a confirmed empty array, never on null.
 */
export const getWatchCaptionTracks = (player) => {
  if (!player) return null
  try {
    const list = player.getOption?.("captions", "tracklist")
    return Array.isArray(list) ? list : null
  } catch {
    return null
  }
}
