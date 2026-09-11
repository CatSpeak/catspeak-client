import {
  WATCH_SYNC_TYPES,
  extrapolatePosition,
  shouldSilentSeek,
} from "./watchSync.js"

/**
 * Pure viewer-side state machine for watch-sync playback.
 *
 * Browsers gate audible autoplay behind a user gesture, so a viewer that has
 * not interacted yet never touches the player: commands are staged and the
 * single "tap to sync" gesture both unlocks playback and jumps to the staged
 * target. The React hook (`useSyncedPlayer`) is a thin binding — it feeds
 * DataChannel messages in and executes the returned effects on the player.
 *
 * Effects (the only player operations): {type:'load',videoId,title},
 * {type:'play'|'pause'|'seek',position}, {type:'seek',position,silent:true},
 * {type:'stop'}.
 */

export const createWatchSyncState = () => ({
  status: "idle", // idle | ready | error
  videoId: null,
  title: null,
  hasInteracted: false,
  stagedPosition: null,
  stagedPlaying: false,
  lastTarget: null,
  error: null, // {kind:'embed-blocked'|'playback-error', code?}
})

/**
 * Fold one parsed watch-sync message into state.
 * @param {object} state machine state
 * @param {object|null} msg parsed message (null/unknown → ignored)
 * @param {number} nowMs receiver clock (Date.now())
 * @param {number|null} currentPosition player clock for drift checks
 */
export const applyWatchSyncMessage = (state, msg, nowMs, currentPosition) => {
  if (!msg || typeof msg !== "object" || !WATCH_SYNC_TYPES.has(msg.type)) {
    return { state, effects: [] }
  }

  switch (msg.type) {
    case "load": {
      return {
        state: {
          ...state,
          status: "ready",
          videoId: msg.videoId,
          title: msg.title ?? null,
          stagedPosition: 0,
          stagedPlaying: false,
          lastTarget: 0,
          error: null,
        },
        effects: [{ type: "load", videoId: msg.videoId, title: msg.title ?? null }],
      }
    }

    case "play": {
      const target = extrapolatePosition(msg.position, msg.atTs, nowMs)
      if (!state.hasInteracted) {
        return {
          state: { ...state, stagedPosition: target, stagedPlaying: true, lastTarget: target },
          effects: [],
        }
      }
      return {
        state: { ...state, lastTarget: target },
        effects: [{ type: "play", position: target }],
      }
    }

    case "pause": {
      if (!state.hasInteracted) {
        return {
          state: {
            ...state,
            stagedPosition: msg.position,
            stagedPlaying: false,
            lastTarget: msg.position,
          },
          effects: [],
        }
      }
      return {
        state: { ...state, lastTarget: msg.position },
        effects: [{ type: "pause", position: msg.position }],
      }
    }

    case "seek": {
      if (!state.hasInteracted) {
        return {
          state: { ...state, stagedPosition: msg.position, lastTarget: msg.position },
          effects: [],
        }
      }
      return {
        state: { ...state, lastTarget: msg.position },
        effects: [{ type: "seek", position: msg.position }],
      }
    }

    case "sync": {
      const target = msg.playing
        ? extrapolatePosition(msg.position, msg.atTs, nowMs)
        : msg.position
      if (!state.hasInteracted) {
        return {
          state: {
            ...state,
            stagedPosition: target,
            stagedPlaying: msg.playing,
            lastTarget: target,
          },
          effects: [],
        }
      }
      if (
        state.status === "ready" &&
        shouldSilentSeek(currentPosition, target)
      ) {
        return {
          state: { ...state, lastTarget: target },
          effects: [{ type: "seek", position: target, silent: true }],
        }
      }
      return { state: { ...state, lastTarget: target }, effects: [] }
    }

    case "stop": {
      return {
        state: {
          ...state,
          status: "idle",
          videoId: null,
          title: null,
          stagedPosition: null,
          stagedPlaying: false,
          lastTarget: null,
          error: null,
        },
        effects: [{ type: "stop" }],
      }
    }

    default:
      return { state, effects: [] }
  }
}

/**
 * The viewer's explicit sync gesture: unlock playback and apply whatever is
 * staged (jump to the latest known position, matching play/pause state).
 */
export const tapToSync = (state) => {
  const next = { ...state, hasInteracted: true }
  if (state.status !== "ready" || state.stagedPosition == null) {
    return { state: next, effects: [] }
  }
  const playOrPause = state.stagedPlaying ? "play" : "pause"
  return {
    state: { ...next, lastTarget: state.stagedPosition },
    effects: [
      { type: "seek", position: state.stagedPosition },
      { type: playOrPause, position: state.stagedPosition },
    ],
  }
}

/**
 * Map a YouTube player error onto an on-the-spot error card. 101/150 mean
 * the owner disabled embedding (or a regional block) — distinct from generic
 * playback/network failures so viewers know it is not a room-wide outage.
 */
export const reportPlayerError = (state, code) => {
  const embedBlocked = code === 101 || code === 150
  return {
    state: {
      ...state,
      status: "error",
      error: { kind: embedBlocked ? "embed-blocked" : "playback-error", code },
    },
    effects: [],
  }
}
