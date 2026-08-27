import React from "react"
import { AlertCircle, Ban } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * RejectionReasonModal - Modal hiển thị lý do từ chối voucher
 */
const RejectionReasonModal = ({
  open = false,
  onClose,
  voucher = {},
}) => {
  const { t } = useLanguage()
  const vm = t?.vouchers?.modals || {}
  const vd = t?.vouchers?.detail || {}

  const reason =
    voucher.rejectionReason ||
    voucher.rejectionNote ||
    "Nội dung chương trình ưu đãi hoặc cấu hình mức giảm chưa phù hợp với quy định kiểm duyệt của nền tảng."

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vm.rejectionTitle || "Lý do từ chối duyệt voucher"}
      maxWidth="max-w-md"
      bodyClassName="px-6 py-4 space-y-4"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Header summary */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-800">
          <Ban className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-mono font-bold">{voucher.code}</span>
          <span className="text-slate-400">•</span>
          <span className="truncate">{voucher.title}</span>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{vm.adminFeedback || "Phản hồi từ Ban Quản Trị:"}</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
            {reason}
          </p>
        </div>

        {/* Suggestion */}
        <p className="text-xs text-slate-500 leading-relaxed">
          {vm.rejectionSuggestion ||
            "Khoản tiền cọc đã được bảo lưu hoặc hoàn trả về tài khoản của bạn. Bạn có thể tạo voucher mới với thông tin điều chỉnh phù hợp."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {vd.close || "Đóng"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default RejectionReasonModal
