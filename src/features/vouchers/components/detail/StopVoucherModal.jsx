import React from "react"
import { AlertTriangle } from "lucide-react"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * StopVoucherModal - Dialog xác nhận dừng sớm voucher (BR-VC-GV-23)
 */
const StopVoucherModal = ({
  open = false,
  onClose,
  onConfirm,
  voucherCode = "",
  isSubmitting = false,
}) => {
  const { t } = useLanguage()

  const stopDesc = t?.vouchers?.modals?.stopDesc
    ? t.vouchers.modals.stopDesc.replace("{{code}}", voucherCode)
    : `Bạn có chắc chắn muốn dừng sớm voucher ${voucherCode}? Sau khi dừng, học viên sẽ không thể áp dụng mã này nữa.`

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t?.vouchers?.modals?.stopTitle || "Dừng sớm voucher"}
      confirmText={t?.vouchers?.modals?.stopAction || "Xác nhận dừng"}
      cancelText={t?.vouchers?.detail?.close || "Hủy"}
      confirmVariant="destructive"
      isPending={isSubmitting}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-cath-red-700">
          <AlertTriangle className="w-5 h-5 text-cath-red-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            {stopDesc}
          </div>
        </div>
      </div>
    </ConfirmationModal>
  )
}

export default StopVoucherModal
