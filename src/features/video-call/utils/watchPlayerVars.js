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
 * Picks the best captions track for the local viewer. Prefers the given
 * language codes in order (prefix match, so "vi" matches "vi-VN"), then
 * falls back to the first available track. Returns null when empty.
 */
export const pickWatchCaptionTrack = (tracks, preferred = ["vi", "en"]) => {
  if (!Array.isArray(tracks) || tracks.length === 0) return null
  const langs = (preferred ?? []).map((l) => String(l).toLowerCase())
  for (const lang of langs) {
    const hit = tracks.find((t) =>
      String(t?.languageCode ?? "").toLowerCase().startsWith(lang),
    )
    if (hit) return hit
  }
  return tracks[0] ?? null
}

/**
 * Enables local captions: loads the captions module and selects the best
 * track. Returns true on success, false when the video exposes no tracks
 * (caller should revert + mark the CC button unavailable).
 */
export const enableWatchCaptions = (player, preferred = ["vi", "en"]) => {
  if (!player) return false
  try {
    player.loadModule?.("captions")
    const tracks = getWatchCaptionTracks(player)
    const picked = pickWatchCaptionTrack(tracks ?? [], preferred)
    if (!picked?.languageCode) return false
    player.setOption?.("captions", "track", {
      languageCode: picked.languageCode,
    })
    return true
  } catch {
    return false
  }
}

/**
 * Disables local captions but KEEPS the module loaded (track cleared).
 * Unloading would make getOption("captions", "tracklist") report empty and
 * the toolbar would wrongly disable the CC button for videos that DO have
 * captions — the false-negative this fixes.
 */
export const disableWatchCaptions = (player) => {
  if (!player) return false
  try {
    if (typeof player.setOption === "function") {
      player.setOption("captions", "track", {})
      return true
    }
    player.unloadModule?.("captions")
    return true
  } catch {
    return false
  }
}

/**
 * Applies a local CC preference to a YT.Player. Enabled selects the best
 * track (vi → en → first); disabled clears the track while keeping the
 * module loaded so availability stays queryable. Returns false only when
 * the player is missing/torn down, or when enabling a video with no
 * tracks.
 */
export const applyWatchCcPreference = (player, enabled) => {
  if (!player) return false
  if (enabled) return enableWatchCaptions(player)
  return disableWatchCaptions(player)
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
