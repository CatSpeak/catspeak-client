import { useMemo } from "react"
import { useGetSpeakingStatsQuery } from "@/store/api/roomsApi"

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
 * Custom React hook that polls cumulative speaking statistics via API every 30 seconds.
 *
 * @param {import("livekit-client").Room|null} _lkRoom
 * @param {number|string|null} sessionId
 * @returns {{ statsMap: Record<string, { totalWords: number, totalDurationMs: number, totalDurationSeconds: number, wpm: number }>, roomTotalDuration: number }}
 */
export const useSpeakingStats = (_lkRoom, sessionId, options = {}) => {
  const { enabled = true, pollingInterval = 30000 } = options

  // 1. Poll cumulative stats from backend API every 30 seconds only when enabled
  const {
    data: statsData,
    fulfilledTimeStamp,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSpeakingStatsQuery(sessionId, {
    skip: !sessionId || !enabled,
    pollingInterval: enabled ? pollingInterval : 0,
    refetchOnMountOrArgChange: true,
  })

  // 2. Derive roomTotalDuration, roomTotalStudentDuration, and statsMap directly with useMemo
  const {
    statsMap,
    roomTotalDuration,
    roomTotalStudentDuration,
    roomTotalDurationMs,
    roomTotalStudentDurationMs,
  } = useMemo(() => {
    if (!statsData) {
      return {
        statsMap: {},
        roomTotalDuration: 0,
        roomTotalStudentDuration: 0,
        roomTotalDurationMs: 0,
        roomTotalStudentDurationMs: 0,
      }
    }

    const totalDurationMs = Number(
      statsData.totalRoomDurationMs ??
        (statsData.totalRoomDurationSeconds
          ? statsData.totalRoomDurationSeconds * 1000
          : 0),
    )
    const studentDurationMs = Number(statsData.totalStudentDurationMs ?? 0)
    const roomDuration = totalDurationMs / 1000
    const studentDuration = studentDurationMs / 1000

    const map = {}
    if (Array.isArray(statsData.participants)) {
      for (const p of statsData.participants) {
        const pId = String(p.participantId || p.participant_id || "")
        if (!pId) continue

        const durationMs = Number(
          p.totalDurationMs ??
            (p.totalDurationSeconds ? p.totalDurationSeconds * 1000 : 0),
        )
        const durationSec = durationMs / 1000
        const words = Number(p.totalWords ?? p.total_words ?? 0)
        const wpm =
          p.wpm ??
          (durationSec >= 1 && words > 0
            ? Math.round(words / (durationSec / 60))
            : 0)

        map[pId] = {
          totalWords: words,
          totalDurationMs: durationMs,
          totalDurationSeconds: durationSec,
          wpm,
        }
      }
    }

    return {
      statsMap: map,
      roomTotalDuration: roomDuration > 0 ? roomDuration : 0,
      roomTotalStudentDuration: studentDuration > 0 ? studentDuration : 0,
      roomTotalDurationMs: totalDurationMs,
      roomTotalStudentDurationMs: studentDurationMs,
    }
  }, [statsData])

  return {
    statsMap,
    roomTotalDuration,
    roomTotalStudentDuration,
    roomTotalDurationMs,
    roomTotalStudentDurationMs,
    lastUpdated: fulfilledTimeStamp ?? null,
    isLoading,
    isFetching,
    isError,
    refetchStats: refetch,
  }
}
