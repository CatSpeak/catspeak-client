import React from "react"
import { ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassAnalyticsStudentTable = ({ students = [], onSelectStudent, thresholdRate = 25, totalStudents = 4 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  const getSessionsCountText = (count) => {
    return cd.sessionsCount ? cd.sessionsCount.replace("{{count}}", count) : `${count} buổi`
  }

  const getTrendDisplay = (trend) => {
    switch (trend) {
      case "improving":
        return {
          icon: "↗",
          text: cd.trendImproving || "Cải thiện",
          colorClass: "text-[#16a34a]",
        }
      case "stable":
        return {
          icon: "→",
          text: cd.trendStable || "Ổn định",
          colorClass: "text-[#4b5563]",
        }
      case "declining":
      default:
        return {
          icon: "↘",
          text: cd.trendDeclining || "Giảm dần",
          colorClass: "text-[#dc2626]",
        }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "normal":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e6f7ef] text-[#107c41]">
            {cd.statusNormal || "Bình thường"}
          </span>
        )
      case "attention":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309]">
            {cd.statusAttention || "Cần chú ý"}
          </span>
        )
      case "warning":
      default:
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#ffe4e6] text-[#e11d48]">
            {cd.statusWarning || "Cảnh báo"}
          </span>
        )
    }
  }

  const thresholdHintText = cd.expectedThresholdHint
    ? cd.expectedThresholdHint
        .replace("{{rate}}", thresholdRate)
        .replace("{{total}}", totalStudents)
    : `Ngưỡng kỳ vọng: mỗi học viên phát biểu ≥ ${thresholdRate}% thời gian (kỳ vọng cân bằng 1/${totalStudents} học viên)`

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#f4f6f8] text-gray-600 text-xs font-semibold">
              <th className="py-3 px-4 font-semibold">{cd.colStudent || "Học viên"}</th>
              <th className="py-3 px-4 font-semibold text-blue-600">{cd.colAvgPercent || "% TB"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colSessionsMet || "Buổi đạt"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colSessionsUnmet || "Buổi chưa đạt"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colTrend || "Xu hướng"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colStatus || "Trạng thái"}</th>
              <th className="py-3 px-2 text-right w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const trendObj = getTrendDisplay(student.trend)
              return (
                <tr
                  key={student.id || student.name}
                  onClick={() => onSelectStudent && onSelectStudent(student)}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  {/* Học viên */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {student.initial || student.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </span>
                    </div>
                  </td>

                  {/* % TB Progress bar & level */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="h-3 rounded-full bg-gray-200/80 overflow-hidden flex-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${student.barColor || "bg-[#16a34a]"}`}
                          style={{ width: student.barTrackWidth || `${student.avgStbPercent * 2}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-4 text-right">
                        {student.barLevel ?? Math.round(student.avgStbPercent / 10)}
                      </span>
                    </div>
                  </td>

                  {/* Buổi đạt */}
                  <td className="py-3.5 px-4 font-medium text-[#16a34a]">
                    {getSessionsCountText(student.sessionsMet)}
                  </td>

                  {/* Buổi chưa đạt */}
                  <td className="py-3.5 px-4 font-medium text-[#dc2626]">
                    {getSessionsCountText(student.sessionsUnmet)}
                  </td>

                  {/* Xu hướng */}
                  <td className={`py-3.5 px-4 font-medium ${trendObj.colorClass}`}>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-base leading-none">{trendObj.icon}</span>
                      <span>{trendObj.text}</span>
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(student.status)}
                  </td>

                  {/* Action Chevron */}
                  <td className="py-3.5 px-2 text-right">
                    <span className="text-blue-500 font-bold text-base group-hover:translate-x-0.5 transition-transform inline-block">
                      <ChevronRight size={18} />
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Hints */}
      <div className="pt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => students.length > 0 && onSelectStudent && onSelectStudent(students[0])}
          className="text-xs sm:text-sm text-blue-600 font-medium hover:underline text-left cursor-pointer inline-flex items-center gap-1"
        >
          {cd.clickStudentHint || "› Click học viên để xem lịch sử phát biểu từng buổi của học viên đó"}
        </button>
        <hr className="border-t border-gray-200 my-1" />
        <p className="text-xs text-gray-500">
          {thresholdHintText}
        </p>
      </div>
    </div>
  )
}

export default ClassAnalyticsStudentTable
