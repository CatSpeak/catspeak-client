import React from "react"
import { AlertTriangle } from "lucide-react"
import TeacherTalkRatioCard from "./TeacherTalkRatioCard"

/**
 * SpeakingTimeBalanceErrorState Component
 * Displays error alert banner, dimmed placeholder student rows, and self-recovery note.
 */
const SpeakingTimeBalanceErrorState = ({
  studentParticipants = [],
  studentCount = 0,
  isBreakoutMode = false,
  labels = {},
}) => {
  return (
    <>
      <div className="p-3 shrink-0">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-left">
          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-semibold text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{labels.errorTitle || "Lỗi thu thập dữ liệu"}</span>
          </div>
          <p className="text-red-900 dark:text-red-200 text-xs mt-0.5">
            {labels.errorSubtitle || "Buổi học vẫn tiếp tục"}
          </p>
          <p className="text-gray-400 dark:text-[#AAAAAA] text-[11px] mt-1 font-mono">
            {labels.errorCode || "E-stb-001 · Tự phục hồi"}
          </p>
        </div>
      </div>

      {!isBreakoutMode && (
        <TeacherTalkRatioCard isError={true} labels={labels} />
      )}

      <div className="bg-[#F8F9FA] dark:bg-[#272727] border-y border-[#EFEFEF] dark:border-[#3F3F3F] px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-[#AAAAAA] shrink-0">
        <span>
          {labels.students || "HV"} ({studentCount})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {studentParticipants.map((p, idx) => (
          <div
            key={p.identity || idx}
            className="py-2.5 border-b border-gray-100 dark:border-[#3F3F3F] flex flex-col gap-1.5 opacity-60"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#AAAAAA]">
              <span>{p.name || p.identity || `Student ${idx + 1}`}</span>
              <span className="text-xs text-gray-400 dark:text-[#AAAAAA]">--</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-[#3F3F3F] rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-200 h-full w-4 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 text-center text-xs text-gray-400 dark:text-[#AAAAAA] border-t border-gray-100 dark:border-[#3F3F3F] shrink-0">
        {labels.errorFooter || "Hệ thống tự lấy lại dữ liệu khi kết nối phục hồi"}
      </div>
    </>
  )
}

export default SpeakingTimeBalanceErrorState
