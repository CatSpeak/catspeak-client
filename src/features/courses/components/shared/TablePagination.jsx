import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const TablePagination = ({ currentPage, totalPages, totalCount, limit, onPageChange, t }) => {
  const c = t?.courses || {}
  const parsedTotalCount = Number(totalCount)
  const parsedLimit = Number(limit)
  const parsedTotalPages = Number(totalPages)
  const parsedCurrentPage = Number(currentPage)
  const normalizedTotalCount = Number.isFinite(parsedTotalCount)
    ? Math.max(0, Math.floor(parsedTotalCount))
    : 0
  const normalizedLimit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.floor(parsedLimit))
    : 1
  const normalizedTotalPages = Number.isFinite(parsedTotalPages)
    ? Math.max(1, Math.floor(parsedTotalPages))
    : 1
  const normalizedCurrentPage = Math.min(
    Number.isFinite(parsedCurrentPage)
      ? Math.max(1, Math.floor(parsedCurrentPage))
      : 1,
    normalizedTotalPages,
  )

  // Generate page numbers with truncation for high totals
  const getPages = () => {
    const pages = []
    if (normalizedTotalPages <= 7) {
      for (let i = 1; i <= normalizedTotalPages; i++) {
        pages.push(i)
      }
    } else {
      if (normalizedCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", normalizedTotalPages)
      } else if (normalizedCurrentPage >= normalizedTotalPages - 3) {
        pages.push(
          1,
          "...",
          normalizedTotalPages - 4,
          normalizedTotalPages - 3,
          normalizedTotalPages - 2,
          normalizedTotalPages - 1,
          normalizedTotalPages,
        )
      } else {
        pages.push(
          1,
          "...",
          normalizedCurrentPage - 1,
          normalizedCurrentPage,
          normalizedCurrentPage + 1,
          "...",
          normalizedTotalPages,
        )
      }
    }
    return pages
  }

  const pages = getPages()
  const firstItem = normalizedTotalCount === 0
    ? 0
    : Math.min(
      (normalizedCurrentPage - 1) * normalizedLimit + 1,
      normalizedTotalCount,
    )
  const lastItem = normalizedTotalCount === 0
    ? 0
    : Math.min(normalizedCurrentPage * normalizedLimit, normalizedTotalCount)
  const showingRange = firstItem === lastItem
    ? String(firstItem)
    : `${firstItem}-${lastItem}`
  const resultsText = typeof c.showingResults === "string"
    ? c.showingResults
      .replace("{{count}}", showingRange)
      .replace("{{total}}", String(normalizedTotalCount))
    : `Showing ${showingRange} out of ${normalizedTotalCount} results`
  const isPreviousDisabled = normalizedCurrentPage === 1
  const isNextDisabled = (
    normalizedTotalCount === 0 ||
    normalizedCurrentPage === normalizedTotalPages
  )

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-1 text-xs font-semibold text-gray-400">

      {/* Results counter */}
      <span aria-live="polite">{resultsText}</span>

      {/* Pagination buttons */}
      <nav aria-label={c.pagination || "Pagination"} className="flex items-center gap-2">
        {/* Prev Page */}
        <button
          type="button"
          aria-label={c.previousPage || "Previous page"}
          onClick={() => onPageChange(normalizedCurrentPage - 1)}
          disabled={isPreviousDisabled}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isPreviousDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-400 text-white hover:bg-gray-500"
            }`}
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className="px-1 text-gray-450 font-bold select-none"
              >
                ...
              </span>
            )
          }
          const isActive = p === normalizedCurrentPage
          const displayNum = p < 10 ? `0${p}` : `${p}`
          return (
            <button
              type="button"
              key={p}
              aria-label={`${c.page || "Page"} ${p}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-full border text-xs font-bold transition-all flex items-center justify-center ${isActive
                ? "bg-[#990011] border-[#990011] text-white"
                : "border-border text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-white"
                }`}
            >
              {displayNum}
            </button>
          )
        })}

        {/* Next Page */}
        <button
          type="button"
          aria-label={c.nextPage || "Next page"}
          onClick={() => onPageChange(normalizedCurrentPage + 1)}
          disabled={isNextDisabled}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isNextDisabled
            ? "bg-gray-50 border-border text-gray-300 cursor-not-allowed"
            : "border-[#990011] hover:bg-red-50 text-[#990011] bg-white"
            }`}
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </nav>

    </div>
  )
}

export default TablePagination
