import { useState, useEffect } from "react"
import { RoomEvent } from "livekit-client"
import { useGetSpeakingStatsQuery } from "@/store/api/roomsApi"

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
 * Custom React hook that fetches initial speaking statistics via API on room join
 * and listens for LiveKit 'speaking_stats' data packets from assistant-stt in real-time.
 *
 * @param {import("livekit-client").Room|null} lkRoom
 * @param {number|string|null} sessionId
 * @returns {{ statsMap: Record<string, { totalWords: number, totalDurationSeconds: number, wpm: number, lastUpdated: number }>, roomTotalDuration: number }}
 */
export const useSpeakingStats = (lkRoom, sessionId) => {
  const [statsMap, setStatsMap] = useState({})
  const [roomTotalDuration, setRoomTotalDuration] = useState(0)

  // 1. Fetch initial cumulative stats from API (supports users joining mid-call)
  const { data: initialStats } = useGetSpeakingStatsQuery(sessionId, {
    skip: !sessionId,
  })

  useEffect(() => {
    if (!initialStats) return

    const roomDuration = Number(
      initialStats.totalRoomDurationSeconds ??
        (initialStats.totalRoomDurationMs
          ? initialStats.totalRoomDurationMs / 1000
          : 0),
    )

    if (roomDuration > 0) {
      setRoomTotalDuration((prev) => Math.max(prev, roomDuration))
    }

    if (Array.isArray(initialStats.participants)) {
      setStatsMap((prev) => {
        const next = { ...prev }
        for (const p of initialStats.participants) {
          const pId = String(p.participantId || p.participant_id || "")
          if (!pId) continue

          const durationSec = Number(
            p.totalDurationSeconds ??
              (p.totalDurationMs ? p.totalDurationMs / 1000 : 0),
          )
          const words = Number(p.totalWords ?? p.total_words ?? 0)
          const wpm =
            p.wpm ??
            (durationSec >= 1 && words > 0
              ? Math.round(words / (durationSec / 60))
              : 0)

          // Only seed if not already updated by a more recent live packet
          const existing = next[pId]
          if (
            !existing ||
            (existing.totalDurationSeconds ?? 0) <= durationSec
          ) {
            next[pId] = {
              totalWords: words,
              totalDurationSeconds: durationSec,
              wpm,
              lastUpdated: Date.now(),
            }
          }
        }
        return next
      })
    }
  }, [initialStats])

  // 2. Listen for live LiveKit data packets
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
          setRoomTotalDuration((prev) => Math.max(prev, effectiveRoomDuration))
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
