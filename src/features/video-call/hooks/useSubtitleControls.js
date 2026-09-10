import {
  useStartSubtitlesMutation,
  useStopSubtitlesMutation,
} from "@/store/api/subtitlesApi"

/**
 * Manages subtitle start/stop lifecycle on-demand per user.
 *
 * - startSubtitles(language) starts STT subscription on backend and enables the overlay
 * - stopSubtitles()          removes STT subscription on backend and hides the overlay
 *
 * `subtitleSupportedLangs` is derived from room.languageType so no extra API call
 * is required before presenting the language picker to the user.
 */
export const useSubtitleControls = ({
  sessionId,
  room,
  setShowRoomSubtitles,
  setSubtitleSelectedLanguage,
} = {}) => {
  const [startMutation, { isLoading: isStarting }] = useStartSubtitlesMutation()
  const [stopMutation,  { isLoading: isStopping  }] = useStopSubtitlesMutation()

  // Derive the supported language codes from room metadata
  const LANG_MAP = {
    English: "en",
    Chinese: "zh",
    Vietnamese: "vi",
    Japanese: "ja",
  }
  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const subtitleSupportedLangs =
    roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  // Extract community language from URL (e.g., /zh/meet/216 -> "zh")
  const pathParts = window.location.pathname.split("/")
  const communityLang = pathParts[1]
  const defaultDisplayLang = ["en", "vi", "zh", "ja"].includes(communityLang)
    ? communityLang
    : roomLangCode

  const startSubtitles = async (language) => {
    try {
      const chosenLang = language || defaultDisplayLang
      await startMutation({ sessionId, language: chosenLang }).unwrap()
      setSubtitleSelectedLanguage?.(chosenLang)
      setShowRoomSubtitles?.(true)
    } catch (err) {
      console.error("[useSubtitleControls] Failed to start subtitles:", err)
    }
  }

  const changeSubtitleLanguage = async (newLanguage) => {
    if (!newLanguage) return
    await startSubtitles(newLanguage)
  }

  const stopSubtitles = async () => {
    try {
      await stopMutation({ sessionId }).unwrap()
    } catch (err) {
      console.error("[useSubtitleControls] Failed to stop subtitles:", err)
    } finally {
      setShowRoomSubtitles?.(false)
      setSubtitleSelectedLanguage?.(null)
    }
  }

  return {
    isStarting,
    isStopping,
    subtitleSupportedLangs,
    startSubtitles,
    changeSubtitleLanguage,
    stopSubtitles,
  }
}

