import React from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Ticket, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ExchangeConfirmModal = ({
  isOpen,
  onClose,
  voucher,
  availablePoints = 0,
  onConfirm,
  isProcessing = false,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const cf = pt.modals?.confirm || {}

  if (!isOpen || !voucher) return null

  const cost = voucher.pointsRequired || 0
  const remaining = Math.max(0, availablePoints - cost)

  const promptText = cf.prompt
    ? cf.prompt.replace("{{points}}", cost.toLocaleString("vi-VN"))
    : `Bạn có chắc muốn dùng ${cost.toLocaleString("vi-VN")} điểm để đổi ưu đãi này không?`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessing ? onClose : undefined}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#990011]">
                <Ticket size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {cf.title || "Xác nhận đổi Voucher"}
              </h3>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-5 pt-3 space-y-4">
            <p className="text-xs text-gray-500">
              {promptText}
            </p>

            {/* Details Box */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 shrink-0">
                  {cf.voucherLabel || "Voucher"}
                </span>
                <span className="font-semibold text-gray-900 text-right">
                  {voucher.title || voucher.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  {cf.availablePoints || "Điểm hiện có"}
                </span>
                <span className="font-medium text-gray-800">
                  {availablePoints.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  {cf.deductPoints || "Điểm cần trừ"}
                </span>
                <span className="font-bold text-[#990011]">
                  -{cost.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="border-t border-gray-200/80 pt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                  {cf.remainingPoints || "Điểm còn lại"}
                </span>
                <span className="font-bold text-emerald-600 text-base">
                  {remaining.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {cf.cancel || "Hủy"}
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={onConfirm}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer"
              >
                {cf.confirmBtn || "Xác nhận đổi"}
              </button>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExchangeConfirmModal
