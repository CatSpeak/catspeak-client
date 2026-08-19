import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import {
  SpeakingTimeBalanceHeader,
  TeacherTalkRatioCard,
  SpeakingParticipantRow,
  SpeakingTimeBalanceLegend,
  SpeakingTimeBalanceEmptyState,
  SpeakingTimeBalanceErrorState,
} from "./speaking-time-balance"

/**
 * Parses participant metadata safely
 */
const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

/**
 * SpeakingTimeBalancePanel Component
 * Dedicated side panel visualizing real-time talk-time distribution and balance.
 * Supports: Active Data, Loading, No Data Yet, and Error states.
 */
const SpeakingTimeBalancePanel = ({
  onClose,
  isLoading = false,
  isError = false,
}) => {
  const { t } = useLanguage()
  const stbT = t?.rooms?.videoCall?.speakingTimeBalance || {}

  const {
    participants = [],
    user,
    room,
    speakingStatsMap = {},
    roomTotalDuration = 0,
    roomTotalStudentDuration = 0,
    speakingStatsLastUpdated,
    isSpeakingStatsLoading = false,
    isSpeakingStatsFetching = false,
    isSpeakingStatsError = false,
    refetchSpeakingStats,
  } = useGlobalVideoCall()

  const activeIsLoading =
    isLoading || isSpeakingStatsLoading || (isSpeakingStatsFetching && !speakingStatsLastUpdated)
  const activeIsError = isError || isSpeakingStatsError

  // Timer tick updated every 1 second (avoiding synchronous setState in effect body)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Calculate elapsed seconds purely from now and lastUpdated timestamp
  const secondsAgo = speakingStatsLastUpdated
    ? Math.max(0, Math.floor((now - speakingStatsLastUpdated) / 1000))
    : 0

  // Safely trigger manual refetch without throwing unstarted errors
  const handleManualRefetch = () => {
    try {
      refetchSpeakingStats?.()
    } catch {
      // Ignore if query is still initializing
    }
  }

  // Helper to distinguish Host/Teacher vs Students
  const isHostOrTeacher = useCallback(
    (p) => {
      const meta = parseMetadata(p.metadata)
      const accountId = meta.accountId || (p.isLocal ? user?.accountId : null)
      return isRoomHost(room, accountId)
    },
    [room, user],
  )

  // Extract host/teacher participant and student participants
  const hostParticipant = useMemo(() => {
    return participants.find((p) => isHostOrTeacher(p))
  }, [participants, isHostOrTeacher])

  const studentParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return []
    return participants.filter((p) => !isHostOrTeacher(p))
  }, [participants, isHostOrTeacher])

  // Teacher duration
  const teacherStats = useMemo(() => {
    if (!hostParticipant) return null
    const hostMeta = parseMetadata(hostParticipant.metadata)
    return (
      speakingStatsMap[hostParticipant.identity] ||
      (hostMeta.accountId ? speakingStatsMap[String(hostMeta.accountId)] : null)
    )
  }, [hostParticipant, speakingStatsMap])

  const teacherDurationSec = teacherStats?.totalDurationSeconds || 0

  // Total student duration from Redis/API or sum of student stats
  const totalStudentDurationSec = useMemo(() => {
    if (roomTotalStudentDuration > 0) return roomTotalStudentDuration
    return studentParticipants.reduce((sum, p) => {
      const meta = parseMetadata(p.metadata)
      const st =
        speakingStatsMap[p.identity] ||
        (meta.accountId ? speakingStatsMap[String(meta.accountId)] : null)
      return sum + (st?.totalDurationSeconds || 0)
    }, 0)
  }, [roomTotalStudentDuration, studentParticipants, speakingStatsMap])

  // Dynamic Teacher vs Students ratio (FR-005)
  const combinedTeacherStudentDuration = teacherDurationSec + totalStudentDurationSec

  const { computedTeacherPercent, computedStudentPercent } = useMemo(() => {
    if (combinedTeacherStudentDuration > 0) {
      const teacherP = Math.round((teacherDurationSec / combinedTeacherStudentDuration) * 100)
      const studentP = 100 - teacherP
      return { computedTeacherPercent: teacherP, computedStudentPercent: studentP }
    }
    return {
      computedTeacherPercent: 0,
      computedStudentPercent: 0,
    }
  }, [combinedTeacherStudentDuration, teacherDurationSec])

  // Student Fair Floor & Expected Share (FR-004: expected share = 100% / number of students)
  const studentCount = studentParticipants.length
  const expectedSharePercent =
    studentCount > 0 ? Math.round(100 / studentCount) : 25

  // Map each student participant to their speaking metrics
  const participantStatsList = useMemo(() => {
    return studentParticipants.map((p) => {
      const meta = parseMetadata(p.metadata)
      const isLocal = p.isLocal
      const name =
        p.name ||
        p.identity ||
        (isLocal ? t?.rooms?.videoCall?.participantList?.you || "Bạn" : "Guest")

      const stats =
        speakingStatsMap[p.identity] ||
        (meta.accountId ? speakingStatsMap[String(meta.accountId)] : null) || {
          totalWords: 0,
          totalDurationSeconds: 0,
          wpm: 0,
        }

      const durationSec = stats.totalDurationSeconds || 0
      const totalWords = stats.totalWords || 0

      // Calculate percentage of room total student duration (fair floor)
      const sharePercent =
        totalStudentDurationSec > 0
          ? Math.round((durationSec / totalStudentDurationSec) * 100)
          : 0

      // Determine threshold status relative to expected share (FR-004 from SRS)
      const ratioOfExpected =
        expectedSharePercent > 0 ? (sharePercent / expectedSharePercent) * 100 : 0

      let status = "normal" // "normal" | "attention" | "tooLow"
      if (totalStudentDurationSec > 0) {
        if (totalWords === 0 || durationSec === 0 || ratioOfExpected < 30) {
          status = "tooLow"
        } else if (ratioOfExpected < 60) {
          status = "attention"
        } else {
          status = "normal"
        }
      }

      return {
        participant: p,
        name,
        totalWords,
        durationSec,
        sharePercent,
        status,
      }
    })
  }, [studentParticipants, speakingStatsMap, totalStudentDurationSec, expectedSharePercent, t])

  // Determine if session has any speech data
  const hasAnySpeechData = useMemo(() => {
    if (roomTotalDuration > 0 || totalStudentDurationSec > 0 || teacherDurationSec > 0) return true
    return participantStatsList.some((p) => p.totalWords > 0 || p.durationSec > 0)
  }, [roomTotalDuration, totalStudentDurationSec, teacherDurationSec, participantStatsList])

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <SpeakingTimeBalanceHeader
        secondsAgo={secondsAgo}
        isLoading={activeIsLoading}
        isError={activeIsError}
        isFetching={isSpeakingStatsFetching}
        onRefresh={handleManualRefetch}
        onClose={onClose}
        labels={stbT}
      />

      {/* State: Loading */}
      {activeIsLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <div className="w-6 h-1 bg-cath-red-700 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {stbT.loadingData || "Đang tải dữ liệu"}
          </p>
        </div>
      ) : activeIsError ? (
        /* State: Error */
        <SpeakingTimeBalanceErrorState
          studentParticipants={studentParticipants}
          studentCount={studentCount}
          labels={stbT}
        />
      ) : !hasAnySpeechData ? (
        /* State: No Data Yet */
        <SpeakingTimeBalanceEmptyState
          studentParticipants={studentParticipants}
          studentCount={studentCount}
          labels={stbT}
        />
      ) : (
        /* State: Active Data */
        <>
          <TeacherTalkRatioCard
            hasAnySpeechData={hasAnySpeechData}
            teacherPercent={computedTeacherPercent}
            studentPercent={computedStudentPercent}
            labels={stbT}
          />

          <div className="bg-[#F8F9FA] border-y border-[#EFEFEF] px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-600 shrink-0">
            <span>
              {stbT.students || "HV"} ({studentCount})
            </span>
            <span className="text-gray-500 font-mono">
              {stbT.expected || "Exp"}: {expectedSharePercent}%
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {participantStatsList.map((item, idx) => (
              <SpeakingParticipantRow
                key={item.participant.identity || idx}
                name={item.name}
                totalWords={item.totalWords}
                sharePercent={item.sharePercent}
                status={item.status}
                labels={stbT}
              />
            ))}
          </div>

          <SpeakingTimeBalanceLegend labels={stbT} />
        </>
      )}
    </div>
  )
}

export default SpeakingTimeBalancePanel
