import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const TablePagination = ({ currentPage, totalPages, totalCount, limit, onPageChange, t }) => {
  const c = t.courses || {}

  // Generate page numbers with truncation for high totals
  const getPages = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const pages = getPages()

  const showingCount = Math.min(limit, totalCount)
  const resultsText = c.showingResults
    ? c.showingResults.replace("{{count}}", showingCount).replace("{{total}}", totalCount)
    : `Showing ${showingCount} out of ${totalCount} results`

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-1 text-xs font-semibold text-gray-400">

      {/* Results counter */}
      <span>{resultsText}</span>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        {/* Prev Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-400 text-white hover:bg-gray-500"
            }`}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-gray-450 font-bold select-none">
                ...
              </span>
            )
          }
          const isActive = p === currentPage
          const displayNum = p < 10 ? `0${p}` : `${p}`
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-full border text-xs font-bold transition-all flex items-center justify-center ${isActive
                ? "bg-[#990011] border-[#990011] text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-white"
                }`}
            >
              {displayNum}
            </button>
          )
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${currentPage === totalPages
            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
            : "border-[#990011] hover:bg-red-50 text-[#990011] bg-white"
            }`}
        >
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  )
}

export default TablePagination
