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

      {/* GV (Teacher) Bar */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">
          {labels.teacher || "GV"}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-cath-red-700 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, gvPercent))}%` }}
          />
        </div>
        <span className="text-xs font-bold text-cath-red-700 w-9 text-right shrink-0">
          {gvPercent}%
        </span>
      </div>

      {/* HV (Students) Bar */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold text-gray-600 w-5 shrink-0">
          {labels.students || "HV"}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, hvPercent))}%` }}
          />
        </div>
        <span className="text-xs font-bold text-emerald-600 w-9 text-right shrink-0">
          {hvPercent}%
        </span>
      </div>
    </div>
  )
}

export default TeacherTalkRatioCard
