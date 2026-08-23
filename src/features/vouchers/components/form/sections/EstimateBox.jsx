import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import { formatCurrency } from "../../../utils/voucherTransforms"

export const EstimateBox = ({
  form,
  sampleOriginalTuition,
  discountAmountForOne,
  platformFee,
  teacherReceives,
  isPercent,
}) => {
  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Ước tính (1 học viên)</h4>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Học phí gốc:</span>
          <span>{formatCurrency(sampleOriginalTuition)}</span>
        </div>

        <div className="flex justify-between text-cath-red-700">
          <span>
            Voucher giảm (
            {isPercent ? `${form.discountValue || 0}%` : "Cố định"}):
          </span>
          <span>-{formatCurrency(discountAmountForOne)}</span>
        </div>

        <div className="flex justify-between">
          <span>Nền tảng thu (10%):</span>
          <span>-{formatCurrency(platformFee)}</span>
        </div>

        <Divider className="!my-4" />

        <div className="flex justify-between items-baseline">
          <span className="font-bold">Bạn nhận:</span>
          <span className="font-bold text-lg">
            {formatCurrency(teacherReceives)}
          </span>
        </div>
      </div>
    </FluentCard>
  )
}

export default EstimateBox
