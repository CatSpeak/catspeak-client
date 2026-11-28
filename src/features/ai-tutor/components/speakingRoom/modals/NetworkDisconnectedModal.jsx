import React, { useEffect, useState } from "react"
import { WifiOff, ShieldCheck } from "lucide-react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"

const fillTemplate = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
    template,
  )

const NetworkDisconnectedModal = ({
  isOpen = false,
  onClose,
  initialSeconds = 15,
  maxSeconds = 15,
  onRetry,
  onEndAndSave,
}) => {
  const { t } = useLanguage()
  const modalText = t?.aiTutor?.speakingRoom?.modals?.network || {}
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!isOpen) return
    // Mỗi lần mất kết nối đếm lại từ đầu (BUG-SS-06); modal được remount bằng key
    // khi trạng thái mở thay đổi nên seconds khởi tạo lại đúng giá trị.
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [isOpen, initialSeconds])

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
        className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Center Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {modalText.title || "Mất Kết Nối Đường Truyền"}
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
          {modalText.subtitle ||
            "Tín hiệu âm thanh với phòng luyện nói AI bị gián đoạn do mạng không ổn định."}
        </p>

        {/* Reconnecting Progress Box */}
        <div className="mt-5 p-4 sm:p-4.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-13 h-13 rounded-full border-2 border-[#990011] dark:border-red-400 flex items-center justify-center font-bold text-sm text-[#990011] dark:text-red-400 bg-white dark:bg-[#272727] shadow-2xs">
            {seconds}s
          </div>

          <div
            role="alert"
            aria-live="assertive"
            className="text-xs sm:text-sm font-semibold text-[#990011] dark:text-red-400"
          >
            {fillTemplate(
              modalText.reconnecting ||
                "Mất kết nối âm thanh. Đang kết nối lại... ({{seconds}}s)",
              { seconds },
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {modalText.keepScreen ||
              "Vui lòng giữ nguyên màn hình, AI sẽ tiếp tục ngay khi có mạng."}
          </p>
        </div>

        {/* Safety status alert */}
        <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {fillTemplate(
              modalText.safe ||
                "Dữ liệu thoại trước đó đã được lưu an toàn. Quá {{seconds}}s sẽ tự động tổng kết buổi học.",
              { seconds: maxSeconds },
            )}
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
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white dark:bg-[#272727] border border-slate-200 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#3D3D3D] text-slate-700 dark:text-neutral-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
          >
            {modalText.endAndSave || "Kết thúc & Lưu kết quả"}
          </button>

          <button
            type="button"
            onClick={() => {
              onRetry?.()
              onClose?.()
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] dark:bg-cath-red-700 hover:bg-[#85000f] dark:hover:bg-red-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
          >
            {modalText.retryNow || "Thử kết nối lại ngay"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default NetworkDisconnectedModal
