import React from "react"
import { AlertTriangle } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const DEFAULT_SESSION_INFO = {
  device: "Chrome trên Windows (Bắt đầu lúc 14:20)",
  topic: "Mua hoa quả ở chợ (买水果) · HSK 3",
  status: "Đang kết nối âm thanh tương tác 2 chiều",
}

const ActiveSessionConflictModal = ({
  isOpen = false,
  onClose,
  sessionInfo = DEFAULT_SESSION_INFO,
  onTransferSession,
  onCloseAndReturnHome,
}) => {
  const currentSession = { ...DEFAULT_SESSION_INFO, ...sessionInfo }

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
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
              Phát hiện phiên học đang hoạt động
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
              Tài khoản của bạn đang có một phiên luyện nói AI đang chạy ở cửa sổ trình duyệt hoặc thiết bị khác:
            </p>

            {/* Session details box */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                • <strong>Thiết bị:</strong> {currentSession.device}
              </p>
              <p>
                • <strong>Chủ đề:</strong> {currentSession.topic}
              </p>
              <p>
                • <strong>Trạng thái:</strong> {currentSession.status}
              </p>
            </div>

            {/* Security note */}
            <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 leading-relaxed text-left">
              Để đảm bảo bảo mật và chất lượng âm thanh 2 chiều, mỗi tài khoản chỉ được tham gia 1 phòng nói duy nhất tại một thời điểm.
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onCloseAndReturnHome?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Đóng & Quay về Trang chủ
              </button>

              <button
                type="button"
                onClick={() => {
                  onTransferSession?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Chuyển phiên sang thiết bị này
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ActiveSessionConflictModal
