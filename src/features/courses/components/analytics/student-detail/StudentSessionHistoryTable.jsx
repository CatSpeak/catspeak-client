import React, { useState } from "react"
import { ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentSessionHistoryTable = ({ sessions = [], onSessionClick, pageSize = 6 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sd = c.analytics?.studentDetail || {}

  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleSessions = sessions.slice(startIdx, startIdx + pageSize)

  const showingCountText = sd.showingSessionsCount
    ? sd.showingSessionsCount
        .replace("{{count}}", Math.min(sessions.length, pageSize))
        .replace("{{total}}", sessions.length)
    : `Hiển thị ${Math.min(sessions.length, pageSize)} / ${sessions.length} buổi`

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Section Title */}
      <h2 className="text-base sm:text-lg font-bold text-gray-900">
        {sd.sectionHistory || "Lịch sử theo buổi học"}
      </h2>

      {/* Table Container */}
      <div className="w-full overflow-x-auto bg-white">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-[#f4f6f8] text-gray-600 text-xs font-semibold">
              <th className="py-3 px-4 font-semibold">{sd.colSession || "Buổi"}</th>
              <th className="py-3 px-4 font-semibold">{sd.colDate || "Ngày"}</th>
              <th className="py-3 px-4 font-semibold">{sd.colTime || "Giờ học"}</th>
              <th className="py-3 px-4 font-semibold text-blue-600">{sd.colSpeechPercent || "% Phát biểu"}</th>
              <th className="py-3 px-4 font-semibold">{sd.colWords || "Số từ"}</th>
              <th className="py-3 px-4 font-semibold">{sd.colExpected || "Kỳ vọng"}</th>
              <th className="py-3 px-4 font-semibold">{sd.colStatus || "Trạng thái"}</th>
              <th className="py-3 px-2 text-right w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleSessions.map((sess) => {
              const isMet = sess.isMet
              return (
                <tr
                  key={sess.sessionNumber}
                  onClick={() => onSessionClick && onSessionClick(sess)}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  {/* Buổi */}
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {sess.formattedSession || `#${sess.sessionNumber}`}
                  </td>

                  {/* Ngày */}
                  <td className="py-3.5 px-4 text-gray-800 font-medium">
                    {sess.date}
                  </td>

                  {/* Giờ học */}
                  <td className="py-3.5 px-4 text-gray-600 font-normal">
                    {sess.time}
                  </td>

                  {/* % Phát biểu Progress bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-[180px]">
                      <div className="h-3 rounded-full bg-gray-200/80 overflow-hidden flex-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${sess.barColor || (isMet ? "bg-[#16a34a]" : "bg-[#e11d48]")}`}
                          style={{ width: `${Math.min(100, sess.percent * 2.2)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold tabular-nums w-8 text-right ${sess.textColor || (isMet ? "text-[#16a34a]" : "text-[#e11d48]")}`}>
                        {sess.percent}%
                      </span>
                    </div>
                  </td>

                  {/* Số từ */}
                  <td className="py-3.5 px-4 text-gray-700 font-normal">
                    {sess.words} {t.courses?.analytics?.classDetail?.wordsCount ? t.courses.analytics.classDetail.wordsCount.replace("{{count}}", "").trim() : "từ"}
                  </td>

                  {/* Kỳ vọng */}
                  <td className="py-3.5 px-4 text-gray-600 font-normal">
                    {sess.expectedPercent ?? 25}%
                  </td>

                  {/* Trạng thái Pill */}
                  <td className="py-3.5 px-4">
                    {isMet ? (
                      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e6f7ef] text-[#107c41]">
                        {sd.statusMet || "Đạt"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#ffe4e6] text-[#e11d48]">
                        {sd.statusUnmet || "Chưa đạt"}
                      </span>
                    )}
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

      {/* Footer Hint */}
      <div className="pt-2">
        <span className="text-xs sm:text-sm text-blue-600 font-medium hover:underline cursor-pointer">
          {sd.clickSessionHint || "› Click vào buổi để xem báo cáo đầy đủ của cả lớp trong buổi đó (sc19)"}
        </span>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between pt-3 text-xs sm:text-sm text-gray-500">
        <span>
          {showingCountText}
        </span>

        <div className="flex items-center gap-4 font-semibold text-blue-600">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="hover:text-blue-800 disabled:opacity-35 disabled:hover:text-blue-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {sd.prev || "← Trước"}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="hover:text-blue-800 disabled:opacity-35 disabled:hover:text-blue-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {sd.next || "Sau →"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentSessionHistoryTable
