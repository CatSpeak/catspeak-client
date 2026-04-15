import { useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/store/api/videoSessionsApi"

/**
 * useRecording — manages recording state for a video call session.
 *
 * @param {number|null} sessionId - CatSpeak session ID from Redux callInfo
 * @param {object|null} lkRoom   - LiveKit Room object from useRoomContext()
 *                                  Used to get the actual room name (which may differ
 *                                  from "cs-session-{sessionId}" in dev mode, where the
 *                                  Vite plugin creates rooms named "room-{roomId}").
 * @returns recording state and toggle handler
 */
export function useRecording(sessionId, lkRoom = null) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTogglingRecording, setIsTogglingRecording] = useState(false)
  const egressIdRef = useRef(null) // store egressId returned by start-recording

  const [startRecording] = useStartRecordingMutation()
  const [stopRecording] = useStopRecordingMutation()

  const handleToggleRecording = useCallback(async () => {
    if (!sessionId) {
      toast.error("No active session — cannot record.")
      return
    }

    if (isTogglingRecording) return // debounce double-click
    setIsTogglingRecording(true)

    try {
      if (!isRecording) {
        // ── START recording ────────────────────────────────────────────
        // Pass actual LiveKit room name so backend can find the correct room.
        // In dev mode the Vite plugin creates "room-{roomId}"; in production it's "cs-session-{sessionId}".
        const roomName = lkRoom?.name ?? null

        const result = await startRecording({ sessionId, roomName }).unwrap()
        egressIdRef.current = result.egressId
        setIsRecording(true)
        toast.success("Recording started", {
          icon: "🔴",
          duration: 3000,
        })
      } else {
        // ── STOP recording ─────────────────────────────────────────────
        const egressId = egressIdRef.current
        if (!egressId) {
          setIsRecording(false)
          return
        }
        await stopRecording(egressId).unwrap()
        egressIdRef.current = null
        setIsRecording(false)
        toast.success("Recording stopped — processing upload…", {
          icon: "⏹️",
          duration: 4000,
        })
      }
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data ||
        (isRecording ? "Failed to stop recording." : "Failed to start recording.")
      toast.error(msg)
      console.error("[Recording] toggle error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }, [sessionId, lkRoom, isRecording, isTogglingRecording, startRecording, stopRecording])

  return {
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
  }
}
