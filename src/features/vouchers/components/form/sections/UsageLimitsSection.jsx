import React from "react"
import { Users, User, Calendar } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"

export const UsageLimitsSection = ({ form, errors, onChange }) => {
  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Giới hạn sử dụng</h4>

      {/* Tổng lượt sử dụng */}
      <TextInput
        type="number"
        label="Tổng lượt sử dụng"
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
        label="Số lượt tối đa/người"
        value={form.perUserLimit || 1}
        onChange={(e) => onChange("perUserLimit", e.target.value)}
        placeholder="1"
        rightIcon={User}
      />

      {/* Giới hạn theo ngày */}
      <TextInput
        type="number"
        label="Giới hạn theo ngày (Tùy chọn)"
        value={form.dailyLimit || ""}
        onChange={(e) => onChange("dailyLimit", e.target.value)}
        placeholder="Không giới hạn"
        rightIcon={Calendar}
      />
    </FluentCard>
  )
}

export default UsageLimitsSection
