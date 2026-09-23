import React from "react"
import { AlertTriangle, X } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const QuotaExceededModal = ({
  isOpen = false,
  onClose,
  onUpgrade,
  onLater,
}) => {
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
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#990011] uppercase">
                  Hết hạn mức miễn phí hôm nay
                </h2>
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

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 mt-3.5 leading-relaxed">
              Tài khoản Miễn phí (Free) được cấp 2 buổi luyện nói trọn vẹn mỗi ngày. Hạn mức hôm nay đã hết, vui lòng nâng cấp để luyện nói không giới hạn:
            </p>

            {/* Premium Benefits Box */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2.5">
              <h3 className="font-bold text-xs sm:text-sm text-[#990011] tracking-wide uppercase">
                Mở khóa toàn bộ sức mạnh với gói Premium:
              </h3>

              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#990011] font-bold">•</span>
                  <span>Luyện nói <strong>KHÔNG GIỚI HẠN</strong> số buổi 24/7 cùng AI Tutor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#990011] font-bold">•</span>
                  <span>Mở khóa toàn bộ 50+ chủ đề chuyên sâu từ HSK 1 đến HSK 6</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#990011] font-bold">•</span>
                  <span>Đào sâu khẩu hình ngữ âm & Video Shorts 1-1 độc quyền</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#990011] font-bold">•</span>
                  <span>Đồng bộ tự động từ vựng vào Flashcard ôn tập ngắt quãng</span>
                </li>
              </ul>

              <div className="pt-2 text-xs sm:text-sm text-slate-700 font-medium">
                Ưu đãi ra mắt chỉ:{" "}
                <span className="text-base sm:text-lg font-bold text-[#990011]">
                  99.000 đ / tháng
                </span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onUpgrade?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Nâng cấp Premium ngay
              </button>

              <button
                type="button"
                onClick={() => {
                  onLater?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Để mai tôi luyện tiếp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default QuotaExceededModal
