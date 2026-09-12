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
