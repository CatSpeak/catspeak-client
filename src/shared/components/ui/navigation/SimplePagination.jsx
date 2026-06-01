import React from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const SimplePagination = ({
  startIndex,
  itemsPerPage,
  totalCount,
  setStartIndex, // Handler setter
  suffix = "items",
}) => {
  const canPrev = startIndex > 0
  const canNext = startIndex + itemsPerPage < totalCount

  const handleNext = () => {
    if (canNext) {
      setStartIndex((prev) => prev + itemsPerPage)
    }
  }

  const handlePrev = () => {
    if (canPrev) {
      setStartIndex((prev) => Math.max(0, prev - itemsPerPage))
    }
  }

  // Helper styles
  const buttonBaseClass =
    "flex h-8 w-8 items-center justify-center transition-colors"
  const buttonDisabledClass = "cursor-not-allowed text-gray-300"
  const buttonEnabledClass = "text-cath-red-700 hover:bg-red-50"

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        disabled={!canPrev}
        className={`${buttonBaseClass} ${
          !canPrev ? buttonDisabledClass : buttonEnabledClass
        }`}
      >
        <FiChevronLeft size={24} />
      </button>

      <span className="text-sm font-bold text-gray-700 min-w-[20px] text-center">
        {totalCount} <span className="font-normal text-gray-400">{suffix}</span>
      </span>

      <button
        onClick={handleNext}
        disabled={!canNext}
        className={`${buttonBaseClass} ${
          !canNext ? buttonDisabledClass : buttonEnabledClass
        }`}
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  )
}

export default SimplePagination
