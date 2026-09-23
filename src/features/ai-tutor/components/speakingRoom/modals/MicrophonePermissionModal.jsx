import React from "react"
import { Mic, X } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const MicrophonePermissionModal = ({
  isOpen = false,
  onClose,
  onRetry,
  onBackToTopics,
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
                <Mic className="w-5 h-5 text-[#990011] shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Hướng dẫn mở quyền Microphone
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
              Trình duyệt đang chặn truy cập Micro. CatSpeak cần quyền Micro để AI nhận diện giọng nói và đàm thoại thời gian thực cùng bạn:
            </p>

            {/* 3 Steps Guide Box */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 tracking-wide uppercase">
                3 bước mở khóa Microphone nhanh:
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  <strong>Bước 1:</strong> Nhấn vào biểu tượng Ổ khóa cạnh thanh URL trình duyệt góc trên bên trái.
                </p>
                <p>
                  <strong>Bước 2:</strong> Tìm mục Microphone và chuyển trạng thái gạt sang Cho phép (Allow).
                </p>
                <p>
                  <strong>Bước 3:</strong> Nhấn nút &apos;Đã bật mic, Thử lại ngay&apos; bên dưới để hệ thống kiểm tra lại tín hiệu.
                </p>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onRetry?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Đã bật mic, Thử lại ngay
              </button>

              <button
                type="button"
                onClick={() => {
                  onBackToTopics?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Quay lại chọn chủ đề
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MicrophonePermissionModal
