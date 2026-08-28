import React from "react"
import { Info, HelpCircle } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { formatCurrency } from "../../utils/voucherTransforms"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * VoucherRefundCard - Khối Dự kiến hoàn cọc của voucher
 * Specification 5 & BR-VC-GV-24:
 * Đoạn mô tả diễn giải cách tính + "Ước tính hoàn: ~{số tiền}đ".
 */
const VoucherRefundCard = ({ voucher = {} }) => {
  const { t } = useLanguage()
  const vd = t?.vouchers?.detail || {}
  const { formatDate } = useTimezone()

  // Format expiration / end date
  let endDateDisplay = vd.refundEndFallback || "kết thúc chiến dịch"
  if (voucher.validTo) {
    endDateDisplay = formatDate(voucher.validTo)
  }

  // Calculate remaining deposit (estimated refund)
  const depositPaid = Number(
    voucher.depositPaid ??
      voucher.depositAmount ??
      voucher.depositRequired ??
      0,
  )
  const depositUsed = Number(
    voucher.depositUsed ?? voucher.totalDiscountGiven ?? 0,
  )
  const estimatedRefund = Number(
    voucher.estimatedRefund ?? Math.max(0, depositPaid - depositUsed),
  )

  const refundDesc = vd.refundDesc
    ? vd.refundDesc.replace("{{date}}", endDateDisplay)
    : `Dựa trên mức sử dụng hiện tại, dự kiến số tiền cọc dư sẽ được hoàn lại vào ngày kết thúc chiến dịch ${endDateDisplay}. Số tiền thực tế có thể thay đổi tùy thuộc vào lượng đơn hàng áp dụng thành công.`

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">{vd.refundTitle || "Dự kiến hoàn cọc"}</h4>

      {/* Detailed Explanation */}
      <p>{refundDesc}</p>

      {/* Estimated Refund Highlight */}
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Info size={20} />
        <p>
          {vd.estimatedRefundPrefix || "Ước tính hoàn: ~"}
          {formatCurrency(estimatedRefund)}
        </p>
      </div>
    </FluentCard>
  )
}

export default VoucherRefundCard
