import React, { useState } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const AnalyticsDataTable = ({
  columns = [],
  data = [],
  pageSize = 5,
  emptyMessage,
}) => {
  const { language, t } = useLanguage()
  const secT = t.courses?.analytics?.sections || {}

  const defaultEmptyMsg = secT.noData || "Không có dữ liệu phù hợp."
  const showingStr = secT.showing || "Hiển thị"
  const ofStr = secT.of || "trong"

  const [sortKey, setSortKey] = useState(columns[0]?.key || "")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const col = columns.find((c) => c.key === sortKey)

    let left = col?.sortValue
      ? col.sortValue(a)
      : (a[`${sortKey}Raw`] !== undefined ? a[`${sortKey}Raw`] : a[sortKey])
    let right = col?.sortValue
      ? col.sortValue(b)
      : (b[`${sortKey}Raw`] !== undefined ? b[`${sortKey}Raw`] : b[sortKey])

    if (typeof left === "string" && typeof right === "string") {
      // Strip currency symbols, spaces, percent signs to attempt numeric comparison
      const cleanL = left.replace(/[^\d.-]/g, "")
      const cleanR = right.replace(/[^\d.-]/g, "")
      if (cleanL.length > 0 && cleanR.length > 0 && !isNaN(Number(cleanL)) && !isNaN(Number(cleanR)) && !/[a-zA-Z]{3,}/.test(left)) {
        left = Number(cleanL)
        right = Number(cleanR)
      }
    }

    let comp = 0
    if (typeof left === "number" && typeof right === "number" && !isNaN(left) && !isNaN(right)) {
      comp = left - right
    } else {
      comp = String(left ?? "").localeCompare(String(right ?? ""), language === "en" ? "en" : "vi", { numeric: true })
    }
    return sortDirection === "asc" ? comp : -comp
  })

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const visibleRows = sortedData.slice(startIdx, startIdx + pageSize)
  const endIdx = Math.min(startIdx + pageSize, sortedData.length)

  // Visible page button builder
  const getVisiblePages = () => {
    const pages = []
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) {
        pages.push(p)
      }
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Scrollable Table Area */}
      <div className="w-full overflow-x-auto border border-[#DEE0E5] rounded-xl scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-[#FBFBFC] border-b border-[#E8EBED]">
              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    className={`p-2.5 font-semibold text-[#616B80] whitespace-nowrap ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 font-semibold text-inherit hover:text-[#B20514] transition-colors cursor-pointer"
                    >
                      {col.label}
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ChevronUp size={14} className="text-[#B20514]" />
                        ) : (
                          <ChevronDown size={14} className="text-[#B20514]" />
                        )
                      ) : null}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-[#E8EBED] hover:bg-[#FBFBFC] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-2.5 text-[#333B47] whitespace-nowrap ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-400 font-medium"
                >
                  {emptyMessage || defaultEmptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between gap-4 pt-3 text-xs text-gray-500">
          <span>
            {showingStr} {sortedData.length === 0 ? 0 : startIdx + 1}–{endIdx} {ofStr} {sortedData.length}
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

            {visiblePages.map((pNum, pIdx) => {
              const prevP = visiblePages[pIdx - 1]
              const showEllipsis = prevP && pNum - prevP > 1
              return (
                <React.Fragment key={pNum}>
                  {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                  <button
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
                </React.Fragment>
              )
            })}

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

export default AnalyticsDataTable
