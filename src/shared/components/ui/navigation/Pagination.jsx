import React from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import IconButton from "../buttons/IconButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const Pagination = ({ page, totalPages, onChangePage, className = "" }) => {
  const { t, language } = useLanguage()
  const p = t.common?.pagination || {}

  const goPrevPage = () => onChangePage(Math.max(1, page - 1))
  const goNextPage = () => onChangePage(Math.min(totalPages, page + 1))

  if (totalPages <= 1) return null

  // Build the page info text based on language
  const pageInfoText = language === "zh"
    ? `${p.page || "第"}${page}${p.of || "页，共"}${totalPages}页`
    : <>
        {p.page || "Trang"} <span className="font-semibold">{page}</span> {p.of || "trên"}{" "}
        <span className="font-semibold">{totalPages}</span>
      </>

  // Mobile: focused 3 pages (never overflows mobile screens)
  const getMobilePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (page === 1) {
      return [1, 2, 3]
    }
    if (page === totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages]
    }
    return [page - 1, page, page + 1]
  }

  // Desktop: standard pagination with smart window
  const getDesktopPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }
    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages]
  }

  const mobilePages = getMobilePages()
  const desktopPages = getDesktopPages()

  return (
    <div className={`mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-center sm:justify-between w-full ${className}`}>
      <p className="text-sm text-gray-600 text-center sm:text-left font-medium">
        {pageInfoText}
      </p>

      {/* Mobile view (< sm): 3 focused page buttons (Size SM, always fits without scroll or wrap) */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 shrink-0">
        <IconButton
          onClick={goPrevPage}
          disabled={page === 1}
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={p.prevPage || "Previous page"}
        >
          <FiChevronLeft className="h-5 w-5" />
        </IconButton>

        {mobilePages.map((n) => (
          <IconButton
            key={n}
            onClick={() => onChangePage(n)}
            variant={n === page ? "primary" : "ghost"}
            size="sm"
            className="shrink-0"
          >
            <span className="text-sm font-semibold">{n}</span>
          </IconButton>
        ))}

        <IconButton
          onClick={goNextPage}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={p.nextPage || "Next page"}
        >
          <FiChevronRight className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Desktop view (>= sm): Full desktop pagination */}
      <div className="hidden sm:flex items-center justify-center gap-2 shrink-0">
        <IconButton
          onClick={goPrevPage}
          disabled={page === 1}
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={p.prevPage || "Previous page"}
        >
          <FiChevronLeft className="h-5 w-5" />
        </IconButton>

        {desktopPages.map((item, idx) => {
          if (item === "...") {
            return (
              <span key={`desktop-ellipsis-${idx}`} className="px-1.5 text-sm text-gray-400 font-semibold select-none shrink-0">
                …
              </span>
            )
          }

          const n = Number(item)
          return (
            <IconButton
              key={n}
              onClick={() => onChangePage(n)}
              variant={n === page ? "primary" : "ghost"}
              size="sm"
              className="shrink-0"
            >
              <span className="text-sm font-semibold">{n}</span>
            </IconButton>
          )
        })}

        <IconButton
          onClick={goNextPage}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={p.nextPage || "Next page"}
        >
          <FiChevronRight className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  )
}

export default Pagination
