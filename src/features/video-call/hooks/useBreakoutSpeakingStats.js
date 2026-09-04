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

  const totalDurationSec = Number(overview.totalDurationSeconds ?? roomStats.totalRoomDurationSeconds ?? 0)
  const totalStudentDurationSec = Number(overview.totalStudentDurationSeconds ?? roomStats.totalStudentDurationSeconds ?? 0)
  const studentCount = Number(overview.studentCount ?? roomStats.studentCount ?? 0)

  const teacherDurationSeconds = Number(teacherTalk.teacherDurationSeconds ?? roomStats.teacherDurationSeconds ?? 0)
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

      const item = {
        participantId: pId,
        accountId: p.accountId ?? null,
        name: p.name ?? pId,
        role: p.role ?? (p.isTeacher ? "teacher" : "student"),
        isTeacher: Boolean(p.isTeacher),
        isHost: Boolean(p.isHost),
        totalDurationSeconds: pDurationSec,
        stbScore: Number(pBalance.stbScore ?? pBalance.sharePercent ?? p.sharePercent ?? 0),
        timePercent: Number(pBalance.timePercent ?? 0),
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
    teacherDurationSeconds,
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
 * @param {Array} [options.breakoutRooms=[]] - List of active breakout room objects ({ sessionId, roomName, liveKitRoomName, roomId })
 * @param {string} [options.parentLivekitRoomName=""] - Parent session LiveKit room name
 * @param {number|null} [options.parentRoomId=null] - Parent Room ID
 * @param {boolean} [options.enabled=true] - Whether polling/querying is active
 * @param {boolean} [options.includeMainRoom=true] - Whether to include Main Room stats
 * @param {number} [options.pollingInterval=60000] - Polling interval in ms (default 60s)
 */
export const useBreakoutSpeakingStats = (sessionId, options = {}) => {
  const {
    breakoutRooms = [],
    parentLivekitRoomName = "",
    parentRoomId = null,
    enabled = true,
    includeMainRoom = true,
    pollingInterval = 60000,
  } = options

  // Serialize breakoutRooms to prevent infinite re-fetching on parent re-renders
  const queryArg = useMemo(() => {
    if (!sessionId || !enabled) return null
    return {
      sessionId,
      parentRoomId,
      parentLivekitRoomName,
      includeMainRoom,
      breakoutRooms: breakoutRooms.map((r) => ({
        sessionId: r.sessionId ?? r.session_id,
        roomId: r.roomId ?? r.room_id ?? null,
        roomName: r.roomName ?? r.room_name ?? "",
        liveKitRoomName: r.liveKitRoomName ?? r.livekit_room_name ?? "",
      })),
    }
  }, [
    sessionId,
    parentRoomId,
    parentLivekitRoomName,
    includeMainRoom,
    enabled,
    JSON.stringify(
      breakoutRooms.map(
        (r) =>
          `${r.sessionId ?? r.session_id}-${r.liveKitRoomName ?? r.livekit_room_name}`,
      ),
    ),
  ])

  const {
    data: rawData,
    fulfilledTimeStamp,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetBreakoutSpeakingStatsQuery(queryArg, {
    skip: !queryArg,
    pollingInterval: enabled ? pollingInterval : 0,
    refetchOnMountOrArgChange: true,
  })

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

    const isBreakoutActive = Boolean(
      rawData.isBreakoutActive ?? rawData.is_breakout_active,
    )
    const mainRoomData = rawData.mainRoom ?? rawData.main_room
    const mainRoomParsed = mainRoomData
      ? {
          sessionId: mainRoomData.sessionId ?? mainRoomData.session_id,
          roomId: mainRoomData.roomId ?? mainRoomData.room_id,
          roomName:
            mainRoomData.roomName ??
            mainRoomData.room_name ??
            "Phòng học chính",
          liveKitRoomName:
            mainRoomData.liveKitRoomName ??
            mainRoomData.livekit_room_name ??
            "",
          lowSpeakingCount: Number(
            mainRoomData.lowSpeakingCount ??
              mainRoomData.low_speaking_count ??
              mainRoomData.fairShare?.lowSpeakingCount ??
              mainRoomData.fair_share?.low_speaking_count ??
              0,
          ),
          hasWarning: Boolean(
            mainRoomData.hasWarning ??
              mainRoomData.has_warning ??
              mainRoomData.fairShare?.hasWarning ??
              mainRoomData.fair_share?.has_warning ??
              false,
          ),
          studentCount: Number(
            mainRoomData.studentCount ??
              mainRoomData.student_count ??
              mainRoomData.overview?.studentCount ??
              mainRoomData.overview?.student_count ??
              0,
          ),
          hasAnySpeechData: Boolean(
            mainRoomData.hasAnySpeechData ?? mainRoomData.has_any_speech_data,
          ),
        }
      : null

    const rawRoomsList =
      rawData.breakoutRooms ?? rawData.breakout_rooms ?? []
    const breakoutRoomsList = Array.isArray(rawRoomsList)
      ? rawRoomsList.map((room) => {
          const lowSpeakingCount = Number(
            room.lowSpeakingCount ??
              room.low_speaking_count ??
              room.fairShare?.lowSpeakingCount ??
              room.fair_share?.low_speaking_count ??
              0,
          )
          const hasWarning = Boolean(
            room.hasWarning ??
              room.has_warning ??
              room.fairShare?.hasWarning ??
              room.fair_share?.has_warning ??
              lowSpeakingCount > 0,
          )
          const studentCount = Number(
            room.studentCount ??
              room.student_count ??
              room.overview?.studentCount ??
              room.overview?.student_count ??
              0,
          )
          const hasAnySpeechData = Boolean(
            room.hasAnySpeechData ?? room.has_any_speech_data,
          )

          const sId = room.sessionId ?? room.session_id
          const rId = room.roomId ?? room.room_id
          const rName =
            room.roomName ??
            room.room_name ??
            room.liveKitRoomName ??
            room.livekit_room_name ??
            ""
          const lkName =
            room.liveKitRoomName ?? room.livekit_room_name ?? ""

          return {
            sessionId: sId,
            roomId: rId,
            roomName: rName,
            liveKitRoomName: lkName,
            lowSpeakingCount,
            hasWarning,
            studentCount,
            hasAnySpeechData,
          }
        })
      : []

    const breakoutMap = {}
    for (const room of breakoutRoomsList) {
      if (room.sessionId != null) {
        breakoutMap[String(room.sessionId)] = room
      }
      if (room.roomId != null) {
        breakoutMap[String(room.roomId)] = room
      }
      if (room.liveKitRoomName) {
        breakoutMap[String(room.liveKitRoomName)] = room
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
