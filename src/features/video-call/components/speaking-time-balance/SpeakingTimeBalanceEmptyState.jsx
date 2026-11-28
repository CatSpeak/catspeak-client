import React from "react"
import { Mic } from "lucide-react"
import TeacherTalkRatioCard from "./TeacherTalkRatioCard"

/**
 * SpeakingTimeBalanceEmptyState Component
 * Displays empty placeholder when no speaking data is recorded yet.
 */
const SpeakingTimeBalanceEmptyState = ({
  studentParticipants = [],
  studentCount = 0,
  isBreakoutMode = false,
  labels = {},
}) => {
  return (
    <>
      {!isBreakoutMode && (
        <TeacherTalkRatioCard hasAnySpeechData={false} labels={labels} />
      )}

      <div className="bg-[#F8F9FA] dark:bg-[#272727] border-y border-[#EFEFEF] dark:border-[#3F3F3F] px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-[#AAAAAA] shrink-0">
        <span>
          {labels.students || "HV"} ({studentCount})
        </span>
      </div>

      <div className="py-6 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#272727] flex items-center justify-center mb-3 shadow-inner">
          <Mic size={24} className="text-gray-600 dark:text-[#AAAAAA]" />
        </div>
        <h3 className="font-semibold text-sm text-gray-800 dark:text-neutral-100">
          {labels.noDataTitle || "Chưa ai phát biểu"}
        </h3>
        <p className="text-xs text-gray-400 dark:text-[#AAAAAA] mt-0.5">
          {labels.noDataSubtitle || "Buổi học vừa bắt đầu"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {studentParticipants.map((p, idx) => (
          <div
            key={p.identity || idx}
            className="py-2.5 border-b border-gray-100 dark:border-[#3F3F3F] flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between text-sm text-gray-700 dark:text-neutral-200">
              <span>{p.name || p.identity || `Student ${idx + 1}`}</span>
              <span className="text-xs text-gray-400 dark:text-[#AAAAAA] font-mono">0%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-[#3F3F3F] rounded-full h-1.5" />
          </div>
        ))}
      </div>
    </>
  )
}

export default SpeakingTimeBalanceEmptyState
