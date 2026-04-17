import { useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/store/api/recordingsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * useRecording — manages recording state for a video call session.
 *
 * @param {object|null} lkRoom - LiveKit Room object from useRoomContext().
 *                                The room name is sent to the backend so it
 *                                can target the correct LiveKit Egress.
 * @returns recording state and toggle handler
 */
export function useRecording(lkRoom = null) {
  const { t } = useLanguage()
  const [isRecording, setIsRecording] = useState(false)
  const [isTogglingRecording, setIsTogglingRecording] = useState(false)
  const egressIdRef = useRef(null) // store egressId returned by start-recording

  const [startRecording] = useStartRecordingMutation()
  const [stopRecording] = useStopRecordingMutation()

  const handleToggleRecording = useCallback(async () => {
    const roomName = lkRoom?.name ?? null

    if (!roomName) {
      toast.error("No active room — cannot record.")
      return
    }

    if (isTogglingRecording) return // debounce double-click
    setIsTogglingRecording(true)

    try {
      if (!isRecording) {
        // ── START recording ────────────────────────────────────────────
        console.log("[Recording Debug] Starting recording for room:", roomName)
        const result = await startRecording({ roomName }).unwrap()
        console.log("[Recording Debug] Start response:", JSON.stringify(result))
        console.log("[Recording Debug] egressId received:", result.egressId)

        if (!result.egressId) {
          console.error("[Recording Debug] ⚠️ Backend returned no egressId! Full response:", result)
          toast.error("Recording started but no egress ID received — stop may not work.")
        }

        egressIdRef.current = result.egressId
        setIsRecording(true)
        toast.success(t.recordings?.actions?.startSuccess || "Recording started", {
          icon: "🔴",
          duration: 3000,
        })
      } else {
        // ── STOP recording ─────────────────────────────────────────────
        const egressId = egressIdRef.current
        console.log("[Recording Debug] Stopping recording. egressId:", egressId)

        if (!egressId) {
          console.error("[Recording Debug] ⚠️ egressId is null — stop call will NOT be sent to backend!")
          setIsRecording(false)
          return
        }

        const result = await stopRecording(egressId).unwrap()
        console.log("[Recording Debug] Stop response:", JSON.stringify(result))
        egressIdRef.current = null
        setIsRecording(false)
        toast.success(t.recordings?.actions?.stopSuccess || "Recording stopped — processing upload…", {
          icon: "⏹️",
          duration: 4000,
        })
      }
    } catch (err) {
      const status = err?.status

      // ── 409 Conflict — storage quota exceeded ──────────────────────
      if (status === 409) {
        const quotaMsg =
          err?.data?.message ||
          t.recordings?.storage?.quotaExceeded || "Storage quota exceeded. Please delete some recordings to free up space."
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
        t.recordings?.list?.error || "Failed to process recording."
      toast.error(msg)
      console.error("[Recording] toggle error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }, [lkRoom, isRecording, isTogglingRecording, startRecording, stopRecording])

  return {
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
  }
}
