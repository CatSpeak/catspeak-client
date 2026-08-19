import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
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
    <FluentCard className="bg-blue-50/50 border-blue-100 space-y-3.5">
      <div className="flex items-center gap-2 text-blue-950">
        <span className="text-base">💡</span>
        <h4 className="text-xs font-bold">Ước tính (1 học viên)</h4>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Học phí gốc:</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(sampleOriginalTuition)}
          </span>
        </div>

        <div className="flex justify-between text-rose-600">
          <span>Voucher giảm ({isPercent ? `${form.discountValue || 0}%` : "Cố định"}):</span>
          <span className="font-semibold">
            -{formatCurrency(discountAmountForOne)}
          </span>
        </div>

        <div className="flex justify-between text-slate-500">
          <span>Nền tảng thu (10%):</span>
          <span className="font-semibold">
            -{formatCurrency(platformFee)}
          </span>
        </div>

        <div className="pt-2.5 border-t border-blue-200/70 flex justify-between items-baseline">
          <span className="font-bold text-slate-900 text-xs">
            Bạn nhận:
          </span>
          <span className="text-base font-black text-slate-900">
            {formatCurrency(teacherReceives)}
          </span>
        </div>
      </div>
    </FluentCard>
  )
}

export default EstimateBox
