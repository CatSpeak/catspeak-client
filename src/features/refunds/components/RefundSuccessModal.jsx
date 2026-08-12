import React from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { CheckCircle2 } from "lucide-react"

export default function RefundSuccessModal({ isOpen, onClose }) {
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
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-in zoom-in-75">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1.5">
          {refundT.successTitle || "Gửi yêu cầu hoàn tiền thành công!"}
        </h3>
        <p className="text-sm text-gray-500 mb-5 max-w-sm leading-relaxed">
          {refundT.successSubtitle ||
            "Vui lòng chờ Admin phê duyệt. Bạn có thể theo dõi tiến độ trong Lịch sử hoàn tiền."}
        </p>
        <PillButton onClick={onClose} className="w-full">
          {refundT.btnDone || "Hoàn tất"}
        </PillButton>
      </div>
    </Modal>
  )
}
