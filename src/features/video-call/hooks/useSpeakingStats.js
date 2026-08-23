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
 * Custom React hook that polls structured, pre-calculated speaking statistics via API every 60 seconds.
 *
 * @param {import("livekit-client").Room|null} _lkRoom
 * @param {number|string|null} sessionId
 * @param {object} options
 */
export const useSpeakingStats = (_lkRoom, sessionId, options = {}) => {
  const { enabled = true, pollingInterval = 60000 } = options

  // 1. Poll structured stats from backend API every 60 seconds only when enabled
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

  // 2. Extract server-calculated STB properties from structured response
  const parsedStats = useMemo(() => {
    if (!statsData) {
      return {
        statsMap: {},
        participantsList: [],
        roomTotalDuration: 0,
        roomTotalStudentDuration: 0,
        totalRoomWords: 0,
        teacherDurationSeconds: 0,
        teacherWords: 0,
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

    const overview = statsData.overview || {}
    const teacherTalk = statsData.teacherTalkRatio || {}
    const fairShare = statsData.fairShare || {}

    const totalWords = Number(overview.totalWords ?? statsData.totalRoomWords ?? 0)
    const totalStudentWords = Number(overview.totalStudentWords ?? 0)
    const roomDuration = Number(overview.totalDurationSeconds ?? statsData.totalRoomDurationSeconds ?? 0)
    const studentDuration = Number(overview.totalStudentDurationSeconds ?? statsData.totalStudentDurationSeconds ?? 0)
    const studentCount = Number(overview.studentCount ?? statsData.studentCount ?? 0)

    const teacherDurationSeconds = Number(teacherTalk.teacherDurationSeconds ?? statsData.teacherDurationSeconds ?? 0)
    const teacherWords = Number(teacherTalk.teacherWords ?? 0)
    const teacherSpeakingPercent = Number(teacherTalk.teacherPercent ?? statsData.teacherSpeakingPercent ?? 0)
    const studentSpeakingPercent = Number(teacherTalk.studentPercent ?? statsData.studentSpeakingPercent ?? 0)
    const teacherStatus = teacherTalk.status || statsData.teacherStatus || "ideal"

    const expectedSharePercent = Number(fairShare.expectedSharePercent ?? statsData.expectedSharePercent ?? 25)
    const lowSpeakingCount = Number(fairShare.lowSpeakingCount ?? statsData.lowSpeakingCount ?? 0)
    const hasWarning = Boolean(fairShare.hasWarning ?? statsData.hasWarning)
    const hasAnySpeechData = Boolean(statsData.hasAnySpeechData)

    const map = {}
    const participantsList = []

    if (Array.isArray(statsData.participants)) {
      for (const p of statsData.participants) {
        const pId = String(p.participantId || p.participant_id || "")
        if (!pId) continue

        const pStats = p.stats || {}
        const pBalance = p.balance || {}

        const durationSec = Number(pStats.durationSeconds ?? p.totalDurationSeconds ?? 0)
        const words = Number(pStats.words ?? p.totalWords ?? 0)
        const wpm =
          pStats.wpm ??
          p.wpm ??
          (durationSec >= 1 && words > 0
            ? Math.round(words / (durationSec / 60))
            : 0)

        const item = {
          participantId: pId,
          accountId: p.accountId ?? null,
          name: p.name ?? pId,
          role: p.role ?? (p.isTeacher ? "teacher" : "student"),
          isTeacher: Boolean(p.isTeacher),
          isHost: Boolean(p.isHost),
          totalWords: words,
          totalDurationSeconds: durationSec,
          wpm,
          stbScore: Number(pBalance.stbScore ?? pBalance.sharePercent ?? p.sharePercent ?? 0),
          timePercent: Number(pBalance.timePercent ?? 0),
          wordCountPercent: Number(pBalance.wordCountPercent ?? 0),
          sharePercent: Number(pBalance.sharePercent ?? p.sharePercent ?? 0),
          ratioOfExpected: Number(pBalance.ratioOfExpected ?? p.ratioOfExpected ?? 0),
          status: pBalance.status || p.status || "normal", // "normal" | "attention" | "tooLow"
        }

        map[pId] = item
        if (p.accountId) {
          map[String(p.accountId)] = item
        }
        participantsList.push(item)
      }
    }

    return {
      overview,
      teacherTalkRatio: teacherTalk,
      fairShare,
      statsMap: map,
      participantsList,
      roomTotalDuration: roomDuration,
      roomTotalStudentDuration: studentDuration,
      totalRoomWords: totalWords,
      totalStudentWords,
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
  }, [statsData])

  return {
    raw: statsData,
    ...parsedStats,
    lastUpdated: fulfilledTimeStamp ?? null,
    isLoading,
    isFetching,
    isError,
    refetchStats: refetch,
  }
}
