import React, { useEffect } from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import ListItem from "@/shared/components/ui/ListItem"
import { TextInput, Radio } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  DISCOUNT_TYPES,
  SCOPE_TYPES,
} from "../../../constants/voucherConstants"
import { formatCurrency } from "../../../utils/voucherTransforms"

export const DiscountConfigSection = ({
  form,
  errors,
  onChange,
  isCourseScope,
  isInitialClassContext,
  lowestTuition,
  lowestTuitionClassName,
  isFixedAmountExceeded,
}) => {
  const { t } = useLanguage()
  const vf = t?.vouchers?.form || {}
  const ve = t?.vouchers?.errors || {}
  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE
  const isPercentDisabled =
    isCourseScope ||
    (!isInitialClassContext && form.scopeType !== SCOPE_TYPES.SPECIFIC_CLASSES)

  // Automatically sync and switch to Fixed Amount if Percentage discount is disabled for course scope
  useEffect(() => {
    if (isPercentDisabled && form.discountType === DISCOUNT_TYPES.PERCENTAGE) {
      onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
    }
  }, [isPercentDisabled, form.discountType, onChange])

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {vf.discountConfig || "Cấu hình giảm giá"}
      </h4>

      {/* Loại giảm */}
      {!isCourseScope && (
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            {vf.discountTypeLabel || "Loại giảm"}
            <span className="text-red-500 ml-0.5">*</span>
          </span>

          <div className="space-y-1">
            <ListItem
              lines={1}
              onClick={() => {
                if (!isPercentDisabled) {
                  onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
                }
              }}
              selected={isPercent}
              disabled={isPercentDisabled}
              leftContent={
                <Radio
                  checked={isPercent}
                  disabled={isPercentDisabled}
                  onChange={() =>
                    onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
                  }
                />
              }
              className={`rounded-xl ${
                isPercentDisabled
                  ? "opacity-40 cursor-not-allowed text-secondary"
                  : ""
              }`}
            >
              <span>
                {vf.discountPercent || "Theo phần trăm (%)"}
              </span>
            </ListItem>

            <ListItem
              lines={1}
              onClick={() =>
                onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
              }
              selected={!isPercent}
              leftContent={
                <Radio
                  checked={!isPercent}
                  onChange={() =>
                    onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
                  }
                />
              }
              className="rounded-xl"
            >
              <span>
                {vf.discountFixed || "Số tiền cố định (VNĐ)"}
              </span>
            </ListItem>
          </div>
        </div>
      )}

      {/* Inputs Row */}
      <div
        className={
          isPercent ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "w-full"
        }
      >
        {/* Giá trị giảm */}
        <TextInput
          type="number"
          label={vf.discountValueLabel || "Mức giảm"}
          required
          min={isPercent ? 1 : 2000}
          step={isPercent ? 1 : 1000}
          value={form.discountValue}
          onChange={(e) => onChange("discountValue", e.target.value)}
          placeholder={isPercent ? "20" : "200000"}
          rightContent={isPercent ? "%" : "₫"}
          helperText={
            isPercent
              ? ve.percentRange ||
                "Giáo viên chỉ được tạo voucher giảm từ 1% đến 50%"
              : lowestTuition
                ? vf.lowestTuitionHint
                  ? vf.lowestTuitionHint
                      .replace("{{amount}}", formatCurrency(lowestTuition))
                      .replace("{{className}}", lowestTuitionClassName)
                  : `Tối thiểu 2.000 ₫ và nhỏ hơn ${formatCurrency(lowestTuition)} (học phí lớp ${lowestTuitionClassName})`
                : vf.minTwoThousand || "Tối thiểu 2.000 ₫"
          }
          error={
            errors.discountValue ||
            (isFixedAmountExceeded
              ? ve.fixedExceeded ||
                "Mức giảm cố định không được lớn hơn hoặc bằng học phí lớp học"
              : undefined)
          }
        />

        {/* Tối đa (When Percentage) */}
        {isPercent && (
          <TextInput
            type="number"
            label={
              vf.maxDiscountAmountLabel ||
              "Mức giảm tối đa (VNĐ)"
            }
            required
            min={2000}
            step={1000}
            value={form.maxDiscountAmount}
            onChange={(e) => onChange("maxDiscountAmount", e.target.value)}
            placeholder="600000"
            rightContent="₫"
            helperText={vf.minTwoThousand || "Tối thiểu 2.000 ₫"}
            error={errors.maxDiscountAmount}
          />
        )}
      </div>

      {/* Ngân sách tối đa (When Course Scope) */}
      {isCourseScope && (
        <TextInput
          type="number"
          label={
            vf.maxBudgetLabel || "Ngân sách tối đa (VNĐ)"
          }
          required
          min={2000}
          step={1000}
          value={form.maxBudget}
          onChange={(e) => onChange("maxBudget", e.target.value)}
          placeholder="10000000"
          rightContent="₫"
          helperText={vf.minTwoThousand || "Tối thiểu 2.000 ₫"}
          error={errors.maxBudget}
        />
      )}

      {/* Đơn hàng tối thiểu (When Class Scope) */}
      {!isCourseScope && (
        <TextInput
          type="number"
          label={
            vf.minOrderAmountLabel ||
            "Đơn hàng tối thiểu (VNĐ)"
          }
          value={form.minOrderAmount}
          onChange={(e) => onChange("minOrderAmount", e.target.value)}
          placeholder="0"
          rightContent="₫"
        />
      )}
    </FluentCard>
  )
}

export default DiscountConfigSection
