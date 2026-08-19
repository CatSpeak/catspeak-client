import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"

export const ValiditySection = ({ form, errors, onChange }) => {
  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Thời gian hiệu lực</h4>

      {/* Ngày bắt đầu */}
      <TextInput
        type="date"
        label="Ngày bắt đầu"
        required
        value={form.validFrom || ""}
        onChange={(e) => onChange("validFrom", e.target.value)}
        error={errors?.validFrom}
      />

      {/* Ngày kết thúc */}
      <TextInput
        type="date"
        label="Ngày kết thúc"
        disabled={Boolean(form.isNeverExpired)}
        value={form.validTo || ""}
        onChange={(e) => onChange("validTo", e.target.value)}
        error={errors?.validTo}
      />

      {/* Checkbox Không giới hạn */}
      <label className="flex items-center gap-2.5 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={Boolean(form.isNeverExpired)}
          onChange={(e) => onChange("isNeverExpired", e.target.checked)}
          className="w-4 h-4 rounded text-cath-red-700 focus:ring-cath-red-500 cursor-pointer"
        />
        <span className="text-xs text-slate-700 font-medium">
          Không giới hạn
        </span>
      </label>
    </FluentCard>
  )
}

export default ValiditySection
