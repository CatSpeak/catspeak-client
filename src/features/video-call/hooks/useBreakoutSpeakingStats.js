import { useMemo } from "react"
import { useGetBreakoutSpeakingStatsQuery } from "@/store/api/roomsApi"

/**
 * Parses room stats DTO into a structured map with pre-calculated metrics.
 *
 * @param {object|null} roomStats
 * @returns {object}
 */
const parseRoomStats = (roomStats) => {
  if (!roomStats) {
    return {
      statsMap: {},
      participantsList: [],
      totalDurationSec: 0,
      totalStudentDurationSec: 0,
      totalWords: 0,
      teacherSpeakingPercent: 0,
      studentSpeakingPercent: 0,
      teacherStatus: "ideal",
      studentCount: 0,
      expectedSharePercent: 25,
      hasAnySpeechData: false,
      lowSpeakingCount: 0,
      hasWarning: false,
    }
  }

  const overview = roomStats.overview || {}
  const teacherTalk = roomStats.teacherTalkRatio || {}
  const fairShare = roomStats.fairShare || {}

  const totalWords = Number(overview.totalWords ?? roomStats.totalRoomWords ?? 0)
  const totalDurationSec = Number(overview.totalDurationSeconds ?? roomStats.totalRoomDurationSeconds ?? 0)
  const totalStudentDurationSec = Number(overview.totalStudentDurationSeconds ?? roomStats.totalStudentDurationSeconds ?? 0)
  const studentCount = Number(overview.studentCount ?? roomStats.studentCount ?? 0)

  const teacherDurationSeconds = Number(teacherTalk.teacherDurationSeconds ?? roomStats.teacherDurationSeconds ?? 0)
  const teacherWords = Number(teacherTalk.teacherWords ?? 0)
  const teacherSpeakingPercent = Number(teacherTalk.teacherPercent ?? roomStats.teacherSpeakingPercent ?? 0)
  const studentSpeakingPercent = Number(teacherTalk.studentPercent ?? roomStats.studentSpeakingPercent ?? 0)
  const teacherStatus = teacherTalk.status || roomStats.teacherStatus || "ideal"

  const expectedSharePercent = Number(fairShare.expectedSharePercent ?? roomStats.expectedSharePercent ?? 25)
  const lowSpeakingCount = Number(fairShare.lowSpeakingCount ?? roomStats.lowSpeakingCount ?? 0)
  const hasWarning = Boolean(fairShare.hasWarning ?? roomStats.hasWarning)
  const hasAnySpeechData = Boolean(roomStats.hasAnySpeechData)

  const statsMap = {}
  const participantsList = []

  if (Array.isArray(roomStats.participants)) {
    for (const p of roomStats.participants) {
      const pId = String(p.participantId || p.participant_id || "")
      if (!pId) continue

      const pStats = p.stats || {}
      const pBalance = p.balance || {}

      const pDurationSec = Number(pStats.durationSeconds ?? p.totalDurationSeconds ?? 0)
      const pWords = Number(pStats.words ?? p.totalWords ?? 0)
      const wpm =
        pStats.wpm ??
        p.wpm ??
        (pDurationSec >= 1 && pWords > 0
          ? Math.round(pWords / (pDurationSec / 60))
          : 0)

      const item = {
        participantId: pId,
        accountId: p.accountId ?? null,
        name: p.name ?? pId,
        role: p.role ?? (p.isTeacher ? "teacher" : "student"),
        isTeacher: Boolean(p.isTeacher),
        isHost: Boolean(p.isHost),
        totalWords: pWords,
        totalDurationSeconds: pDurationSec,
        wpm,
        stbScore: Number(pBalance.stbScore ?? pBalance.sharePercent ?? p.sharePercent ?? 0),
        timePercent: Number(pBalance.timePercent ?? 0),
        wordCountPercent: Number(pBalance.wordCountPercent ?? 0),
        sharePercent: Number(pBalance.sharePercent ?? p.sharePercent ?? 0),
        ratioOfExpected: Number(pBalance.ratioOfExpected ?? p.ratioOfExpected ?? 0),
        status: pBalance.status || p.status || "normal",
      }

      statsMap[pId] = item
      if (p.accountId) {
        statsMap[String(p.accountId)] = item
      }
      participantsList.push(item)
    }
  }

  return {
    overview,
    teacherTalkRatio: teacherTalk,
    fairShare,
    statsMap,
    participantsList,
    totalDurationSec,
    totalStudentDurationSec,
    totalWords,
    teacherDurationSeconds,
    teacherWords,
    teacherSpeakingPercent,
    studentSpeakingPercent,
    teacherStatus,
    studentCount,
    expectedSharePercent,
    hasAnySpeechData,
    lowSpeakingCount,
    hasWarning,
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
          const lowSpeakingCount = Number(
            room.lowSpeakingCount ?? room.fairShare?.lowSpeakingCount ?? 0,
          )
          const hasWarning = Boolean(
            room.hasWarning ?? room.fairShare?.hasWarning ?? lowSpeakingCount > 0,
          )
          const studentCount = Number(
            room.studentCount ?? room.overview?.studentCount ?? 0,
          )
          const hasAnySpeechData = Boolean(room.hasAnySpeechData)

          return {
            sessionId: room.sessionId,
            roomId: room.roomId,
            roomName: room.roomName || room.liveKitRoomName,
            liveKitRoomName: room.liveKitRoomName,
            lowSpeakingCount,
            hasWarning,
            studentCount,
            hasAnySpeechData,
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
