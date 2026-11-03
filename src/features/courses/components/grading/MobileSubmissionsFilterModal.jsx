import React from "react"
import { X, Check } from "lucide-react"

const MobileSubmissionsFilterModal = ({
  isOpen,
  onClose,
  submissionStatusFilter,
  onSelectSubmissionStatus,
  gradingStatusFilter,
  onSelectGradingStatus,
  scoreFilter,
  onSelectScore,
  submissionStatusOptions = [],
  gradingStatusOptions = [],
  scoreOptions = [],
  onReset,
  qg = {},
}) => {
  if (!isOpen) return null

  const activeFiltersCount =
    (submissionStatusFilter !== "all" ? 1 : 0) +
    (gradingStatusFilter !== "all" ? 1 : 0) +
    (scoreFilter !== "all" ? 1 : 0)

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Container */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200 border border-transparent dark:border-[#3F3F3F]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#3F3F3F]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              {qg.filterModalTitle || qg.filter || "Bộ lọc"}
            </h3>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#990011] dark:bg-[#FF6B6B] text-white text-xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#990011] dark:hover:text-[#FF6B6B] transition-colors cursor-pointer"
              >
                {qg.reset || "Đặt lại"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#333333] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              aria-label={qg.close || "Đóng"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Sections (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Section 1: Trạng thái nộp */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5">
              {qg.submissionStatus}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {submissionStatusOptions.map((opt) => {
                const isSelected = submissionStatusFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectSubmissionStatus(opt.value)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#990011] dark:border-[#FF6B6B] bg-red-50/50 dark:bg-red-950/30 text-[#990011] dark:text-[#FF6B6B]"
                        : "border-border dark:border-[#3F3F3F] bg-gray-50/50 dark:bg-[#222222] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {opt.style ? (
                      <span className={`px-2 py-0.5 rounded-full ${opt.style}`}>
                        {opt.label}
                      </span>
                    ) : (
                      <span>{opt.label}</span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-[#990011] dark:text-[#FF6B6B] stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: Trạng thái chấm */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5">
              {qg.gradingStatus}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {gradingStatusOptions.map((opt) => {
                const isSelected = gradingStatusFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectGradingStatus(opt.value)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#990011] dark:border-[#FF6B6B] bg-red-50/50 dark:bg-red-950/30 text-[#990011] dark:text-[#FF6B6B]"
                        : "border-border dark:border-[#3F3F3F] bg-gray-50/50 dark:bg-[#222222] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                    }`}
                  >
                    {opt.style ? (
                      <span className={`px-2 py-0.5 rounded-full ${opt.style}`}>
                        {opt.label}
                      </span>
                    ) : (
                      <span>{opt.label}</span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-[#990011] dark:text-[#FF6B6B] stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Điểm số & Sắp xếp */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2.5">
              {qg.score}
            </h4>
            <div className="space-y-1.5">
              {scoreOptions.map((opt) => {
                const isSelected = scoreFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectScore(opt.value)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#990011] dark:border-[#FF6B6B] bg-red-50/50 dark:bg-red-950/30 text-[#990011] dark:text-[#FF6B6B]"
                        : "border-border dark:border-[#3F3F3F] bg-gray-50/50 dark:bg-[#222222] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#990011] dark:text-[#FF6B6B] stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-gray-100 dark:border-[#3F3F3F]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#990011] hover:bg-[#80000e] text-white rounded-2xl text-xs font-bold tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            {qg.apply || "Áp dụng"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileSubmissionsFilterModal
