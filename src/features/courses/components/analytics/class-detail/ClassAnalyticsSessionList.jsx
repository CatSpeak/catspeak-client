import React, { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatDate = (isoStr) => {
  if (!isoStr) return "—"
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return isoStr
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const formatTime = (isoStr) => {
  if (!isoStr) return ""
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ""
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${hh}:${min}`
}

const ClassAnalyticsSessionList = ({
  sessions = [],
  teacherName = "Minh Hoàng",
  pageSize = 10,
  onSelectSession,
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}
  const secT = c.analytics?.sections || {}

  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleSessions = sessions.slice(startIdx, startIdx + pageSize)

  const getStatusBadge = (healthStatus) => {
    if (healthStatus === "good") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7ef] text-[#107c41]">
          <CheckCircle2 size={12} />
          {cd.statusNormal || "Cân bằng tốt"}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309]">
        <AlertCircle size={12} />
        {cd.statusAttention || "Chưa cân bằng"}
      </span>
    )
  }

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-[#f4f6f8] text-gray-600 text-xs font-semibold">
              <th className="py-3 px-4 font-semibold">{cd.colDate || "Ngày"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colEndTime || "Giờ kết thúc"}</th>
              <th className="py-3 px-4 font-semibold text-blue-600">{cd.colRatio || "Tỷ lệ GV / HV"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colAvgStb || "STB TB"}</th>
              <th className="py-3 px-4 font-semibold">{cd.colStatus || "Trạng thái"}</th>
              <th className="py-3 px-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  {cd.noSessions || "Chưa có dữ liệu buổi học nào được ghi nhận."}
                </td>
              </tr>
            ) : (
              visibleSessions.map((session) => {
                const teacherPercent = session.teacherSpeechPercent ?? 0
                const studentPercent = session.studentSpeechPercent ?? 0
                const avgStb = session.avgStbScore ?? 0
                const createdIso = session.createdAt || session.created_at
                const dateDisplay = formatDate(createdIso)
                const timeDisplay = formatTime(createdIso)

                return (
                  <tr
                    key={session.sessionId || session.session_id || session.sessionNumber}
                    onClick={() => onSelectSession && onSelectSession(session)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Ngày */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {dateDisplay || "—"}
                      </span>
                    </td>

                    {/* Giờ kết thúc */}
                    <td className="py-3.5 px-4 font-medium text-gray-700 text-sm">
                      {timeDisplay || "—"}
                    </td>

                    {/* Tỷ lệ GV / HV with split progress bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5 min-w-[130px] max-w-[170px]">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <span>{cd.teacherTalk || "GV"}: {teacherPercent}%</span>
                          <span>{cd.studentTalk || "HV"}: {studentPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex">
                          <div
                            style={{ width: `${Math.min(100, Math.max(0, teacherPercent))}%` }}
                            className="bg-sky-500 h-full"
                          />
                          <div
                            style={{ width: `${Math.min(100, Math.max(0, studentPercent))}%` }}
                            className="bg-emerald-500 h-full"
                          />
                        </div>
                      </div>
                    </td>

                    {/* STB TB */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 text-sm tabular-nums">
                      {avgStb}%
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(session.healthStatus)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        <span>{cd.details || "Chi tiết"}</span>
                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sessions.length > pageSize && (
        <div className="flex items-center justify-between gap-4 p-4 border-t border-gray-100 text-xs text-gray-500">
          <span>
            {secT.showing || "Hiển thị"} {startIdx + 1}–{Math.min(startIdx + pageSize, sessions.length)} {secT.of || "trong"} {sessions.length} {cd.sessionsCount ? cd.sessionsCount.replace("{{count}}", "") : "buổi"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:border-[#990011] hover:text-[#990011] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg border font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                  safePage === pNum
                    ? "bg-[#111827] text-white border-[#111827]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:border-[#990011] hover:text-[#990011] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassAnalyticsSessionList
