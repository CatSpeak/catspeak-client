import { useState, useEffect } from "react"
import { RoomEvent } from "livekit-client"

const SPEAKING_STATS_TOPIC = "speaking_stats"

/**
 * Formats speaking duration dynamically:
 *   - > 0 hours: "1h 5m 23s"
 *   - > 0 minutes: "2m 15s"
 *   - seconds only: "45s" (or "0s")
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatSpeakingDuration = (totalSeconds = 0) => {
  const sec = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60

  if (h > 0) {
    return `${h}h ${m}m ${s}s`
  }
  if (m > 0) {
    return `${m}m ${s}s`
  }
  return `${s}s`
}

/**
 * Custom React hook that listens for LiveKit 'speaking_stats' data packets
 * from assistant-stt and tracks speaking metrics mapped by participant ID,
 * as well as room-level total speaking duration.
 *
 * @param {import("livekit-client").Room|null} lkRoom
 * @returns {{ statsMap: Record<string, { totalWords: number, totalDurationSeconds: number, wpm: number, lastUpdated: number }>, roomTotalDuration: number }}
 */
export const useSpeakingStats = (lkRoom) => {
  const [statsMap, setStatsMap] = useState({})
  const [roomTotalDuration, setRoomTotalDuration] = useState(0)

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, _participant, _kind, topic) => {
      if (topic !== SPEAKING_STATS_TOPIC) return

      try {
        const raw = new TextDecoder().decode(payload)
        const data = JSON.parse(raw)
        const pId = String(data.participant_id || data.participantId || "")
        if (!pId) return

        const words = data.total_words ?? data.totalWords ?? 0
        const durationSec =
          data.total_duration_seconds ??
          data.totalDurationSeconds ??
          (data.total_duration_ms ? data.total_duration_ms / 1000 : 0)

        const rDurationSec =
          data.room_total_duration_seconds ??
          data.roomTotalDurationSeconds ??
          (data.room_total_duration_ms ? data.room_total_duration_ms / 1000 : 0)

        const effectiveRoomDuration = Math.max(rDurationSec, durationSec)
        if (effectiveRoomDuration > 0) {
          setRoomTotalDuration(effectiveRoomDuration)
        }

        // Calculate WPM: (words / (duration_seconds / 60))
        const wpm =
          durationSec >= 1 && words > 0
            ? Math.round(words / (durationSec / 60))
            : 0

        setStatsMap((prev) => ({
          ...prev,
          [pId]: {
            totalWords: words,
            totalDurationSeconds: durationSec,
            wpm,
            lastUpdated: data.timestamp || Date.now(),
          },
        }))
      } catch (e) {
        console.warn("[useSpeakingStats] Parse error:", e)
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom])

  return { statsMap, roomTotalDuration }
}
