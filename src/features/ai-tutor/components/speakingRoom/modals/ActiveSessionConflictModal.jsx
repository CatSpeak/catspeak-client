import React from "react"
import { AlertTriangle } from "lucide-react"
import { createPortal } from "react-dom"

// Không bịa thông tin thiết bị: chỉ hiện dòng nào có dữ liệu thật.
const DEFAULT_SESSION_INFO = {}

const ActiveSessionConflictModal = ({
  isOpen = false,
  onClose,
  sessionInfo = DEFAULT_SESSION_INFO,
  onTransferSession,
  onCloseAndReturnHome,
}) => {
  const currentSession = { ...DEFAULT_SESSION_INFO, ...(sessionInfo || {}) }
  const hasDetails = Boolean(currentSession.device || currentSession.topic || currentSession.status)
  // Không truyền onTransferSession thì là hộp thoại ss08 dạng thông báo: một nút "Đã hiểu".
  const noticeOnly = !onTransferSession

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
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
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
              Bạn đang có buổi luyện nói ở thiết bị khác.
            </p>

            {/* Session details box */}
            {hasDetails && (
              <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentSession.device && (
                  <p>
                    • <strong>Thiết bị:</strong> {currentSession.device}
                  </p>
                )}
                {currentSession.topic && (
                  <p>
                    • <strong>Chủ đề:</strong> {currentSession.topic}
                  </p>
                )}
                {currentSession.status && (
                  <p>
                    • <strong>Trạng thái:</strong> {currentSession.status}
                  </p>
                )}
              </div>
            )}

            {/* Security note */}
            <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 leading-relaxed text-left">
              Để đảm bảo bảo mật và chất lượng âm thanh 2 chiều, mỗi tài khoản chỉ được tham gia 1 phòng nói duy nhất tại một thời điểm.
            </div>

            {/* Footer Action Buttons */}
            {noticeOnly ? (
              <div className="flex items-center justify-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    onCloseAndReturnHome?.()
                    onClose?.()
                  }}
                  className="w-full sm:w-auto sm:min-w-[200px] py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
                >
                  Đã hiểu
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>,
    document.body
  )
}


export default ActiveSessionConflictModal
