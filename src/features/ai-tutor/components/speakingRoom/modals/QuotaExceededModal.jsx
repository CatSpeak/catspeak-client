import React from "react"
import { AlertTriangle, X } from "lucide-react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"

const QuotaExceededModal = ({
  isOpen = false,
  onClose,
  onUpgrade,
  onLater,
}) => {
  const { t } = useLanguage()
  const modalText = t?.aiTutor?.speakingRoom?.modals?.quota || {}
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
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#990011] dark:text-red-400 uppercase">
              {modalText.title || "Hết hạn mức miễn phí hôm nay"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#272727] hover:bg-slate-200 dark:hover:bg-[#333333] flex items-center justify-center text-slate-500 dark:text-neutral-300 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 mt-3.5 leading-relaxed">
          {modalText.desc ||
            "Tài khoản Miễn phí (Free) được cấp 2 buổi luyện nói trọn vẹn mỗi ngày. Bạn đã sử dụng hết hạn mức hôm nay, vui lòng nâng cấp để luyện nói không giới hạn:"}
        </p>

        {/* Premium Benefits Box */}
        <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-2.5">
          <h3 className="font-bold text-xs sm:text-sm text-[#990011] dark:text-red-400 tracking-wide uppercase">
            {modalText.benefitsTitle || "Mở khóa toàn bộ sức mạnh với gói Premium:"}
          </h3>

          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-[#990011] dark:text-red-400 font-bold">•</span>
              <span>{modalText.benefit1 || "Luyện nói KHÔNG GIỚI HẠN số buổi 24/7 cùng AI Tutor"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#990011] dark:text-red-400 font-bold">•</span>
              <span>{modalText.benefit2 || "Mở khóa toàn bộ 50+ chủ đề chuyên sâu từ HSK 1 đến HSK 6"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#990011] dark:text-red-400 font-bold">•</span>
              <span>{modalText.benefit3 || "Đào sâu khẩu hình ngữ âm & Video Shorts 1-1 độc quyền"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#990011] dark:text-red-400 font-bold">•</span>
              <span>{modalText.benefit4 || "Đồng bộ tự động từ vựng vào Flashcard ôn tập ngắt quãng"}</span>
            </li>
          </ul>

          <div className="pt-2 text-xs sm:text-sm text-slate-700 dark:text-neutral-300 font-medium">
            {modalText.priceLabel || "Ưu đãi ra mắt chỉ:"}{" "}
            <span className="text-base sm:text-lg font-bold text-[#990011] dark:text-red-400">
              {modalText.price || "99.000 đ / tháng"}
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
            {modalText.upgrade || "Nâng cấp Premium ngay"}
          </button>

          <button
            type="button"
            onClick={() => {
              onLater?.()
              onClose?.()
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-white dark:bg-[#242424] border border-slate-300 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#2c2c2c] text-slate-700 dark:text-neutral-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
          >
            {modalText.later || "Để mai tôi luyện tiếp"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default QuotaExceededModal
