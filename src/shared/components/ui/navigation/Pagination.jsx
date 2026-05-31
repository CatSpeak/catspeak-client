import React from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const Pagination = ({ page, totalPages, onChangePage }) => {
  const goPrevPage = () => onChangePage(Math.max(1, page - 1))
  const goNextPage = () => onChangePage(Math.min(totalPages, page + 1))

  if (totalPages <= 1) return null

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Trang <span className="font-semibold">{page}</span> trên{" "}
        <span className="font-semibold">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={goPrevPage}
          disabled={page === 1}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full border",
            page === 1
              ? "border-gray-200 text-gray-300"
              : "border-cath-red-700/30 text-cath-red-700 hover:bg-cath-red-700/5",
          ].join(" ")}
          aria-label="Trang trước"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
          (n) => (
            <button
              key={n}
              onClick={() => onChangePage(n)}
              className={[
                "min-w-[36px] rounded-full px-3 py-1 text-sm font-semibold transition",
                n === page
                  ? "bg-cath-red-700 text-white"
                  : "text-gray-600 hover:bg-cath-red-700/5",
              ].join(" ")}
            >
              {n}
            </button>
          ),
        )}

        {totalPages > 5 && (
          <span className="px-2 text-sm text-gray-400">…</span>
        )}

        {totalPages > 5 && (
          <button
            onClick={() => onChangePage(totalPages)}
            className={[
              "min-w-[36px] rounded-full px-3 py-1 text-sm font-semibold transition",
              page === totalPages
                ? "bg-cath-red-700 text-white"
                : "text-gray-600 hover:bg-cath-red-700/5",
            ].join(" ")}
          >
            {totalPages}
          </button>
        )}

        <button
          onClick={goNextPage}
          disabled={page === totalPages}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full border",
            page === totalPages
              ? "border-gray-200 text-gray-300"
              : "border-cath-red-700/30 text-cath-red-700 hover:bg-cath-red-700/5",
          ].join(" ")}
          aria-label="Trang tiếp"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
