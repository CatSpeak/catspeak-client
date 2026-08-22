import { useMemo } from "react"
import { useGetBreakoutSpeakingStatsQuery } from "@/store/api/roomsApi"

/**
 * Parses raw room stats DTO into a structured map with durations and word counts.
 *
 * @param {object|null} roomStats
 * @returns {{ statsMap: Record<string, { totalWords: number, totalDurationMs: number, totalDurationSeconds: number, wpm: number }>, totalDurationSec: number, totalStudentDurationSec: number }}
 */
const parseRoomStats = (roomStats) => {
  if (!roomStats) {
    return {
      statsMap: {},
      totalDurationSec: 0,
      totalStudentDurationSec: 0,
    }
  }

  const totalDurationMs = Number(roomStats.totalRoomDurationMs ?? 0)
  const totalStudentDurationMs = Number(roomStats.totalStudentDurationMs ?? 0)
  const totalDurationSec = totalDurationMs / 1000
  const totalStudentDurationSec = totalStudentDurationMs / 1000

  const statsMap = {}
  if (Array.isArray(roomStats.participants)) {
    for (const p of roomStats.participants) {
      const pId = String(p.participantId || p.participant_id || "")
      if (!pId) continue

      const pDurationMs = Number(p.totalDurationMs ?? 0)
      const pDurationSec = pDurationMs / 1000
      const pWords = Number(p.totalWords ?? p.total_words ?? 0)
      const wpm =
        p.wpm ??
        (pDurationSec >= 1 && pWords > 0
          ? Math.round(pWords / (pDurationSec / 60))
          : 0)

      statsMap[pId] = {
        totalWords: pWords,
        totalDurationMs: pDurationMs,
        totalDurationSeconds: pDurationSec,
        wpm,
      }
    }
  }

  return {
    statsMap,
    totalDurationSec,
    totalStudentDurationSec,
  }
}

/**
 * Custom React hook that polls speaking statistics for all active breakout rooms
 * (and optionally the main room) belonging to a parent session.
 *
 * @param {number|string|null} sessionId - Parent video session ID
 * @param {object} options
 * @param {boolean} [options.enabled=true] - Whether polling/querying is active
 * @param {boolean} [options.includeMainRoom=true] - Whether to include Main Room stats
 * @param {number} [options.pollingInterval=60000] - Polling interval in ms (default 60s)
 */
export const useBreakoutSpeakingStats = (sessionId, options = {}) => {
  const {
    enabled = true,
    includeMainRoom = true,
    pollingInterval = 60000,
  } = options

  const {
    data: rawData,
    fulfilledTimeStamp,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetBreakoutSpeakingStatsQuery(
    { sessionId, includeMainRoom },
    {
      skip: !sessionId || !enabled,
      pollingInterval: enabled ? pollingInterval : 0,
      refetchOnMountOrArgChange: true,
    },
  )

  const {
    isBreakoutActive,
    mainRoomStats,
    breakoutRoomsStats,
    breakoutRoomsMap,
  } = useMemo(() => {
    if (!rawData) {
      return {
        isBreakoutActive: false,
        mainRoomStats: null,
        breakoutRoomsStats: [],
        breakoutRoomsMap: {},
      }
    }

    const isBreakoutActive = Boolean(rawData.isBreakoutActive)
    const mainRoomParsed = rawData.mainRoom ? parseRoomStats(rawData.mainRoom) : null

    const breakoutRoomsList = Array.isArray(rawData.breakoutRooms)
      ? rawData.breakoutRooms.map((room) => {
          const parsed = parseRoomStats(room)
          const studentCount = Object.keys(parsed.statsMap).length
          const expectedSharePercent =
            studentCount > 0 ? Math.round(100 / studentCount) : 0

          // Check if any participant in this room is below warning threshold (FR-004 / FR-009)
          let hasWarning = false
          if (parsed.totalStudentDurationSec > 0 && expectedSharePercent > 0) {
            for (const stats of Object.values(parsed.statsMap)) {
              const share =
                (stats.totalDurationSeconds / parsed.totalStudentDurationSec) *
                100
              const ratioOfExp = (share / expectedSharePercent) * 100
              if (ratioOfExp < 30 || (share === 0 && stats.totalWords === 0)) {
                hasWarning = true
                break
              }
            }
          }

          return {
            sessionId: room.sessionId,
            roomId: room.roomId,
            roomName: room.roomName || room.liveKitRoomName,
            liveKitRoomName: room.liveKitRoomName,
            totalRoomWords: room.totalRoomWords ?? 0,
            hasWarning,
            ...parsed,
          }
        })
      : []

    const breakoutMap = {}
    for (const room of breakoutRoomsList) {
      breakoutMap[String(room.sessionId)] = room
      if (room.roomId) {
        breakoutMap[String(room.roomId)] = room
      }
    }

    return {
      isBreakoutActive,
      mainRoomStats: mainRoomParsed,
      breakoutRoomsStats: breakoutRoomsList,
      breakoutRoomsMap: breakoutMap,
    }
  }, [rawData])

  return {
    raw: rawData,
    isBreakoutActive,
    mainRoomStats,
    breakoutRoomsStats,
    breakoutRoomsMap,
    lastUpdated: fulfilledTimeStamp ?? null,
    isLoading,
    isFetching,
    isError,
    refetchStats: refetch,
  }
}
