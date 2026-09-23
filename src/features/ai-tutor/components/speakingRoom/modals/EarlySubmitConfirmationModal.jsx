import React from "react"
import { LogOut, Info, Sparkles, X } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const EarlySubmitConfirmationModal = ({
  isOpen = false,
  onClose,
  completedCount = 2,
  totalCount = 4,
  onSubmitEarly,
  onContinueSpeaking,
}) => {
  if (typeof document === "undefined") return null

  const formattedCompleted = String(completedCount).padStart(2, "0")
  const formattedTotal = String(totalCount).padStart(2, "0")

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
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Center Icon */}
            <div className="w-14 h-14 rounded-full bg-rose-100/70 text-[#990011] flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
              <LogOut className="w-6 h-6" />
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
              Hoàn thành bài nói & xem kết quả ngay?
            </h2>

            {/* Practice Count Subtitle */}
            <p className="text-xs sm:text-sm font-semibold text-[#990011] mt-1.5 mb-5">
              Số câu bạn đã luyện tập: {formattedCompleted} / {formattedTotal} câu phản xạ.
            </p>

            {/* Box 1: Thông tin nộp bài sớm */}
            <div className="p-4 sm:p-4.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wide">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Thông tin nộp bài sớm</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed pl-6">
                Bạn có thể nộp bài bất cứ lúc nào! Hệ thống sẽ chấm điểm và nhận xét dựa trên những câu bạn đã đàm thoại trong buổi này.
              </p>
            </div>

            {/* Box 2: Bạn sẽ nhận được sau khi nộp bài */}
            <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bạn sẽ nhận được sau khi nộp bài</span>
              </div>
              <p className="text-xs text-emerald-800/80 leading-relaxed pl-6">
                Báo cáo đánh giá phát âm chi tiết + các từ vựng mới/sai tự động lưu vào sổ Flashcard ôn tập ngắt quãng của bạn!
              </p>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onSubmitEarly?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-[#990011] font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Nộp bài & Xem điểm
              </button>

              <button
                type="button"
                onClick={() => {
                  onContinueSpeaking?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Tiếp tục luyện nói
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default EarlySubmitConfirmationModal
