import React, { useEffect } from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import ListItem from "@/shared/components/ui/ListItem"
import { TextInput, Radio } from "@/shared/components/ui/inputs"
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
      <h4 className="font-bold">Cấu hình giảm giá</h4>

      {/* Loại giảm (chỉ hiển thị khi ở phạm vi Lớp học vì có lựa chọn giữa % và VNĐ) */}
      {!isCourseScope && (
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            Loại giảm<span className="text-red-500 ml-0.5">*</span>
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
              <span>Theo phần trăm (%)</span>
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
              <span>Số tiền cố định (đ)</span>
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
          label="Giá trị giảm"
          required
          value={form.discountValue}
          onChange={(e) => onChange("discountValue", e.target.value)}
          placeholder={isPercent ? "20" : "200000"}
          rightContent={isPercent ? "%" : "₫"}
          helperText={
            isPercent
              ? "Tối đa 50% theo quy định"
              : lowestTuition
                ? `Phải nhỏ hơn ${formatCurrency(lowestTuition)} (học phí lớp ${lowestTuitionClassName})`
                : undefined
          }
          error={
            errors.discountValue ||
            (isFixedAmountExceeded
              ? `Phải nhỏ hơn học phí lớp thấp nhất trong khóa (${formatCurrency(lowestTuition)} - ${lowestTuitionClassName})`
              : undefined)
          }
        />

        {/* Tối đa (When Percentage) */}
        {isPercent && (
          <TextInput
            type="number"
            label="Mức giảm tối đa"
            required
            value={form.maxDiscountAmount}
            onChange={(e) => onChange("maxDiscountAmount", e.target.value)}
            placeholder="600000"
            rightContent="₫"
            error={errors.maxDiscountAmount}
          />
        )}
      </div>

      {/* Ngân sách tối đa (When Course Scope) */}
      {isCourseScope && (
        <TextInput
          type="number"
          label="Ngân sách tối đa"
          required
          value={form.maxBudget}
          onChange={(e) => onChange("maxBudget", e.target.value)}
          placeholder="10000000"
          rightContent="₫"
          error={errors.maxBudget}
          helperText="Voucher tự động dừng khi tổng tiền đã giảm đạt giới hạn này."
        />
      )}

      {/* Đơn hàng tối thiểu (When Class Scope) */}
      {!isCourseScope && (
        <TextInput
          type="number"
          label="Đơn hàng tối thiểu"
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
