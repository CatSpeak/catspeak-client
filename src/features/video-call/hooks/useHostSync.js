import { useCallback, useEffect } from "react"
import { WATCH_SYNC_TOPIC } from "@/features/video-call/utils/watchSync"
import {
  HOST_TRACK_INTERVAL_MS,
  HOST_HEARTBEAT_INTERVAL_MS,
  YT_PLAYER_STATE,
  buildCommandPayload,
  buildHeartbeatPayload,
  detectHostTransition,
  shouldRunHostSync,
  encodeSyncPayload,
} from "@/features/video-call/utils/hostSync"

const readSample = (playerRef) => {
  const player = playerRef?.current
  if (!player) return null
  let ytState = null
  let position = null
  try {
    ytState = player.getPlayerState?.() ?? null
  } catch {
    ytState = null
  }
  try {
    position = player.getCurrentTime?.() ?? null
  } catch {
    position = null
  }
  if (typeof ytState !== "number") return null
  if (typeof position !== "number" || !Number.isFinite(position)) return null
  return { ytState, position }
}

/**
 * Host-side watch-sync publisher.
 *
 * The host drives its own player copy directly (native YouTube controls), so
 * this hook watches it instead: a 500ms tracker publishes reliable
 * play/pause/seek the moment the host's state flips or jumps, and a 5s
 * lossy heartbeat keeps lagging viewers glued. Both loops die with the
 * effect (stop, inactive, unmount). Non-hosts get inert callbacks.
 */
export const useHostSync = ({ lkRoom, playerRef, isHost, isActive }) => {
  const publish = useCallback(
    (payload, reliable) => {
      if (!isHost) return false
      const local = lkRoom?.localParticipant
      if (!local) return false
      try {
        local.publishData(encodeSyncPayload(payload), {
          topic: WATCH_SYNC_TOPIC,
          reliable,
        })
        return true
      } catch {
        return false
      }
    },
    [lkRoom, isHost],
  )

  const publishLoad = useCallback(
    (videoId, title) =>
      publish({ t: "load", videoId, title: title ?? null }, true),
    [publish],
  )

  const publishStop = useCallback(() => publish({ t: "stop" }, true), [publish])

  useEffect(() => {
    if (!shouldRunHostSync({ isHost, isActive })) return
    if (!lkRoom) return

    let prev = null
    const track = setInterval(() => {
      const sample = readSample(playerRef)
      if (!sample) return
      const transition = detectHostTransition(prev, sample)
      prev = sample
      if (!transition) return
      publish(
        buildCommandPayload(transition.command, transition.position, Date.now()),
        true,
      )
    }, HOST_TRACK_INTERVAL_MS)

    const beat = setInterval(() => {
      const sample = readSample(playerRef)
      if (!sample) return
      publish(
        buildHeartbeatPayload(
          sample.position,
          sample.ytState === YT_PLAYER_STATE.PLAYING,
          Date.now(),
        ),
        false,
      )
    }, HOST_HEARTBEAT_INTERVAL_MS)

    return () => {
      clearInterval(track)
      clearInterval(beat)
    }
  }, [lkRoom, playerRef, isHost, isActive, publish])

  return { publishLoad, publishStop }
}
