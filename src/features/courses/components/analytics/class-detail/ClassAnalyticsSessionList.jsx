import React, { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassAnalyticsSessionList = ({ sessions = [], teacherName = "Minh Hoàng", pageSize = 8 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}
  const secT = c.analytics?.sections || {}

  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleSessions = sessions.slice(startIdx, startIdx + pageSize)

  return (
    <div className="w-full flex flex-col gap-4 bg-white">
      {/* Session List */}
      <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
        {visibleSessions.map((session) => {
          const isGood = session.healthStatus === "good"
          return (
            <div
              key={session.sessionNumber}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-gray-50/70 transition-colors"
            >
              {/* Left: Session Number, Date, Topic */}
              <div className="flex flex-col gap-1 min-w-0 max-w-lg">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 font-bold text-xs text-gray-800">
                    {cd.session || "Buổi"} {session.sessionNumber}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {session.date}
                  </span>
                  {isGood ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} />
                      {cd.statusNormal || "Cân bằng tốt"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <AlertCircle size={12} />
                      {cd.statusAttention || "Chưa cân bằng"}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                  {session.topic}
                </h4>
                <p className="text-xs text-gray-500">
                  {cd.teacherTalk || "GV"} {teacherName}: <span className="font-semibold text-gray-700">{session.teacherSpeechPercent}%</span> · {cd.studentTalk || "HV"}: <span className="font-semibold text-gray-700">{session.studentSpeechPercent}%</span>
                </p>
              </div>

              {/* Right: Student Breakdown Chips / Stats */}
              <div className="flex flex-wrap items-center gap-2">
                {session.studentsDetail?.map((st) => (
                  <div
                    key={st.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                      st.isMet
                        ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-800"
                        : "bg-amber-50/60 border-amber-200/80 text-amber-900"
                    }`}
                  >
                    <span className="font-semibold">{st.name}:</span>
                    <span className="tabular-nums font-bold">{st.percent}%</span>
                    <span className="text-[10px] opacity-75">({st.words}w)</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {sessions.length > pageSize && (
        <div className="flex items-center justify-between gap-4 pt-2 text-xs text-gray-500">
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
                  pNum === safePage
                    ? "bg-[#990011] border-[#990011] text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#990011] hover:text-[#990011]"
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
