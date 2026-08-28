import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import VoucherStatusBadge from "../VoucherStatusBadge"

/**
 * RejectionReasonModal - Modal hiển thị lý do từ chối voucher
 * Styled identically to TransferInfoModal for UI consistency.
 */
const RejectionReasonModal = ({ open = false, onClose, voucher = {} }) => {
  const { t } = useLanguage()
  const vm = t?.vouchers?.modals || {}
  const vt = t?.vouchers?.table || {}

  const reason =
    voucher.rejectionReason ||
    voucher.rejectionNote ||
    "Nội dung chương trình ưu đãi hoặc cấu hình mức giảm chưa phù hợp với quy định kiểm duyệt của nền tảng."

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vm.rejectionTitle || "Lý do từ chối duyệt voucher"}
      className="md:max-w-xl"
      bodyClassName="px-4 sm:px-6 overflow-y-auto min-h-0 flex-1"
    >
      <div>
        {/* Mã voucher */}
        <div className="h-[56px] flex items-center justify-between">
          <span className="text-secondary">{vt.code || "Mã voucher"}</span>
          <span>{voucher.code || "-"}</span>
        </div>

        {/* Tên voucher */}
        <div className="h-[56px] flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vt.title || "Tên voucher"}
          </span>
          <span className="text-right truncate">{voucher.title || "-"}</span>
        </div>

        {/* Trạng thái */}
        <div className="h-[56px] flex items-center justify-between">
          <span className="text-secondary">{vt.status || "Trạng thái"}</span>
          <VoucherStatusBadge status={voucher.status || "Rejected"} />
        </div>

        {/* Lý do từ chối */}
        <div className="min-h-[56px] flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vm.adminFeedback || "Lý do"}
          </span>
          <span className="text-right text-cath-red-700 font-medium leading-relaxed">
            {reason}
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default RejectionReasonModal
