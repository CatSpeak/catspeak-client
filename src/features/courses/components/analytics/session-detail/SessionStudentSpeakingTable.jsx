import React from "react"
import { ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00"
  const totalSecs = Math.round(seconds)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

const SessionStudentSpeakingTable = ({
  participants = [],
  onSelectStudent,
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sessT = c.analytics?.sessionDetail || {}

  const studentList = participants.filter((p) => {
    return !(
      p.isTeacher === true ||
      p.is_teacher === true ||
      p.role === "teacher" ||
      p.role === "instructor" ||
      p.role === "host" ||
      p.isHost === true ||
      p.is_host === true
    )
  })

  const getStatusBadge = (isMet, status) => {
    if (isMet) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7ef] text-[#107c41]">
          {sessT.statusMet || "✓ Đạt"}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309]">
        {sessT.statusUnmet || "Chưa đạt"}
      </span>
    )
  }

  const getBarColor = (percent, isMet) => {
    if (isMet) return "bg-[#16a34a]"
    if (percent >= 15) return "bg-[#d97706]"
    return "bg-[#dc2626]"
  }

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-[#f4f6f8] text-gray-600 text-xs font-semibold">
              <th className="py-3 px-4 font-semibold">{sessT.colStudent || "Học viên"}</th>
              <th className="py-3 px-4 font-semibold text-blue-600">{sessT.colSpeechPercent || "% Phát biểu (STB)"}</th>
              <th className="py-3 px-4 font-semibold">{sessT.colSpeakingDuration || "Thời lượng nói"}</th>
              <th className="py-3 px-4 font-semibold">{sessT.colStatus || "Trạng thái"}</th>
              <th className="py-3 px-2 text-right w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {studentList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  {sessT.noStudentData || "Chưa có dữ liệu phát biểu của học viên trong buổi học này."}
                </td>
              </tr>
            ) : (
              studentList.map((student, idx) => {
                const percent = student.percent ?? student.stbScore ?? student.balance?.stbScore ?? 0
                const durationSecs = student.durationSeconds ?? student.stats?.durationSeconds ?? 0
                const isMet = student.isMet ?? student.isThresholdMet ?? (percent >= 25)
                const studentName = student.name || `Student ${student.accountId ?? student.id ?? idx + 1}`
                const initial = studentName.trim().slice(0, 1).toUpperCase() || "S"

                return (
                  <tr
                    key={student.accountId || student.participantId || idx}
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Học viên: Avatar + Name (NO ID) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                          {studentName}
                        </span>
                      </div>
                    </td>

                    {/* % Phát biểu (STB) with progress bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5 min-w-[130px] max-w-[180px]">
                        <span className="font-bold text-gray-900 text-sm tabular-nums">
                          {percent}%
                        </span>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getBarColor(percent, isMet)}`}
                            style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Thời lượng nói */}
                    <td className="py-3.5 px-4 font-semibold text-gray-800 text-sm tabular-nums">
                      {formatDuration(durationSecs)}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(isMet, student.status)}
                    </td>

                    {/* Chevron Arrow */}
                    <td className="py-3.5 px-2 text-right">
                      <ChevronRight
                        size={16}
                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all inline-block"
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SessionStudentSpeakingTable
