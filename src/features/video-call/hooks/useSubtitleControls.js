import { useState, useEffect } from "react"
import {
  useStartSubtitlesMutation,
  useStopSubtitlesMutation,
  useGetSubtitleStatusQuery,
} from "@/store/api/subtitlesApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

/**
 * Manages subtitle start/stop lifecycle.
 *
 * - startSubtitles(language) dispatches the room-stt agent and enables the overlay
 * - stopSubtitles()          removes the dispatch and hides the overlay
 * - On mount, syncs with server status so users who join mid-session see active subtitles
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

  // Poll server once on mount to sync with any already-active subtitle session
  const { data: statusData } = useGetSubtitleStatusQuery(sessionId, {
    skip: !sessionId,
  })

  // Derive the two supported language codes from room metadata
  const LANG_MAP = { English: "en", Chinese: "zh", Vietnamese: "vi" }
  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const subtitleSupportedLangs =
    roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  // Extract community language from URL (e.g., /zh/meet/216 -> "zh")
  const pathParts = window.location.pathname.split("/")
  const communityLang = pathParts[1]
  const defaultDisplayLang = ["en", "vi", "zh"].includes(communityLang)
    ? communityLang
    : roomLangCode

  // Sync local state when the server reports an active dispatch
  useEffect(() => {
    if (!statusData) return
    if (statusData.active && statusData.dispatchId && !isSubtitleActive) {
      setDispatchId(statusData.dispatchId)
      setIsSubtitleActive(true)
      setShowRoomSubtitles(true)
      // Default display language to community language from URL
      setSubtitleSelectedLanguage((prev) =>
        prev ?? defaultDisplayLang
      )
    } else if (!statusData.active && isSubtitleActive) {
      // Agent stopped externally (e.g. another user stopped it)
      setDispatchId(null)
      setIsSubtitleActive(false)
      setShowRoomSubtitles(false)
      setSubtitleSelectedLanguage(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusData])

  const startSubtitles = async (language) => {
    try {
      const chosenLang = language || defaultDisplayLang
      const result = await startMutation({ sessionId, language: chosenLang }).unwrap()
      setDispatchId(result.dispatchId)
      setIsSubtitleActive(true)
      setSubtitleSelectedLanguage(chosenLang)
      setShowRoomSubtitles(true)
    } catch (err) {
      console.error("[useSubtitleControls] Failed to start subtitles:", err)
    }
  }

  const changeSubtitleLanguage = async (newLanguage) => {
    if (!newLanguage) return
    await startSubtitles(newLanguage)
  }

  const stopSubtitles = async () => {
    if (!dispatchId) return
    try {
      await stopMutation({ sessionId, dispatchId }).unwrap()
    } catch (err) {
      console.error("[useSubtitleControls] Failed to stop subtitles:", err)
    } finally {
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
    changeSubtitleLanguage,
    stopSubtitles,
  }
}
