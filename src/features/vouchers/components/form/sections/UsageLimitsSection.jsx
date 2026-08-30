import React from "react"
import { Users, User, Calendar } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"

export const UsageLimitsSection = ({ form, errors, onChange }) => {
  const { t } = useLanguage()

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
        value={form.totalUsageLimit}
        onChange={(e) => onChange("totalUsageLimit", e.target.value)}
        placeholder="100"
        rightIcon={Users}
        error={errors?.totalUsageLimit}
      />

      {/* Số lượt tối đa/người */}
      <TextInput
        type="number"
        label={t?.vouchers?.form?.perUserLimitLabel || "Lượt dùng / học viên"}
        required
        value={form.perUserLimit || 1}
        onChange={(e) => onChange("perUserLimit", e.target.value)}
        placeholder="1"
        rightIcon={User}
        error={errors?.perUserLimit}
      />

      {/* Giới hạn theo ngày */}
      <TextInput
        type="number"
        label={t?.vouchers?.form?.dailyLimitLabel || "Giới hạn lượt / ngày"}
        value={form.dailyLimit || ""}
        onChange={(e) => onChange("dailyLimit", e.target.value)}
        placeholder={t?.vouchers?.form?.unlimited || "Không giới hạn"}
        rightIcon={Calendar}
      />
    </FluentCard>
  )
}

export default UsageLimitsSection
