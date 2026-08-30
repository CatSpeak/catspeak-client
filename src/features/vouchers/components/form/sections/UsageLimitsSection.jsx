import React, { useMemo } from "react"
import { Users, Calendar } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"
import { formatCurrency } from "../../../utils/voucherTransforms"

export const UsageLimitsSection = ({
  form,
  errors,
  onChange,
  estimatedDeposit = 0,
  isCourseScope = false,
}) => {
  const { t } = useLanguage()

  // Calculate potential uses supported by Max Budget
  const maxSupportedUses = useMemo(() => {
    const budget = Number(form.maxBudget) || 0
    const discount = Number(form.discountValue) || 0
    if (isCourseScope && budget > 0 && discount > 0) {
      return Math.floor(budget / discount)
    }
    return null
  }, [isCourseScope, form.maxBudget, form.discountValue])

  const usageLimitHelper = useMemo(() => {
    if (isCourseScope) {
      if (maxSupportedUses !== null && maxSupportedUses > 0) {
        return `Tự động tính: ${formatCurrency(Number(form.maxBudget))} ÷ ${formatCurrency(Number(form.discountValue))} = ${maxSupportedUses} lượt sử dụng.`
      }
      return "Tự động tính dựa trên Ngân sách tối đa ÷ Mức giảm."
    }
    return undefined
  }, [isCourseScope, maxSupportedUses, form.maxBudget, form.discountValue])

  const totalUsageError = useMemo(() => {
    if (errors?.totalUsageLimit) return errors.totalUsageLimit
    return undefined
  }, [errors?.totalUsageLimit])

  const displayTotalUsageValue = isCourseScope
    ? maxSupportedUses !== null && maxSupportedUses > 0
      ? String(maxSupportedUses)
      : ""
    : form.totalUsageLimit

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {t?.vouchers?.form?.usageLimits || "Giới hạn sử dụng"}
      </h4>

      {/* Tổng lượt sử dụng */}
      <TextInput
        type="number"
        label={t?.vouchers?.form?.totalUsageLimitLabel || "Tổng lượt sử dụng"}
        required
        min={1}
        disabled={isCourseScope}
        readOnly={isCourseScope}
        value={displayTotalUsageValue}
        onChange={(e) => {
          if (!isCourseScope) {
            onChange("totalUsageLimit", e.target.value)
          }
        }}
        placeholder={
          isCourseScope
            ? "Tự động tính theo ngân sách"
            : "100"
        }
        rightIcon={Users}
        helperText={usageLimitHelper}
        error={totalUsageError}
      />

      {/* Giới hạn theo ngày */}
      <TextInput
        type="number"
        label={t?.vouchers?.form?.dailyLimitLabel || "Giới hạn lượt / ngày"}
        min={1}
        value={form.dailyLimit || ""}
        onChange={(e) => onChange("dailyLimit", e.target.value)}
        placeholder={t?.vouchers?.form?.unlimited || "Không giới hạn"}
        rightIcon={Calendar}
      />
    </FluentCard>
  )
}

export default UsageLimitsSection
