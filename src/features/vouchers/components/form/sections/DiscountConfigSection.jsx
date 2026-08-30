import React, { useEffect } from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import ListItem from "@/shared/components/ui/ListItem"
import { TextInput, Radio } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  DISCOUNT_TYPES,
  SCOPE_TYPES,
} from "../../../constants/voucherConstants"
import {
  formatCurrency,
  formatNumberWithDots,
  parseFormattedNumber,
} from "../../../utils/voucherTransforms"

export const DiscountConfigSection = ({
  form,
  errors,
  onChange,
  isCourseScope,
  lowestTuition,
  lowestTuitionClassName,
  isFixedAmountExceeded,
}) => {
  const { t } = useLanguage()
  const vf = t?.vouchers?.form || {}
  const ve = t?.vouchers?.errors || {}
  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE
  const isPercentDisabled = isCourseScope

  const percentVal = Number(form.discountValue) || 0
  const nominalDiscountAmount =
    lowestTuition > 0 && percentVal > 0
      ? Math.round((lowestTuition * percentVal) / 100)
      : 0

  const enteredMaxDiscount = Number(form.maxDiscountAmount) || 0

  const isMaxDiscountExceeded =
    isPercent &&
    lowestTuition > 0 &&
    percentVal > 0 &&
    nominalDiscountAmount > 0 &&
    enteredMaxDiscount > nominalDiscountAmount

  const maxDiscountErrorMessage = isMaxDiscountExceeded
    ? ve.maxDiscountExceedNominal
      ? ve.maxDiscountExceedNominal
          .replace("{{percent}}", percentVal)
          .replace("{{amount}}", formatCurrency(nominalDiscountAmount))
      : `Mức giảm tối đa không được vượt quá ${formatCurrency(nominalDiscountAmount)} (${percentVal}% học phí)`
    : undefined

  // Auto-fill maxDiscountAmount based on percentage and class tuition
  const handleDiscountValueChange = (e) => {
    const raw = isPercent
      ? e.target.value
      : parseFormattedNumber(e.target.value)
    onChange("discountValue", raw)

    if (isPercent && lowestTuition > 0) {
      const pct = Number(raw)
      if (pct >= 1 && pct <= 50) {
        const autoMax = Math.round((lowestTuition * pct) / 100)
        onChange("maxDiscountAmount", String(autoMax))
      } else if (!raw) {
        onChange("maxDiscountAmount", "")
      }
    }
  }

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
                  const pct = Number(form.discountValue)
                  if (lowestTuition > 0 && pct >= 1 && pct <= 50) {
                    const autoMax = Math.round((lowestTuition * pct) / 100)
                    onChange("maxDiscountAmount", String(autoMax))
                  }
                }
              }}
              selected={isPercent}
              disabled={isPercentDisabled}
              leftContent={
                <Radio
                  checked={isPercent}
                  disabled={isPercentDisabled}
                  onChange={() => {
                    if (!isPercentDisabled) {
                      onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
                      const pct = Number(form.discountValue)
                      if (lowestTuition > 0 && pct >= 1 && pct <= 50) {
                        const autoMax = Math.round((lowestTuition * pct) / 100)
                        onChange("maxDiscountAmount", String(autoMax))
                      }
                    }
                  }}
                />
              }
              className={`rounded-xl ${
                isPercentDisabled
                  ? "opacity-40 cursor-not-allowed text-secondary"
                  : ""
              }`}
            >
              <span>{vf.discountPercent || "Theo phần trăm (%)"}</span>
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
              <span>{vf.discountFixed || "Số tiền cố định (VNĐ)"}</span>
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
          type={isPercent ? "number" : "text"}
          inputMode="numeric"
          label={vf.discountValueLabel || "Mức giảm"}
          required
          min={isPercent ? 1 : 2000}
          step={isPercent ? 1 : 1000}
          value={
            isPercent
              ? form.discountValue
              : formatNumberWithDots(form.discountValue)
          }
          onChange={handleDiscountValueChange}
          placeholder={isPercent ? "20" : "200.000"}
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
            type="text"
            inputMode="numeric"
            label={
              vf.maxDiscountAmountLabel ||
              "Mức giảm tối đa (VNĐ)"
            }
            required
            min={2000}
            step={1000}
            value={formatNumberWithDots(form.maxDiscountAmount)}
            onChange={(e) =>
              onChange(
                "maxDiscountAmount",
                parseFormattedNumber(e.target.value),
              )
            }
            placeholder={
              nominalDiscountAmount > 0
                ? formatNumberWithDots(nominalDiscountAmount)
                : "200.000"
            }
            rightContent="₫"
            helperText={
              nominalDiscountAmount > 0
                ? vf.maxDiscountEquivalent
                  ? vf.maxDiscountEquivalent
                      .replace(
                        "{{nominal}}",
                        formatCurrency(nominalDiscountAmount),
                      )
                      .replace("{{percent}}", percentVal)
                      .replace("{{tuition}}", formatCurrency(lowestTuition))
                  : `Tương đương ${formatCurrency(nominalDiscountAmount)} với ${percentVal}% học phí (${formatCurrency(lowestTuition)}).`
                : vf.maxDiscountHelper ||
                  "Số tiền giảm tối đa cho 1 lượt đăng ký (tối thiểu 2.000 ₫)."
            }
            error={errors.maxDiscountAmount || maxDiscountErrorMessage}
          />
        )}
      </div>

      {/* Ngân sách tối đa (When Course Scope) */}
      {isCourseScope && (
        <TextInput
          type="text"
          inputMode="numeric"
          label={
            vf.maxBudgetLabel || "Ngân sách tối đa (VNĐ)"
          }
          required
          min={2000}
          step={1000}
          value={formatNumberWithDots(form.maxBudget)}
          onChange={(e) =>
            onChange("maxBudget", parseFormattedNumber(e.target.value))
          }
          placeholder="10.000.000"
          rightContent="₫"
          helperText={
            vf.maxBudgetHelper ||
            "Voucher tự động dừng khi tổng tiền đã giảm đạt giới hạn này (tối thiểu 2.000 ₫)."
          }
          error={errors.maxBudget}
        />
      )}
    </FluentCard>
  )
}

export default DiscountConfigSection
