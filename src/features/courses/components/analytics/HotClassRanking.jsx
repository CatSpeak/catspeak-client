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
        <div className="flex flex-col divide-y divide-[#E8EBED]">
          {visibleRows.map((row, idx) => {
            const globalRank = startIdx + idx + 1
            const learners = Number(row.learners) || 0
            const rawFill = parseFloat(row.fill) || 0
            const fill = Math.min(Math.max(Math.round(rawFill), 0), 100)
            
            let capacity = row.capacity
            if (!capacity || isNaN(capacity)) {
              if (fill > 0 && learners > 0) {
                capacity = Math.max(learners, Math.round(learners / (fill / 100)))
              } else {
                capacity = learners > 0 ? learners : 1
              }
            }
            const newReg = Number(row.newRegistrations) || 0

            return (
              <div
                key={row.className || idx}
                className="flex flex-col sm:grid sm:grid-cols-[24px_minmax(120px,1.2fr)_minmax(100px,1fr)_100px_minmax(80px,1fr)_48px] gap-2 sm:gap-3 items-start sm:items-center py-2.5 px-2 hover:bg-[#FBFBFC] transition-colors text-xs"
              >
                {/* Rank number */}
                <div className="flex items-center gap-2 sm:block sm:text-center w-full sm:w-auto">
                  <span className="font-semibold text-[#B25905] text-sm">
                    {globalRank}
                  </span>
                  <strong className="sm:hidden font-semibold text-[#14171F] truncate" title={row.className}>
                    {row.className}
                  </strong>
                </div>

                {/* Class name (desktop) */}
                <strong className="hidden sm:block font-semibold text-[#14171F] truncate" title={row.className}>
                  {row.className}
                </strong>

                {/* Course name */}
                <span className="text-[#6B758A] truncate" title={row.course}>
                  {row.course || "Không thuộc khóa"}
                </span>

                {/* Learners & New Reg */}
                <div className="flex items-center gap-1.5 text-[#14171F] whitespace-nowrap">
                  <span>{learners}/{capacity}</span>
                  {newReg > 0 && (
                    <span className="text-[#6B758A] text-[11px] truncate">({newReg} {newRegStr})</span>
                  )}
                </div>

                {/* Fill bar */}
                <div className="h-2 rounded-full bg-[#EDEDF0] overflow-hidden w-full">
                  <div
                    className="h-full rounded-full bg-[#E51A33] transition-all duration-500"
                    style={{ width: `${fill}%` }}
                  />
                </div>

                {/* Percentage */}
                <strong className="text-right font-semibold text-[#14171F] tabular-nums sm:w-full">
                  {fill}%
                </strong>
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
              className="w-7 h-7 rounded-lg border border-[#D6D9E0] bg-white hover:border-[#B20514] hover:text-[#B20514] disabled:opacity-40 disabled:hover:border-[#D6D9E0] disabled:hover:text-gray-400 flex items-center justify-center transition-all cursor-pointer"
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
                    ? "bg-[#B20514] border-[#B20514] text-white"
                    : "bg-white border-[#D6D9E0] text-[#14171F] hover:border-[#B20514] hover:text-[#B20514]"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 rounded-lg border border-[#D6D9E0] bg-white hover:border-[#B20514] hover:text-[#B20514] disabled:opacity-40 disabled:hover:border-[#D6D9E0] disabled:hover:text-gray-400 flex items-center justify-center transition-all cursor-pointer"
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
