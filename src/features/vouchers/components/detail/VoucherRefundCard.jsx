import React from "react"
import { Info, HelpCircle } from "lucide-react"
import { formatCurrency } from "../../utils/voucherTransforms"
import { useTimezone } from "@/shared/hooks/useTimezone"

/**
 * VoucherRefundCard - Khối Dự kiến hoàn cọc của voucher
 * Specification 5 & BR-VC-GV-24:
 * Đoạn mô tả diễn giải cách tính + "Ước tính hoàn: ~{số tiền}đ".
 */
const VoucherRefundCard = ({ voucher = {} }) => {
  const { formatDate } = useTimezone()

  // Format expiration / end date
  let endDateDisplay = "kết thúc chiến dịch"
  if (voucher.validTo) {
    endDateDisplay = formatDate(voucher.validTo)
  }

  // Calculate remaining deposit (estimated refund)
  const depositPaid = Number(
    voucher.depositPaid ?? voucher.depositAmount ?? voucher.depositRequired ?? 0
  )
  const depositUsed = Number(
    voucher.depositUsed ?? voucher.totalDiscountGiven ?? 0
  )
  const estimatedRefund = Number(
    voucher.estimatedRefund ?? Math.max(0, depositPaid - depositUsed)
  )

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-4">
      {/* Background Watermark/Icon */}
      <div className="absolute right-3 top-3 text-slate-100/60 dark:text-zinc-800/40 pointer-events-none select-none">
        <HelpCircle className="w-24 h-24 stroke-[1]" />
      </div>

      <div className="relative z-10 space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Dự kiến hoàn cọc
        </h3>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
          Dựa trên mức sử dụng hiện tại, dự kiến số tiền cọc dư sẽ được hoàn lại vào
          ngày kết thúc chiến dịch{" "}
          <strong className="text-slate-900 dark:text-zinc-200 font-bold">
            {endDateDisplay}
          </strong>
          . Số tiền thực tế có thể thay đổi tùy thuộc vào lượng đơn hàng áp dụng thành
          công.
        </p>

        {/* Estimated Refund Highlight */}
        <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Ước tính hoàn: ~{formatCurrency(estimatedRefund)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VoucherRefundCard
