import React, { useEffect } from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Banner from "@/shared/components/ui/Banner"
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

      {/* Loại giảm */}
      <div className="flex flex-col gap-1">
        <span className="text-xs">
          Loại giảm<span className="text-red-500 ml-0.5">*</span>
        </span>

        <div className="flex flex-col">
          <div
            onClick={() => {
              if (!isPercentDisabled) {
                onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
              }
            }}
            className={`group flex items-center gap-2 select-none ${
              isPercentDisabled
                ? "opacity-40 cursor-not-allowed text-secondary"
                : "cursor-pointer"
            }`}
          >
            <Radio
              withWrapper
              checked={isPercent}
              disabled={isPercentDisabled}
              onChange={() =>
                onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
              }
            />
            <span>Theo phần trăm (%)</span>
          </div>

          <div
            onClick={() =>
              onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
            }
            className="group flex items-center gap-2 cursor-pointer select-none"
          >
            <Radio
              withWrapper
              checked={!isPercent}
              onChange={() =>
                onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
              }
            />
            <span>Số tiền cố định (đ)</span>
          </div>
        </div>

        {/* Course Scope Notice for Locked Fixed Amount */}
        {isCourseScope && (
          <Banner variant="info">
            Khóa học có nhiều lớp với học phí khác nhau. Chỉ hỗ trợ số tiền cố
            định để đảm bảo tính chính xác khi nạp cọc.
          </Banner>
        )}
      </div>

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
            label="Tối đa"
            required
            value={form.maxDiscountAmount}
            onChange={(e) => onChange("maxDiscountAmount", e.target.value)}
            placeholder="600000"
            rightContent="₫"
            error={errors.maxDiscountAmount}
          />
        )}
      </div>

      {/* Percentage Warning Banner */}
      {isPercent && (
        <Banner variant="warning" className="text-xs">
          Giảm tối đa 50% theo quy định nền tảng.
        </Banner>
      )}

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
