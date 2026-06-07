import { useState, useEffect, useRef } from "react"
import { RoomEvent } from "livekit-client"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const ROOM_SUBTITLE_TOPIC = "room-subtitle"
const MAX_SUBTITLES = 100

/**
 * Hook that subscribes to LiveKit data packets for room subtitles.
 * Listens for data published by the STT microservice on the "room-subtitle" topic.
 * Maintains an array of all received subtitles (up to MAX_SUBTITLES).
 *
 * Returns:
 *   - subtitles: Array of { speaker, text, timestamp } objects
 *   - clearSubtitles: function to clear the entire array
 */
export const useSubtitles = () => {
  const { lkRoom } = useGlobalVideoCall()
  const [subtitles, setSubtitles] = useState([])
  const subtitlesRef = useRef([])

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, _participant, _kind, topic) => {
      if (topic !== ROOM_SUBTITLE_TOPIC) return

      try {
        const decoded = new TextDecoder().decode(payload)
        const data = JSON.parse(decoded)

        if (data && data.text) {
          const newSubtitle = {
            speaker: data.speaker || "Unknown",
            text: data.text,
            timestamp: data.timestamp || Date.now(),
          }

          setSubtitles((prev) => {
            const updated = [...prev, newSubtitle]
            // Keep only the last MAX_SUBTITLES entries
            if (updated.length > MAX_SUBTITLES) {
              subtitlesRef.current = updated.slice(-MAX_SUBTITLES)
              return subtitlesRef.current
            }
            subtitlesRef.current = updated
            return updated
          })
        }
      } catch (err) {
        // Ignore malformed packets
        console.warn("[useSubtitles] Failed to parse subtitle data:", err)
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)

    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom])

  const clearSubtitles = () => {
    setSubtitles([])
    subtitlesRef.current = []
  }

  return {
    subtitles,
    clearSubtitles,
  }
}
