import React from "react"

/**
 * TeacherTalkRatioCard Component
 * Displays comparative speaking ratio between Teacher (GV) and Students (HV).
 */
const TeacherTalkRatioCard = ({
  isError = false,
  hasAnySpeechData = true,
  teacherPercent = 0,
  studentPercent = 0,
  labels = {},
}) => {
  if (isError) {
    return (
      <div className="px-4 py-3 border-l-4 border-gray-400 bg-white shrink-0">
        <div className="text-sm font-medium text-gray-600">
          {labels.teacherTalk || "Teacher Talk"}
        </div>
        <div className="text-xs text-gray-400 mt-1 font-mono">
          {labels.teacher || "GV"} -- | {labels.students || "HV"} --
        </div>
      </div>
    )
  }

  const gvPercent = hasAnySpeechData ? teacherPercent : 0
  const hvPercent = hasAnySpeechData ? studentPercent : 0

  return (
    <div className="px-4 py-3 border-l-4 border-cath-red-700 bg-white shrink-0">
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-800">
          {labels.teacherTalk || "Teacher Talk"}
        </span>
      </div>

      <div className="grid grid-cols-[max-content_1fr_max-content] items-center gap-x-2.5 gap-y-2">
        {/* GV (Teacher) Row */}
        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
          {labels.teacher || "GV"}
        </span>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden w-full">
          <div
            className="bg-cath-red-700 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, gvPercent))}%` }}
          />
        </div>
        <span className="text-xs font-bold text-cath-red-700 font-mono text-right min-w-[2.5rem]">
          {gvPercent}%
        </span>

        {/* HV (Students) Row */}
        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
          {labels.students || "HV"}
        </span>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden w-full">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, hvPercent))}%` }}
          />
        </div>
        <span className="text-xs font-bold text-emerald-600 font-mono text-right min-w-[2.5rem]">
          {hvPercent}%
        </span>
      </div>
    </div>
  )
}

export default TeacherTalkRatioCard
