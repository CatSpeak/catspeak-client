import React, { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const HotClassRanking = ({ rows = [], pageSize = 6 }) => {
  const { t } = useLanguage()
  const secT = t.courses?.analytics?.sections || {}
  const learnersStr = secT.learners || "học viên"
  const newRegStr = secT.newRegistrations || "đăng ký mới"
  const showingStr = secT.showing || "Hiển thị"
  const ofStr = secT.of || "trong"

  const [currentPage, setCurrentPage] = useState(1)

  const sorted = [...rows].sort(
    (a, b) => (b.fill ?? 0) - (a.fill ?? 0) || (b.newRegistrations ?? 0) - (a.newRegistrations ?? 0) || (b.gross ?? 0) - (a.gross ?? 0)
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleRows = sorted.slice(startIdx, startIdx + pageSize)

  return (
    <div className="w-full flex flex-col min-w-0">
      {visibleRows.length > 0 ? (
        <div className="flex flex-col border-t border-b border-[#edf0f3] divide-y divide-[#edf0f3]">
          {visibleRows.map((row, idx) => {
            const globalRank = startIdx + idx + 1
            const learners = row.learners ?? 0
            const fill = row.fill ?? 0
            const capacity = row.capacity || Math.max(
              learners,
              Math.ceil(learners / Math.max(fill / 100, 0.01))
            )
            const newReg = row.newRegistrations ?? 0
            return (
              <div
                key={row.className || idx}
                className="grid grid-cols-1 md:grid-cols-[36px_minmax(200px,1.25fr)_minmax(220px,1.6fr)] gap-3 items-center py-3 px-2 hover:bg-[#fffafb] transition-colors"
              >
                {/* Rank number */}
                <span className="w-6 h-6 rounded-full bg-[#fff0d7] text-[#9a5a00] font-bold flex items-center justify-center text-xs">
                  {globalRank}
                </span>

                {/* Class details */}
                <div className="flex flex-col min-w-0">
                  <strong className="text-xs font-bold text-gray-900 truncate">
                    {row.className}
                  </strong>
                  <small className="text-[11px] text-gray-500 truncate">
                    {row.course} · {learners}/{capacity} {learnersStr} · +{newReg} {newRegStr}
                  </small>
                </div>

                {/* Fill bar */}
                <div className="grid grid-cols-[1fr_48px] gap-3 items-center">
                  <div className="h-2.5 rounded-full bg-[#eff1f4] overflow-hidden w-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#dc1630] to-[#f06b79] transition-all duration-500"
                      style={{ width: `${Math.min(fill, 100)}%` }}
                    />
                  </div>
                  <strong className="text-right text-xs font-bold text-gray-900 tabular-nums">
                    {fill}%
                  </strong>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-xs font-medium">
          {secT.noData || "Không có dữ liệu phù hợp."}
        </div>
      )}

      {/* Pagination Controls */}
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-4 pt-3 text-xs text-gray-500">
          <span>
            {showingStr} {startIdx + 1}–{Math.min(startIdx + pageSize, sorted.length)} {ofStr} {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 rounded-lg border border-border bg-white hover:border-[#990011] hover:text-[#990011] disabled:opacity-40 disabled:hover:border-border disabled:hover:text-gray-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg border font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${pNum === safePage
                  ? "bg-[#990011] border-[#990011] text-white"
                  : "bg-white border-border text-gray-700 hover:border-[#990011] hover:text-[#990011]"
                  }`}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 rounded-lg border border-border bg-white hover:border-[#990011] hover:text-[#990011] disabled:opacity-40 disabled:hover:border-border disabled:hover:text-gray-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotClassRanking
