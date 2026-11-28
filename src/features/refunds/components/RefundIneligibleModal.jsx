import React from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AlertCircle } from "lucide-react"

export default function RefundIneligibleModal({ isOpen, onClose, reason }) {
  const { t } = useLanguage()
  const refundT = t.refunds || {}

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
      bodyClassName="p-6 !mb-0"
      className="max-w-md"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-3">
          <AlertCircle size={30} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1.5">
          {refundT.ineligibleTitle || "Không đủ điều kiện hoàn tiền"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-neutral-300 mb-5 max-w-sm leading-relaxed">
          {reason ||
            refundT.defaultIneligibleReason ||
            "Giao dịch đã quá hạn áp dụng chính sách hoàn tiền."}
        </p>
        <PillButton variant="secondary" onClick={onClose} className="w-full">
          {refundT.btnClose || "Đóng"}
        </PillButton>
      </div>
    </Modal>
  )
}
