import React, { useState } from "react"
import { X, Lightbulb } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

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

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Chọn cấp độ HSK tạm thời
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Bạn chưa làm bài kiểm tra đầu vào (xếp lớp)? Tự chọn level ước lượng để AI tối ưu độ khó hội thoại cho phù hợp:
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
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
                        ? "border-[#990011] bg-rose-50/40 text-[#990011] font-semibold"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {/* Radio circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? "border-[#990011]" : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#990011]" />
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
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors cursor-pointer text-center"
              >
                Làm bài test đầu vào
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SelectHskLevelModal
