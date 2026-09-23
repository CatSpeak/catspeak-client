import React, { useEffect, useState } from "react"
import { WifiOff, ShieldCheck } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const NetworkDisconnectedModal = ({
  isOpen = false,
  onClose,
  initialSeconds = 12,
  maxSeconds = 15,
  onRetry,
  onEndAndSave,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!isOpen) {
      setSeconds(initialSeconds)
      return
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, initialSeconds])

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
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center max-h-[90vh] overflow-y-auto"
          >
            {/* Center Icon */}
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
              <WifiOff className="w-8 h-8" />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Mất Kết Nối Đường Truyền
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
              Tín hiệu âm thanh với phòng luyện nói AI bị gián đoạn do mạng không ổn định.
            </p>

            {/* Reconnecting Progress Box */}
            <div className="mt-5 p-4 sm:p-4.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-13 h-13 rounded-full border-2 border-[#990011] flex items-center justify-center font-bold text-sm text-[#990011] bg-white shadow-2xs">
                {seconds}s
              </div>

              <div className="text-xs sm:text-sm font-semibold text-[#990011]">
                Đang tự động thử kết nối lại... ({seconds} / {maxSeconds} giây)
              </div>

              <p className="text-xs text-slate-500">
                Vui lòng giữ nguyên màn hình, AI sẽ tiếp tục ngay khi có mạng.
              </p>
            </div>

            {/* Safety status alert */}
            <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Dữ liệu thoại trước đó đã được lưu an toàn. Quá {maxSeconds}s sẽ tự động tổng kết buổi học.
              </span>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onEndAndSave?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Kết thúc & Lưu kết quả
              </button>

              <button
                type="button"
                onClick={() => {
                  onRetry?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Thử kết nối lại ngay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default NetworkDisconnectedModal
