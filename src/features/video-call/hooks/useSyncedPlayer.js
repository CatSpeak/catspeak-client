import { useCallback, useEffect, useRef, useState } from "react"
import { RoomEvent } from "livekit-client"
import {
  WATCH_SYNC_TOPIC,
  parseWatchSyncMessage,
} from "@/features/video-call/utils/watchSync"
import {
  createWatchSyncState,
  applyWatchSyncMessage,
  tapToSync as tapToSyncState,
  reportPlayerError,
} from "@/features/video-call/utils/watchSyncMachine"

const runPlayerEffect = (playerRef, effect) => {
  const player = playerRef?.current
  if (!player) return
  try {
    switch (effect.type) {
      case "load":
        player.loadVideo?.(effect.videoId)
        break
      case "play":
        if (effect.position != null) player.playAt?.(effect.position)
        else player.play?.()
        break
      case "pause":
        if (effect.position != null) player.pauseAt?.(effect.position)
        else player.pause?.()
        break
      case "seek":
        if (effect.position != null) player.seekTo?.(effect.position)
        break
      case "stop":
        player.stop?.()
        break
      default:
        break
    }
  } catch {
    // Player not ready yet (API still loading) — the next heartbeat or tap
    // re-applies the staged target, so a dropped effect self-heals.
  }
}

/**
 * Viewer-side binding for watch-sync playback.
 *
 * Subscribes to the `watch-sync` DataChannel topic, folds every command and
 * heartbeat through the pure sync machine, and executes the resulting player
 * effects. All branching lives in the tested machine — this hook only wires
 * LiveKit events to it.
 *
 * @param {object} args
 * @param {import("livekit-client").Room|null} args.lkRoom LiveKit room (null until joined)
 * @param {React.RefObject} args.playerRef imperative SyncedYouTubePlayer handle
 * @param {{videoId:string,title:string|null}|null} args.initialMedia late-joiner seed from media/status
 * @param {boolean} args.disabled skip the subscription (host drives its own copy)
 */
export const useSyncedPlayer = ({
  lkRoom,
  playerRef,
  initialMedia = null,
  disabled = false,
}) => {
  const [syncState, setSyncState] = useState(() => createWatchSyncState())
  // Mirrors for event handlers/subscriptions (refs must only be written in
  // effects or handlers — never during render). Declared before the
  // subscription effect so values are fresh when DataChannel events fire.
  const stateRef = useRef(syncState)
  const playerRefHolder = useRef(playerRef)
  useEffect(() => {
    stateRef.current = syncState
    playerRefHolder.current = playerRef
  })

  const applyEffects = useCallback((effects) => {
    const handle = playerRefHolder.current
    effects.forEach((effect) => runPlayerEffect(handle, effect))
  }, [])

  // Late joiner: cue whatever the API status says is on (Ticket 04 passes it).
  const cueInitial = useCallback(
    (media) => {
      if (!media?.videoId) return
      if (stateRef.current.status !== "idle") return
      const { state, effects } = applyWatchSyncMessage(
        stateRef.current,
        { type: "load", videoId: media.videoId, title: media.title ?? null },
        Date.now(),
        null,
      )
      setSyncState(state)
      applyEffects(effects)
    },
    [applyEffects],
  )

  useEffect(() => {
    if (disabled || !initialMedia?.videoId) return
    cueInitial(initialMedia)
  }, [initialMedia, cueInitial, disabled])

  useEffect(() => {
    if (disabled || !lkRoom) return

    const handleData = (payload, _participant, _kind, topic) => {
      if (topic !== WATCH_SYNC_TOPIC) return
      const msg = parseWatchSyncMessage(payload)
      if (!msg) return

      let currentPosition = null
      try {
        currentPosition =
          playerRefHolder.current?.current?.getCurrentTime?.() ?? null
      } catch {
        currentPosition = null
      }

      const { state, effects } = applyWatchSyncMessage(
        stateRef.current,
        msg,
        Date.now(),
        currentPosition,
      )
      setSyncState(state)
      applyEffects(effects)
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom, applyEffects, disabled])

  // The explicit sync gesture: unlocks autoplay and jumps to the staged target.
  const tapToSync = useCallback(() => {
    const { state, effects } = tapToSyncState(stateRef.current)
    setSyncState(state)
    applyEffects(effects)
  }, [applyEffects])

  // YouTube player error codes (101/150 = embedding disabled, per viewer).
  const reportError = useCallback((code) => {
    const { state } = reportPlayerError(stateRef.current, code)
    setSyncState(state)
  }, [])

  // Server-driven end (e.g. the MediaEnded SignalR event when the host did
  // not publish stop): reset this viewer's copy to idle.
  const stopLocal = useCallback(() => {
    const { state, effects } = applyWatchSyncMessage(
      stateRef.current,
      { type: "stop" },
      Date.now(),
      null,
    )
    setSyncState(state)
    applyEffects(effects)
  }, [applyEffects])

  return {
    syncState,
    videoId: syncState.videoId,
    title: syncState.title,
    needsTapToSync:
      syncState.status === "ready" && !syncState.hasInteracted,
    syncError: syncState.status === "error" ? syncState.error : null,
    isSyncActive: syncState.status !== "idle",
    tapToSync,
    reportError,
    cueInitial,
    stopLocal,
  }
}
