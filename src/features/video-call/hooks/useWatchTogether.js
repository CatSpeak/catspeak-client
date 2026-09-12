import { useCallback, useMemo, useRef } from "react"
import { toast } from "react-hot-toast"
import {
  useStartMediaMutation,
  useStopMediaMutation,
  useGetMediaStatusQuery,
} from "@/store/api/mediaApi"
import { useSyncedPlayer } from "@/features/video-call/hooks/useSyncedPlayer"
import { useHostSync } from "@/features/video-call/hooks/useHostSync"

/**
 * Orchestrates client-sync watch-together.
 *
 * The server is only a state ledger (which video is on): start/stop call the
 * lightweight media API, the host publishes load/stop plus live play/pause/
 * seek and a position heartbeat over the `watch-sync` DataChannel, and every
 * viewer (plus late joiners via the status seed) plays its own YouTube copy
 * in sync. No downloads, no ingress tracks, no progress polling.
 */
export const useWatchTogether = ({ sessionId, isHost, t, lkRoom }) => {
  const playerRef = useRef(null)

  // Ledger state: which video (if any) the room is presenting.
  const { data: mediaStatus } = useGetMediaStatusQuery(sessionId, {
    skip: !sessionId,
  })

  const [startMediaMutation, { isLoading: isStarting }] =
    useStartMediaMutation()
  const [stopMediaMutation, { isLoading: isStopping }] = useStopMediaMutation()

  const apiActive =
    mediaStatus?.status === "active" && !!mediaStatus?.videoId

  const initialMedia = useMemo(() => {
    if (!apiActive) return null
    return { videoId: mediaStatus.videoId, title: mediaStatus.title ?? null }
  }, [apiActive, mediaStatus])

  // Viewers follow commands; the host drives its own copy (disabled here).
  const viewer = useSyncedPlayer({
    lkRoom,
    playerRef,
    initialMedia,
    disabled: isHost,
  })
  const host = useHostSync({
    lkRoom,
    playerRef,
    isHost,
    isActive: apiActive,
  })
  const { publishLoad, publishStop } = host

  // A viewer with a cued/live video is presenting even before any API
  // refetch (live starts arrive over DataChannel, not polling). The ledger is
  // authoritative only for the host; viewers follow the live synced state so
  // a stop message hides the spotlight even when the cached status is stale.
  const viewerActive =
    !isHost && viewer.syncState.status !== "idle" && !!viewer.videoId

  const isMediaActive = isHost ? apiActive : viewerActive
  const videoId = isHost
    ? mediaStatus?.videoId ?? null
    : viewer.videoId ?? null
  const mediaTitle = isHost
    ? mediaStatus?.title || mediaStatus?.videoId || null
    : viewer.title || viewer.videoId || null

  const startMedia = useCallback(
    async (url) => {
      if (!sessionId) return null
      if (!isHost) {
        toast.error(
          t?.rooms?.videoCall?.watchTogether?.hostOnly ||
            "Chỉ chủ phòng có thể phát video chung.",
        )
        return null
      }
      try {
        // Lightweight API first — only a saved playback gets published. The
        // spotlight player auto-cues from mediaStatus.videoId, so the host's
        // own copy loads once the ledger flips active. Calling start while a
        // video is already active overwrites it (Q1=A, Q4=A): no confirm,
        // no manual stop needed. A failed start leaves the current video
        // untouched (Q5=A).
        const dto = await startMediaMutation({ sessionId, url }).unwrap()
        publishLoad(dto.videoId, dto.title)
        toast.success(
          t?.rooms?.videoCall?.watchTogether?.startSuccess ||
            "Đang phát video chung...",
        )
        return dto
      } catch {
        toast.error(
          t?.rooms?.videoCall?.watchTogether?.startError ||
            "Không thể phát video. Vui lòng thử lại.",
        )
        return null
      }
    },
    [sessionId, isHost, startMediaMutation, publishLoad, t],
  )

  const stopMedia = useCallback(async () => {
    if (!sessionId) return false
    if (!isHost) {
      toast.error(
        t?.rooms?.videoCall?.watchTogether?.hostOnly ||
          "Chỉ chủ phòng có thể dừng video chung.",
      )
      return false
    }
    try {
      await stopMediaMutation({ sessionId }).unwrap()
      publishStop()
      toast.success(
        t?.rooms?.videoCall?.watchTogether?.stopSuccess ||
          "Đã dừng video chung.",
      )
      return true
    } catch {
      toast.error(
        t?.rooms?.videoCall?.watchTogether?.stopError ||
          "Không thể dừng video.",
      )
      return false
    }
  }, [sessionId, isHost, stopMediaMutation, publishStop, t])

  return {
    isMediaActive,
    videoId,
    mediaTitle: mediaTitle || null,
    isMediaHost: isHost,
    isStarting,
    isStopping,
    startMedia,
    stopMedia,
    playerRef,
    needsTapToSync: viewer.needsTapToSync,
    syncError: viewer.syncError,
    tapToSync: viewer.tapToSync,
    reportError: viewer.reportError,
    stopLocal: viewer.stopLocal,
  }
}
