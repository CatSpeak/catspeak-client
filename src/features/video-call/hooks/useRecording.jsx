import { useState, useCallback, useRef } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/store/api/recordingsApi"
import { setPiP } from "@/store/slices/videoCallSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"

/**
 * useRecording — manages recording state for a video call session.
 *
 * @param {object|null} lkRoom - LiveKit Room object from useRoomContext().
 *                                The room name is sent to the backend so it
 *                                can target the correct LiveKit Egress.
 * @returns recording state and toggle handler
 */
export function useRecording(lkRoom = null, syncState = {}) {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const {
    isRecording,
    setIsRecording,
    egressId,
    setEgressId,
    startedByAccountId,
    setStartedByAccountId,
    sessionId
  } = syncState

  const [isTogglingRecording, setIsTogglingRecording] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)

  const [startRecording] = useStartRecordingMutation()
  const [stopRecording] = useStopRecordingMutation()

  const handleToggleRecording = useCallback(async () => {
    const roomName = lkRoom?.name ?? null

    if (!roomName) {
      toast.error(
        t.recordings?.errors?.noRoom || "No active room — cannot record.",
      )
      return
    }

    if (isTogglingRecording) return // debounce double-click
    setIsTogglingRecording(true)

    try {
      if (!isRecording) {
        // ── START recording ────────────────────────────────────────────
        let hasMedia = false
        if (lkRoom) {
          if (lkRoom.localParticipant?.trackPublications?.size > 0) {
            hasMedia = true
          } else if (lkRoom.remoteParticipants) {
            lkRoom.remoteParticipants.forEach((p) => {
              if (p.trackPublications?.size > 0) {
                hasMedia = true
              }
            })
          }
        }

        if (!hasMedia) {
          toast.error(
            t.recordings?.errors?.noMedia ||
              "Please turn on your camera, microphone, or share your screen before recording.",
          )
          setIsTogglingRecording(false)
          return
        }

        console.log("[Recording Debug] Starting recording for room:", roomName, "sessionId:", sessionId)
        const result = await startRecording({ roomName, sessionId }).unwrap()
        console.log("[Recording Debug] Start response:", JSON.stringify(result))
        console.log("[Recording Debug] egressId received:", result.egressId)

        if (!result.egressId) {
          console.error(
            "[Recording Debug] ⚠️ Backend returned no egressId! Full response:",
            result,
          )
          toast.error(
            t.recordings?.errors?.noEgress ||
              "Recording started but no egress ID received — stop may not work.",
          )
        }

        if (setEgressId) setEgressId(result.egressId)
        if (setIsRecording) setIsRecording(true)
        if (setStartedByAccountId) setStartedByAccountId(lkRoom?.localParticipant?.identity)

        toast.success(
          t.recordings?.actions?.startSuccess || "Recording started",
          {
            icon: "🔴",
            duration: 3000,
          },
        )
      } else {
        // ── STOP recording ─────────────────────────────────────────────
        console.log(
          "[Recording Debug] Intent to stop recording. egressId:",
          egressId,
        )

        if (!egressId) {
          console.error(
            "[Recording Debug] ⚠️ egressId is null — stop call will NOT be sent to backend!",
          )
          if (setIsRecording) setIsRecording(false)
          return
        }

        setShowStopModal(true)
      }
    } catch (err) {
      const status = err?.status

      // ── 409 Conflict — storage quota exceeded ──────────────────────
      if (status === 409) {
        const quotaMsg =
          err?.data?.message ||
          t.recordings?.storage?.quotaExceeded ||
          "Storage quota exceeded. Please delete some recordings to free up space."
        toast.error(quotaMsg, {
          icon: "⚠️",
          duration: 6000,
        })
        console.warn("[Recording] Quota exceeded:", quotaMsg)
        return
      }

      const msg =
        err?.data?.message ||
        err?.data ||
        t.recordings?.list?.error ||
        "Failed to process recording."
      toast.error(msg)
      console.error("[Recording] toggle error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }, [lkRoom, isRecording, isTogglingRecording, startRecording, stopRecording, egressId, setIsRecording, setEgressId, setStartedByAccountId, sessionId])

  const confirmStopRecording = async () => {
    setShowStopModal(false)
    setIsTogglingRecording(true)
    try {
      if (egressId) {
        const result = await stopRecording(egressId).unwrap()
        console.log("[Recording Debug] Stop response:", JSON.stringify(result))
      }
      if (setEgressId) setEgressId(null)
      if (setIsRecording) setIsRecording(false)
      if (setStartedByAccountId) setStartedByAccountId(null)

      toast(
        (tToast) => {
          const navigate = getNavigate()
          return (
            <div className="flex items-start gap-3">
              <span className="mt-0.5">⏹️</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {t.recordings?.actions?.stopSuccess ||
                    "Recording saved in My Workspace"}
                </span>
                <button
                  onClick={() => {
                    dispatch(setPiP(true))
                    if (navigate) {
                      navigate("/workspace/recordings")
                    }
                    toast.dismiss(tToast.id)
                  }}
                  className="mt-1 text-left text-sm font-semibold text-cath-red-600 transition-colors hover:text-cath-red-700 hover:underline active:text-cath-red-800"
                >
                  {t.recordings?.actions?.viewRecordings || "View Recordings"}
                </button>
              </div>
            </div>
          )
        },
        { duration: 6000 },
      )
    } catch (err) {
      toast.error(t.recordings?.list?.error || "Failed to process recording.")
      console.error("[Recording] confirm stop error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }

  const cancelStopRecording = () => {
    setShowStopModal(false)
  }

  return {
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    showStopModal,
    confirmStopRecording,
    cancelStopRecording,
  }
}
