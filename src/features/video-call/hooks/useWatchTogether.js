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
import { useGlobalTask } from "@/shared/hooks/useGlobalTask"

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

  // Global task progress for download progress bar
  const { startTask } = useGlobalTask()

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

      // Start with global task progress tracking
      const result = await startTask({
        title: t?.rooms?.videoCall?.watchTogether?.downloading || "Đang tải video...",
        taskType: "WatchTogether",
        taskFn: async (taskId, reportProgress) => {
          // Start the API call
          const apiResult = await startMediaMutation({ sessionId, url }).unwrap()

          // Poll for progress from backend
          const pollInterval = setInterval(async () => {
            try {
              const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || "/api"}/livekit/media/progress/${sessionId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                },
              )
              const data = await response.json()
              const progress = data?.data

              if (progress) {
                reportProgress(
                  Math.max(0, Math.min(99, progress.progress)),
                  progress.stepName || "Đang tải video...",
                )

                // If completed or failed, stop polling
                if (progress.status === 2 || progress.status === 3) {
                  clearInterval(pollInterval)
                }
              }
            } catch {
              // Ignore polling errors
            }
          }, 1000)

          // Wait for the API call to complete (ingress created)
          // Then wait a bit more for backend to mark as completed
          await new Promise((resolve) => setTimeout(resolve, 2000))
          clearInterval(pollInterval)

          return apiResult
        },
        onSuccess: () => {
          toast.success(
            t?.rooms?.videoCall?.watchTogether?.startSuccess ||
              "Đang phát video chung...",
          )
        },
        onError: () => {
          toast.error(
            t?.rooms?.videoCall?.watchTogether?.startError ||
              "Không thể phát video. Vui lòng thử lại.",
          )
        },
      })

      return result
    },
    [sessionId, isHost, startMediaMutation, startTask, t],
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
