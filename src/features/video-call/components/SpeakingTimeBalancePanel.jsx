import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useSelector } from "react-redux"
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
  BreakoutRoomSTBView,
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
  const { isBreakoutActive, breakoutRoomName } = useSelector(
    (s) => s.videoCall,
  )

  const {
    participants = [],
    user,
    room,
    speakingStatsMap = {},
    roomTotalDuration = 0,
    roomTotalStudentDuration = 0,
    speakingTeacherSpeakingPercent = 0,
    speakingStudentSpeakingPercent = 0,
    speakingExpectedSharePercent = 25,
    speakingHasAnySpeechData = false,
    speakingStatsLastUpdated,
    isSpeakingStatsLoading = false,
    isSpeakingStatsFetching = false,
    isSpeakingStatsError = false,
    refetchSpeakingStats,
  } = useGlobalVideoCall()

  const activeIsLoading =
    isLoading || isSpeakingStatsLoading || (isSpeakingStatsFetching && !speakingStatsLastUpdated)
  const activeIsError = isError || isSpeakingStatsError

  const panelTitle = isBreakoutActive
    ? `${breakoutRoomName || "Phòng thảo luận"} — STB`
    : stbT.title || "Speaking Time Balance"

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

  const studentParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return []
    return participants.filter((p) => !isHostOrTeacher(p))
  }, [participants, isHostOrTeacher])

  const studentCount = studentParticipants.length
  const expectedSharePercent =
    speakingExpectedSharePercent || (studentCount > 0 ? Math.round(100 / studentCount) : 25)

  // Map each student participant to their pre-calculated speaking metrics from server
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
          sharePercent: 0,
          status: "normal",
        }

      return {
        participant: p,
        name,
        totalWords: stats.totalWords || 0,
        durationSec: stats.totalDurationSeconds || 0,
        sharePercent: stats.sharePercent || 0,
        status: stats.status || "normal",
      }
    })
  }, [studentParticipants, speakingStatsMap, t])

  // Use pre-computed server speech flag or fallback
  const hasAnySpeechData =
    speakingHasAnySpeechData ||
    roomTotalDuration > 0 ||
    roomTotalStudentDuration > 0 ||
    participantStatsList.some((p) => p.totalWords > 0 || p.durationSec > 0)

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <SpeakingTimeBalanceHeader
        title={panelTitle}
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
          isBreakoutMode={isBreakoutActive}
          labels={stbT}
        />
      ) : isBreakoutActive ? (
        /* State: Breakout Room Mode (Matches stb-detail-breakout-panel.png) */
        <BreakoutRoomSTBView
          studentCount={studentCount}
          expectedSharePercent={expectedSharePercent}
          participantStatsList={participantStatsList}
          labels={stbT}
        />
      ) : !hasAnySpeechData ? (
        /* State: No Data Yet (Main Room only) */
        <SpeakingTimeBalanceEmptyState
          studentParticipants={studentParticipants}
          studentCount={studentCount}
          labels={stbT}
        />
      ) : (
        /* State: Main Room Mode (With Teacher Talk & Progress Bars) */
        <>
          <TeacherTalkRatioCard
            hasAnySpeechData={hasAnySpeechData}
            teacherPercent={speakingTeacherSpeakingPercent}
            studentPercent={speakingStudentSpeakingPercent}
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
