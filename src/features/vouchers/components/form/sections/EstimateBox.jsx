import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatCurrency } from "../../../utils/voucherTransforms"

export const EstimateBox = ({
  form,
  sampleOriginalTuition,
  discountAmountForOne,
  platformFee,
  teacherReceives,
  isPercent,
}) => {
  const { t } = useLanguage()
  const vf = t?.vouchers?.form || {}

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {vf.estimateTitle || "Ước tính (1 học viên)"}
      </h4>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>
            {vf.sampleTuition || "Học phí lớp mẫu:"}
          </span>
          <span>{formatCurrency(sampleOriginalTuition)}</span>
        </div>

        <div className="flex justify-between text-cath-red-700">
          <span>
            {vf.discountForOne || "Giảm giá học viên"} (
            {isPercent ? `${form.discountValue || 0}%` : (vf.fixedShort || "Cố định")}):
          </span>
          <span>-{formatCurrency(discountAmountForOne)}</span>
        </div>

        <div className="flex justify-between">
          <span>
            {vf.platformFee || "Phí nền tảng (10% gốc):"}
          </span>
          <span>-{formatCurrency(platformFee)}</span>
        </div>

        <Divider className="!my-4" />

        <div className="flex justify-between items-baseline">
          <span className="font-bold">
            {vf.teacherReceives || "Giảng viên thực nhận:"}
          </span>
          <span className="font-bold text-lg">
            {formatCurrency(teacherReceives)}
          </span>
        </div>
      </div>
    </FluentCard>
  )
}

export default EstimateBox
