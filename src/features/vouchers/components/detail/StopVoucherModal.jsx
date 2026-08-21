import React from "react"
import { AlertTriangle } from "lucide-react"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

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
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Dừng sớm voucher"
      confirmText="Xác nhận dừng"
      cancelText="Hủy"
      confirmVariant="destructive"
      isPending={isSubmitting}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            Bạn đang yêu cầu dừng hoạt động của voucher{" "}
            <strong className="font-bold text-rose-900 dark:text-rose-200">
              {voucherCode}
            </strong>
            .
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          Sau khi dừng, voucher sẽ chuyển sang trạng thái <strong>Đã dừng (Stopped)</strong>,
          không thể kích hoạt lại và học viên sẽ không thể áp dụng voucher này cho các đơn
          hàng mới.
        </p>
      </div>
    </ConfirmationModal>
  )
}

export default StopVoucherModal
