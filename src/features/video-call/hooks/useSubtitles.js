import { useState, useEffect } from "react"
import { RoomEvent } from "livekit-client"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const ROOM_SUBTITLE_TOPIC = "room-subtitle"
const MAX_COMMITTED = 100

/**
 * Subscribes to LiveKit "room-subtitle" data packets.
 *
 * Packet shape: { speaker, text, timestamp, language, is_final }
 *
 * - is_final=false (interim): replaces the in-progress entry for (speaker, language)
 *   in real time as Deepgram recognises words
 * - is_final=true (final):  commits the entry to history and clears the in-progress slot
 *
 * Returns:
 *   subtitles      — committed history + current interims, filtered by selectedLanguage
 *   clearSubtitles — clears all state
 */
export const useSubtitles = () => {
  const { lkRoom, subtitleSelectedLanguage } = useGlobalVideoCall()

  // Committed (final) subtitle history
  const [committed, setCommitted] = useState([])
  // In-progress interim map: "{speaker}:{language}" → entry
  const [interims, setInterims] = useState({})

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, _participant, _kind, topic) => {
      if (topic !== ROOM_SUBTITLE_TOPIC) return
      try {
        const data = JSON.parse(new TextDecoder().decode(payload))
        if (!data?.text) return

        const key = `${data.speaker || "Unknown"}:${data.language || ""}`
        const entry = {
          speaker:   data.speaker || "Unknown",
          text:      data.text,
          timestamp: data.timestamp || Date.now(),
          language:  data.language || null,
        }

        if (data.is_final) {
          // Commit to history and clear the interim slot for this speaker
          setCommitted((prev) => {
            const updated = [...prev, entry]
            return updated.length > MAX_COMMITTED ? updated.slice(-MAX_COMMITTED) : updated
          })
          setInterims((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
          })
        } else {
          // Replace/update the in-progress entry for this speaker
          setInterims((prev) => ({ ...prev, [key]: entry }))
        }
      } catch {
        console.warn("[useSubtitles] Failed to parse subtitle data")
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => lkRoom.off(RoomEvent.DataReceived, handleData)
  }, [lkRoom])

  // Merge committed history + current interims for display
  const allSubtitles = [...committed, ...Object.values(interims)]

  // Apply language filter on render — no re-subscription needed when language changes
  const subtitles = subtitleSelectedLanguage
    ? allSubtitles.filter(
        (s) => !s.language || s.language === subtitleSelectedLanguage,
      )
    : allSubtitles

  const clearSubtitles = () => {
    setCommitted([])
    setInterims({})
  }

  return { subtitles, clearSubtitles }
}
