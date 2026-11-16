import React, { useState } from "react"
import { X, Lightbulb } from "lucide-react"
import { createPortal } from "react-dom"

const HSK_LEVEL_OPTIONS = [
  {
    id: "hsk-1",
    label: "HSK 1 - Mới bắt đầu (Từ vựng cơ bản: Chào hỏi, số đếm)",
    value: "HSK 1",
  },
  {
    id: "hsk-2",
    label: "HSK 2 - Sơ cấp (Giao tiếp ngắn: Mua sắm, hỏi giờ, thời tiết)",
    value: "HSK 2",
  },
  {
    id: "hsk-3",
    label: "HSK 3 - Trung cấp sơ (Giao tiếp tự nhiên, ăn uống) ★ Khuyên dùng",
    value: "HSK 3",
    isRecommended: true,
  },
  {
    id: "hsk-4",
    label: "HSK 4 - Trung cấp (Bàn luận xã hội, sở thích, phỏng vấn)",
    value: "HSK 4",
  },
  {
    id: "hsk-5-6",
    label: "HSK 5-6 - Cao cấp (Thuyết trình, chuyên ngành thương mại)",
    value: "HSK 5-6",
  },
]

const SelectHskLevelModal = ({
  isOpen = false,
  onClose,
  currentLevel = "HSK 3",
  onConfirm,
  onTakePlacementTest,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel)

  if (!isOpen || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Dialog Container */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                  Chọn cấp độ HSK tạm thời
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                  Bạn chưa làm bài kiểm tra đầu vào (xếp lớp)? Tự chọn level ước lượng để AI tối ưu độ khó hội thoại cho phù hợp:
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#272727] hover:bg-slate-200 dark:hover:bg-[#333] flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Level Options List */}
            <div className="space-y-2.5 mt-5">
              {HSK_LEVEL_OPTIONS.map((option) => {
                const isSelected = selectedLevel === option.value
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedLevel(option.value)}
                    className={`p-4 sm:p-4.5 rounded-2xl border transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "border-[#990011] dark:border-red-400 bg-rose-50/40 dark:bg-rose-950/40 text-[#990011] dark:text-red-400 font-semibold"
                        : "border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] hover:border-slate-300 dark:hover:border-neutral-500 text-slate-700 dark:text-neutral-200"
                    }`}
                  >
                    {/* Radio circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? "border-[#990011] dark:border-red-400" : "border-slate-300 dark:border-neutral-500"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#990011] dark:bg-red-400" />
                      )}
                    </div>

                    {/* Option Text */}
                    <span className="text-xs sm:text-sm leading-snug">
                      {option.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tip Box */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Khuyên dùng: Nên làm bài Placement Test (3 phút) để hệ thống tự động xác định level chuẩn nhất.
              </span>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onConfirm?.(selectedLevel)
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-sm tracking-wide transition-colors cursor-pointer text-center"
              >
                Xác nhận & Tiếp tục
              </button>

              <button
                type="button"
                onClick={() => {
                  onTakePlacementTest?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white dark:bg-[#242424] border border-slate-300 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#2c2c2c] text-slate-800 dark:text-neutral-200 font-medium text-sm transition-colors cursor-pointer text-center"
              >
                Làm bài test đầu vào
              </button>
            </div>
          </div>
        </div>,
    document.body
  )
}


export default SelectHskLevelModal
