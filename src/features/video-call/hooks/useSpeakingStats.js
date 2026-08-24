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
 * @param {import("livekit-client").Room|null} lkRoom
 * @param {number|string|null} sessionId
 * @param {object} options
 */
export const useSpeakingStats = (lkRoom, sessionId, options = {}) => {
  const { enabled = true, pollingInterval = 60000 } = options
  const roomName = lkRoom?.name || (sessionId ? String(sessionId) : null)

  // 1. Poll structured stats from backend API every 60 seconds only when enabled
  const {
    data: statsData,
    fulfilledTimeStamp,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSpeakingStatsQuery(roomName, {
    skip: !roomName || !enabled,
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
    const teacherTalk = statsData.teacherTalkRatio || statsData.teacher_talk_ratio || {}
    const fairShare = statsData.fairShare || statsData.fair_share || {}

    const totalWords = Number(
      overview.totalWords ??
        overview.total_words ??
        statsData.totalRoomWords ??
        statsData.total_words ??
        0,
    )
    const totalStudentWords = Number(
      overview.totalStudentWords ??
        overview.total_student_words ??
        statsData.total_student_words ??
        0,
    )
    const roomDuration = Number(
      overview.totalDurationSeconds ??
        overview.total_duration_seconds ??
        statsData.totalRoomDurationSeconds ??
        statsData.total_duration_seconds ??
        0,
    )
    const studentDuration = Number(
      overview.totalStudentDurationSeconds ??
        overview.total_student_duration_seconds ??
        statsData.total_student_duration_seconds ??
        0,
    )
    const studentCount = Number(
      overview.studentCount ??
        overview.student_count ??
        statsData.studentCount ??
        statsData.student_count ??
        0,
    )

    const teacherDurationSeconds = Number(
      teacherTalk.teacherDurationSeconds ??
        teacherTalk.teacher_duration_seconds ??
        statsData.teacherDurationSeconds ??
        statsData.teacher_duration_seconds ??
        0,
    )
    const teacherWords = Number(
      teacherTalk.teacherWords ?? teacherTalk.teacher_words ?? 0,
    )
    const teacherSpeakingPercent = Number(
      teacherTalk.teacherPercent ??
        teacherTalk.teacher_percent ??
        statsData.teacherSpeakingPercent ??
        statsData.teacher_speaking_percent ??
        0,
    )
    const studentSpeakingPercent = Number(
      teacherTalk.studentPercent ??
        teacherTalk.student_percent ??
        statsData.studentSpeakingPercent ??
        statsData.student_speaking_percent ??
        0,
    )
    const teacherStatus =
      teacherTalk.status ||
      statsData.teacherStatus ||
      statsData.teacher_status ||
      "ideal"

    const expectedSharePercent = Number(
      fairShare.expectedSharePercent ??
        fairShare.expected_share_percent ??
        statsData.expectedSharePercent ??
        statsData.expected_share_percent ??
        25,
    )
    const lowSpeakingCount = Number(
      fairShare.lowSpeakingCount ??
        fairShare.low_speaking_count ??
        statsData.lowSpeakingCount ??
        statsData.low_speaking_count ??
        0,
    )
    const hasWarning = Boolean(
      fairShare.hasWarning ??
        fairShare.has_warning ??
        statsData.hasWarning ??
        statsData.has_warning,
    )
    const hasAnySpeechData = Boolean(
      statsData.hasAnySpeechData ??
        statsData.has_any_speech_data ??
        totalWords > 0 ??
        roomDuration > 0,
    )

    const map = {}
    const participantsList = []

    if (Array.isArray(statsData.participants)) {
      for (const p of statsData.participants) {
        const pId = String(p.participantId || p.participant_id || "")
        if (!pId) continue

        const pStats = p.stats || {}
        const pBalance = p.balance || {}

        const durationSec = Number(
          pStats.durationSeconds ??
            pStats.duration_seconds ??
            p.totalDurationSeconds ??
            p.total_duration_seconds ??
            0,
        )
        const words = Number(
          pStats.words ?? p.totalWords ?? p.total_words ?? 0,
        )
        const wpm =
          pStats.wpm ??
          p.wpm ??
          (durationSec >= 1 && words > 0
            ? Math.round(words / (durationSec / 60))
            : 0)

        const isTeacher = Boolean(p.isTeacher ?? p.is_teacher)
        const isHost = Boolean(p.isHost ?? p.is_host)
        const accountId = p.accountId ?? p.account_id ?? null

        const item = {
          participantId: pId,
          accountId,
          name: p.name ?? pId,
          role: p.role ?? (isTeacher ? "teacher" : "student"),
          isTeacher,
          isHost,
          totalWords: words,
          totalDurationSeconds: durationSec,
          wpm,
          stbScore: Number(
            pBalance.stbScore ??
              pBalance.stb_score ??
              pBalance.sharePercent ??
              pBalance.share_percent ??
              p.sharePercent ??
              p.share_percent ??
              0,
          ),
          timePercent: Number(
            pBalance.timePercent ?? pBalance.time_percent ?? 0,
          ),
          wordCountPercent: Number(
            pBalance.wordCountPercent ?? pBalance.word_count_percent ?? 0,
          ),
          sharePercent: Number(
            pBalance.sharePercent ??
              pBalance.share_percent ??
              p.sharePercent ??
              p.share_percent ??
              0,
          ),
          ratioOfExpected: Number(
            pBalance.ratioOfExpected ??
              pBalance.ratio_of_expected ??
              p.ratioOfExpected ??
              p.ratio_of_expected ??
              0,
          ),
          status: pBalance.status || p.status || "normal", // "normal" | "attention" | "tooLow"
        }

        map[pId] = item
        map[pId.toLowerCase()] = item
        if (accountId) {
          map[String(accountId)] = item
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
