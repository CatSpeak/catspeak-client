import React from "react"
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
      message={stopDesc}
      confirmText={t?.vouchers?.modals?.stopAction || "Xác nhận dừng"}
      cancelText={t?.vouchers?.detail?.close || "Hủy"}
      confirmVariant="destructive"
      isPending={isSubmitting}
    />
  )
}

export default StopVoucherModal
