import React, { useMemo, useCallback } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"

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
 * StudentSpeakingWidget Component
 * Floating card in the bottom-right corner for students/regular attendees.
 * Displays only the current user's personal speech metrics (% and word count).
 */
const StudentSpeakingWidget = ({ onClose, isError = false }) => {
  const { t } = useLanguage()
  const widgetT = t?.rooms?.videoCall?.speakingTimeBalance?.studentWidget || {}
  const { isBreakoutActive, breakoutRoomName } = useSelector(
    (s) => s.videoCall,
  )

  const {
    user,
    room,
    localParticipant,
    participants = [],
    speakingStatsMap = {},
    roomTotalStudentDuration = 0,
    isSpeakingStatsError = false,
  } = useGlobalVideoCall()

  const hasError = isError || isSpeakingStatsError

  // Helper to identify if participant is Host/Teacher
  const isHostOrTeacher = useCallback(
    (p) => {
      const meta = parseMetadata(p.metadata)
      const accountId = meta.accountId || (p.isLocal ? user?.accountId : null)
      return isRoomHost(room, accountId)
    },
    [room, user],
  )

  // Filter students to compute total student duration
  const studentParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return []
    return participants.filter((p) => !isHostOrTeacher(p))
  }, [participants, isHostOrTeacher])

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

  // Extract current user's speaking metrics
  const myStats = useMemo(() => {
    const localIdentity = localParticipant?.identity
    const localMeta = parseMetadata(localParticipant?.metadata)
    const localAccountId = localMeta.accountId || user?.accountId

    return (
      (localIdentity ? speakingStatsMap[localIdentity] : null) ||
      (localAccountId ? speakingStatsMap[String(localAccountId)] : null) || {
        totalWords: 0,
        totalDurationSeconds: 0,
        wpm: 0,
      }
    )
  }, [localParticipant, user, speakingStatsMap])

  const totalWords = myStats?.totalWords || 0
  const durationSec = myStats?.totalDurationSeconds || 0

  const sharePercent = useMemo(() => {
    if (totalStudentDurationSec > 0 && durationSec > 0) {
      return Math.round((durationSec / totalStudentDurationSec) * 100)
    }
    return 0
  }, [totalStudentDurationSec, durationSec])

  // Room title (Main Room vs Breakout Room)
  const roomTitle = isBreakoutActive
    ? (widgetT.meBreakout || "Tôi: {name}").replace(
        "{name}",
        breakoutRoomName || "Breakout Room",
      )
    : widgetT.meMainRoom || "Tôi: Main Room"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`w-[260px] bg-white rounded-[22px] p-4 shadow-2xl transition-all ${
        hasError
          ? "border-2 border-red-500 shadow-red-500/10"
          : "border border-gray-100 shadow-black/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              hasError ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          <span className="text-[15px] font-semibold text-gray-800 tracking-tight">
            {roomTitle}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mr-1 -mt-0.5"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-gray-100 my-3" />

      {/* Metrics Row */}
      {hasError ? (
        <div className="bg-red-50/70 border border-red-100 rounded-xl py-2.5 px-3 flex items-center justify-around text-center">
          <div className="flex-1">
            <div className="text-2xl font-bold text-red-500 leading-none">--</div>
            <div className="text-[11px] text-red-400 font-medium mt-1">
              {widgetT.errorSpeakingPercent || "% Pb"}
            </div>
          </div>

          <div className="w-[1px] h-7 bg-red-200" />

          <div className="flex-1">
            <div className="text-2xl font-bold text-red-500 leading-none">--</div>
            <div className="text-[11px] text-red-400 font-medium mt-1">
              {widgetT.errorWords || "# từ"}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-around text-center py-1">
          <div className="flex-1">
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              {sharePercent}%
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1.5">
              {widgetT.speakingPercent || "% phát biểu"}
            </div>
          </div>

          <div className="w-[1px] h-9 bg-gray-100 self-center" />

          <div className="flex-1">
            <div className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              {totalWords}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1.5">
              {widgetT.cumulativeWords || "từ tích lũy"}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 text-left">
        <span
          className={`text-xs ${
            hasError ? "text-red-500 font-medium" : "text-gray-500 font-normal"
          }`}
        >
          {hasError
            ? widgetT.errorCannotGet || "Không thể lấy dữ liệu"
            : widgetT.personalMetrics || "Chỉ số bản thân"}
        </span>
      </div>
    </motion.div>
  )
}

export default StudentSpeakingWidget
