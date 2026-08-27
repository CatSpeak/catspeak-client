import { useCallback, useMemo } from "react"
import { useTracks } from "@livekit/components-react"
import { Track } from "livekit-client"
import { toast } from "react-hot-toast"
import { isMediaParticipant } from "@/features/video-call/utils/mediaParticipant"
import {
  useStartMediaMutation,
  useStopMediaMutation,
  useGetMediaStatusQuery,
} from "@/store/api/mediaApi"

/**
 * Orchestrates the "watch together" (server-broadcast YouTube) feature.
 *
 * - Detects the media in-room via the ingress participant's video track
 *   (it's a normal LiveKit track published by LiveKit Ingress).
 * - Provides start/stop actions that call the API (which wires the ingress).
 * - Exposes the current media participant so it can be spotlighted.
 */
export const useWatchTogether = ({ sessionId, isHost, t }) => {
  // Ingress publishes a camera-source video track under the media participant.
  const videoTracks = useTracks([Track.Source.Camera], { onlySubscribed: false })

  const mediaParticipants = useMemo(
    () =>
      videoTracks
        .map((t) => t.participant)
        .filter((p) => p && isMediaParticipant(p)),
    [videoTracks],
  )
  const mediaParticipant = mediaParticipants[0] ?? null

  // Find the media participant's video track ref for rendering.
  const mediaTrackRef = useMemo(() => {
    const match = videoTracks.find(
      (t) =>
        t.source === Track.Source.Camera &&
        t.participant &&
        isMediaParticipant(t.participant),
    )
    return match ?? null
  }, [videoTracks])

  const isMediaActive = !!mediaParticipant

  // Surface the resolved video title persisted by the API (oEmbed) so the
  // spotlight shows a real title instead of the ingress agent's name.
  const { data: mediaStatus } = useGetMediaStatusQuery(sessionId, {
    skip: !sessionId,
  })

  const [startMediaMutation, { isLoading: isStarting }] =
    useStartMediaMutation()
  const [stopMediaMutation, { isLoading: isStopping }] = useStopMediaMutation()

  const startMedia = useCallback(
    async (url) => {
      if (!sessionId) return
      if (!isHost) {
        toast.error(
          t?.rooms?.videoCall?.watchTogether?.hostOnly ||
            "Chỉ chủ phòng có thể phát video chung.",
        )
        return
      }
      try {
        const res = await startMediaMutation({ sessionId, url }).unwrap()
        toast.success(
          t?.rooms?.videoCall?.watchTogether?.startSuccess ||
            "Đang phát video chung...",
        )
        return res
      } catch (err) {
        toast.error(
          t?.rooms?.videoCall?.watchTogether?.startError ||
            "Không thể phát video. Vui lòng thử lại.",
        )
        throw err
      }
    },
    [sessionId, isHost, startMediaMutation, t],
  )

  const stopMedia = useCallback(async () => {
    if (!sessionId) return
    if (!isHost) {
      toast.error(
        t?.rooms?.videoCall?.watchTogether?.hostOnly ||
          "Chỉ chủ phòng có thể dừng video chung.",
      )
      return
    }
    try {
      await stopMediaMutation({ sessionId }).unwrap()
      toast.success(
        t?.rooms?.videoCall?.watchTogether?.stopSuccess ||
          "Đã dừng video chung.",
      )
    } catch {
      toast.error(
        t?.rooms?.videoCall?.watchTogether?.stopError ||
          "Không thể dừng video.",
      )
    }
  }, [sessionId, isHost, stopMediaMutation, t])

  return {
    isMediaActive,
    mediaParticipant,
    mediaTrackRef,
    mediaTitle: mediaStatus?.title || mediaStatus?.videoId || null,
    isMediaHost: isHost,
    isStarting,
    isStopping,
    startMedia,
    stopMedia,
  }
}
