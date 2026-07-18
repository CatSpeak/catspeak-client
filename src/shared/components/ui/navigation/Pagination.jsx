import React from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import IconButton from "../buttons/IconButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const Pagination = ({ page, totalPages, onChangePage }) => {
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

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        {pageInfoText}
      </p>
      <div className="flex items-center gap-2">
        <IconButton
          onClick={goPrevPage}
          disabled={page === 1}
          variant="outline"
          size="sm"
          aria-label={p.prevPage || "Previous page"}
        >
          <FiChevronLeft className="h-5 w-5" />
        </IconButton>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
          (n) => (
            <IconButton
              key={n}
              onClick={() => onChangePage(n)}
              variant={n === page ? "primary" : "ghost"}
              size="sm"
            >
              <span className="text-sm font-semibold">{n}</span>
            </IconButton>
          ),
        )}

        {totalPages > 5 && (
          <span className="px-2 text-sm text-gray-400">…</span>
        )}

        {totalPages > 5 && (
          <IconButton
            onClick={() => onChangePage(totalPages)}
            variant={page === totalPages ? "primary" : "ghost"}
            size="sm"
          >
            <span className="text-sm font-semibold">{totalPages}</span>
          </IconButton>
        )}

        <IconButton
          onClick={goNextPage}
          disabled={page === totalPages}
          variant="outline"
          size="sm"
          aria-label={p.nextPage || "Next page"}
        >
          <FiChevronRight className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  )
}

export default Pagination
