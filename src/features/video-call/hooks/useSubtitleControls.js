import { useState } from "react"
import {
  useStartSubtitlesMutation,
  useStopSubtitlesMutation,
} from "@/store/api/subtitlesApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

/**
 * Manages subtitle start/stop lifecycle.
 *
 * - startSubtitles(language) dispatches the room-stt agent and enables the overlay
 * - stopSubtitles()          removes the dispatch and hides the overlay
 *
 * `subtitleSupportedLangs` is derived from room.languageType so no extra API call
 * is required before presenting the language picker to the user.
 */
export const useSubtitleControls = () => {
  const {
    sessionId,
    room,
    setShowRoomSubtitles,
    setSubtitleSelectedLanguage,
  } = useGlobalVideoCall()

  const [isSubtitleActive, setIsSubtitleActive] = useState(false)
  const [dispatchId, setDispatchId] = useState(null)

  const [startMutation, { isLoading: isStarting }] = useStartSubtitlesMutation()
  const [stopMutation,  { isLoading: isStopping  }] = useStopSubtitlesMutation()

  // Derive the two supported language codes from room metadata
  const LANG_MAP = { English: "en", Chinese: "zh", Vietnamese: "vi" }
  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const subtitleSupportedLangs =
    roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  const startSubtitles = async (language) => {
    try {
      const result = await startMutation({ sessionId, language }).unwrap()
      setDispatchId(result.dispatchId)
      setIsSubtitleActive(true)
      setSubtitleSelectedLanguage(language)
      setShowRoomSubtitles(true)
    } catch (err) {
      console.error("[useSubtitleControls] Failed to start subtitles:", err)
    }
  }

  const stopSubtitles = async () => {
    if (!dispatchId) return
    try {
      await stopMutation({ sessionId, dispatchId }).unwrap()
    } catch (err) {
      console.error("[useSubtitleControls] Failed to stop subtitles:", err)
    } finally {
      // Clear state regardless of API result so the UI resets
      setDispatchId(null)
      setIsSubtitleActive(false)
      setShowRoomSubtitles(false)
      setSubtitleSelectedLanguage(null)
    }
  }

  return {
    isSubtitleActive,
    isStarting,
    isStopping,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  }
}
