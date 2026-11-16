import React from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Ticket } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ExchangeSuccessModal = ({
  isOpen,
  onClose,
  voucher,
  onViewVault,
  onCopyCode,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const sc = pt.modals?.success || {}

  if (!isOpen || !voucher) return null

  const voucherTitle = voucher.title || voucher.name || ""
  const messageText = sc.message
    ? sc.message.replace("{{title}}", voucherTitle)
    : `Voucher ${voucherTitle} đã được thêm vào kho của bạn.`

  const expiryText = sc.validUntil
    ? sc.validUntil.replace(
        "{{date}}",
        voucher.expiryDate || sc.defaultExpiry || "30 ngày sau",
      )
    : `Hiệu lực đến: ${voucher.expiryDate || "30 ngày sau"}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-transparent dark:border-[#3F3F3F] p-6 sm:p-7 flex flex-col items-center text-center z-10"
        >
          {/* Green Check Circle */}
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
            <Check size={28} strokeWidth={2.5} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
            {sc.title || "Đổi Voucher thành công!"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-5 leading-relaxed">
            {messageText}
          </p>

          {/* Voucher Code Card Box */}
          <div className="w-full bg-amber-50/60 dark:bg-[#242424] border border-dashed border-amber-300 dark:border-amber-700/60 rounded-xl p-3.5 mb-5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Ticket size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-neutral-300">
                  {sc.codeLabel || "MÃ VOUCHER"}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyCode(voucher.code)}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-[#333] text-amber-700 dark:text-amber-400 rounded transition cursor-pointer"
                  title={sc.copyTooltip || "Sao chép mã"}
                >
                  <Copy size={13} />
                </button>
              </div>
              <div className="font-mono font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-wide">
                {voucher.code}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">
                {expiryText}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={onViewVault}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] rounded-xl shadow-sm transition cursor-pointer"
            >
              {sc.viewVaultBtn || "Xem kho voucher của tôi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
            >
              {sc.closeBtn || "Đóng"}
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExchangeSuccessModal
